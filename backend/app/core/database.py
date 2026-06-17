from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from .config import settings

# Create the SQLAlchemy engine connected to MySQL via PyMySQL
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,     # Verify connections before using them
    pool_size=10,
    max_overflow=20,
    echo=settings.DEBUG,    # Log SQL queries in debug mode
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
    from ..models.schemas import Base
    Base.metadata.create_all(bind=engine)
