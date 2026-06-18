from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from .config import settings

# Create the SQLAlchemy engine connected to MySQL via PyMySQL
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,     # Verify connections before using them
    pool_size=2,            # Keep pool size low for Clever Cloud free tier (5 max connections limit)
    max_overflow=0,         # Do not allow overflow connections
    echo=settings.DEBUG,    # Log SQL queries in debug mode
    connect_args={"connect_timeout": 3},  # Raise timeout exceptions quickly
)

# Session factory — each request gets its own session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """
    FastAPI dependency that provides a database session per request.
    Automatically closes the session when the request is done.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> bool:
    """Test database connectivity. Returns True if connected, False otherwise."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False


def init_db():
    """Create all tables defined in the ORM models if they don't exist."""
    from ..models.schemas import Base, MarketPrice
    Base.metadata.create_all(bind=engine)

    # Self-healing migration for missing duration_days column
    with engine.connect() as conn:
        try:
            conn.execute(text("SELECT duration_days FROM crops LIMIT 1"))
        except Exception:
            try:
                print("Schema drift detected: Column 'duration_days' is missing in 'crops'. Altering table...")
                conn.execute(text("ALTER TABLE crops ADD COLUMN duration_days INT NOT NULL DEFAULT 120"))
                conn.commit()
                print("Successfully migrated 'crops' table.")
            except Exception as e:
                print(f"Failed to migrate database schema: {e}")

    # Seed market_prices from CSV if table is empty
    import os
    import csv
    from datetime import datetime

    db = SessionLocal()
    try:
        if db.query(MarketPrice).count() == 0:
            # Locate market_prices.csv
            possible_paths = [
                os.path.join(os.getcwd(), "ml_training", "datasets", "market_prices.csv"),
                os.path.join(os.getcwd(), "..", "ml_training", "datasets", "market_prices.csv"),
                os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml_training", "datasets", "market_prices.csv"))
            ]
            csv_path = None
            for p in possible_paths:
                if os.path.exists(p):
                    csv_path = p
                    break
            
            if csv_path:
                print(f"Seeding market_prices table from {csv_path}...")
                with open(csv_path, mode="r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    records = []
                    for row in reader:
                        try:
                            # Parse date YYYY-MM-DD
                            price_date = datetime.strptime(row['date'].strip(), "%Y-%m-%d").date()
                            records.append(MarketPrice(
                                crop_name=row['crop_name'].strip(),
                                mandi_name=row['mandi_name'].strip(),
                                price=float(row['price'].strip()),
                                price_date=price_date
                            ))
                        except Exception:
                            continue
                    if records:
                        db.bulk_save_objects(records)
                        db.commit()
                        print(f"Successfully seeded {len(records)} market price records into database.")
            else:
                print("Could not locate market_prices.csv for seeding.")
    except Exception as e:
        print(f"Error seeding database market_prices: {e}")
    finally:
        db.close()
