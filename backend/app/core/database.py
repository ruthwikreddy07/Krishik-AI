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
    from ..models.schemas import Base, MarketPrice, GovernmentScheme
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

        # Self-healing migration for missing authority/documents in government_schemes
        try:
            conn.execute(text("SELECT authority, documents FROM government_schemes LIMIT 1"))
        except Exception:
            try:
                print("Schema drift detected: Columns 'authority' or 'documents' are missing in 'government_schemes'. Altering table...")
                conn.execute(text("ALTER TABLE government_schemes ADD COLUMN authority VARCHAR(150) NULL"))
                conn.execute(text("ALTER TABLE government_schemes ADD COLUMN documents TEXT NULL"))
                conn.commit()
                print("Successfully migrated 'government_schemes' table.")
            except Exception as e:
                print(f"Failed to migrate 'government_schemes' table: {e}")

        # Self-healing migration for missing translation and dynamic eligibility columns in government_schemes
        try:
            conn.execute(text("SELECT title_telugu, min_land_acres FROM government_schemes LIMIT 1"))
        except Exception:
            try:
                print("Schema drift detected: Translation or dynamic eligibility columns are missing in 'government_schemes'. Altering table...")
                alter_queries = [
                    "ALTER TABLE government_schemes ADD COLUMN title_telugu VARCHAR(255) NULL",
                    "ALTER TABLE government_schemes ADD COLUMN title_hindi VARCHAR(255) NULL",
                    "ALTER TABLE government_schemes ADD COLUMN description_telugu TEXT NULL",
                    "ALTER TABLE government_schemes ADD COLUMN description_hindi TEXT NULL",
                    "ALTER TABLE government_schemes ADD COLUMN eligibility_criteria_telugu TEXT NULL",
                    "ALTER TABLE government_schemes ADD COLUMN eligibility_criteria_hindi TEXT NULL",
                    "ALTER TABLE government_schemes ADD COLUMN benefits_telugu TEXT NULL",
                    "ALTER TABLE government_schemes ADD COLUMN benefits_hindi TEXT NULL",
                    "ALTER TABLE government_schemes ADD COLUMN authority_telugu VARCHAR(150) NULL",
                    "ALTER TABLE government_schemes ADD COLUMN authority_hindi VARCHAR(150) NULL",
                    "ALTER TABLE government_schemes ADD COLUMN documents_telugu TEXT NULL",
                    "ALTER TABLE government_schemes ADD COLUMN documents_hindi TEXT NULL",
                    "ALTER TABLE government_schemes ADD COLUMN min_land_acres DECIMAL(5, 2) NULL",
                    "ALTER TABLE government_schemes ADD COLUMN max_land_acres DECIMAL(5, 2) NULL",
                    "ALTER TABLE government_schemes ADD COLUMN min_age INT NULL",
                    "ALTER TABLE government_schemes ADD COLUMN max_age INT NULL",
                    "ALTER TABLE government_schemes ADD COLUMN allowed_caste VARCHAR(100) NULL DEFAULT 'All'"
                ]
                for query in alter_queries:
                    try:
                        conn.execute(text(query))
                    except Exception as col_err:
                        print(f"Skipping alter column check: {col_err}")
                conn.commit()
                print("Successfully migrated translation and eligibility columns in 'government_schemes'.")
            except Exception as e:
                print(f"Failed to migrate 'government_schemes' translation/eligibility columns: {e}")

    # Seed/Reset government_schemes if empty or if containing garbled characters or missing column/eligibility data
    db = SessionLocal()
    try:
        schemes = db.query(GovernmentScheme).all()
        has_garbled = any("Ó" in s.title for s in schemes)
        has_missing_data = any(s.authority is None or s.min_land_acres is None for s in schemes) if schemes else False
        if len(schemes) == 0 or has_garbled or has_missing_data:
            print("Database has garbled, missing data, or empty government schemes. Re-seeding...")
            db.query(GovernmentScheme).delete()
            db.commit()
            
            gov_schemes = [
                GovernmentScheme(
                    title="Rythu Bandhu (రైతుబంధు)",
                    description="Investment support scheme providing financial assistance to farmers for crop cultivation. The government deposits money directly into farmer bank accounts before every crop season.",
                    eligibility_criteria="Must own agricultural land in Telangana. Land records must be updated in the Dharani portal. Both tenant and owner farmers are eligible.",
                    benefits="Rs. 10,000 per acre per crop season (Rs. 5,000 per acre per season × 2 seasons/year). Direct bank transfer before Kharif and Rabi seasons.",
                    scheme_type="State",
                    authority="Telangana Government",
                    documents="Pattadar Dharani Passbook, Aadhaar Card, Bank Account Details linked with Aadhaar",
                    min_land_acres=0.1,
                    max_land_acres=999.0,
                    min_age=18,
                    max_age=120,
                    allowed_caste="All"
                ),
                GovernmentScheme(
                    title="Rythu Bima (రైతుబీమా)",
                    description="Life insurance scheme for Telangana farmers. Provides Rs. 5 lakh insurance coverage to farmers aged 18-59 years in case of death due to any reason.",
                    eligibility_criteria="Must be a farmer aged 18-59 years registered in Telangana. Enrolled Rythu Bandhu beneficiaries are automatically covered.",
                    benefits="Rs. 5,00,000 life insurance coverage. Premium paid entirely by the Telangana government. Claim settlement within 10 days.",
                    scheme_type="State",
                    authority="Telangana Government",
                    documents="Aadhaar Card, Land Pattadar Passbook, Nominee Details & Age Proof",
                    min_land_acres=0.0,
                    max_land_acres=999.0,
                    min_age=18,
                    max_age=59,
                    allowed_caste="All"
                ),
                GovernmentScheme(
                    title="Rythu Vedika (రైతు వేదిక)",
                    description="Community meeting halls built in every village cluster for farmers to gather, share knowledge, and receive training from agricultural officers.",
                    eligibility_criteria="All farmers in Telangana. No specific eligibility — open community facility.",
                    benefits="Free venue for farmer meetings, training programs, and agricultural awareness sessions. Access to agricultural officers and experts.",
                    scheme_type="State",
                    authority="Telangana Government",
                    documents="Aadhaar Card, Farmer Registration ID",
                    min_land_acres=0.0,
                    max_land_acres=999.0,
                    min_age=18,
                    max_age=120,
                    allowed_caste="All"
                ),
                GovernmentScheme(
                    title="Telangana Micro Irrigation Project",
                    description="Subsidized drip and sprinkler irrigation systems to promote water conservation and improve crop yields.",
                    eligibility_criteria="Farmers with minimum 0.5 acres of agricultural land. Priority for SC/ST/small/marginal farmers.",
                    benefits="Up to 90% subsidy on drip irrigation systems. Up to 75% subsidy on sprinkler systems. Free technical guidance for installation.",
                    scheme_type="State",
                    authority="Telangana Government",
                    documents="Land Documents, Pattadar Passbook, Soil & Water Suitability Certificate",
                    min_land_acres=0.5,
                    max_land_acres=999.0,
                    min_age=18,
                    max_age=120,
                    allowed_caste="All"
                ),
                GovernmentScheme(
                    title="PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
                    description="Income support to all landholding farmer families across the country to supplement financial needs for crop cultivation.",
                    eligibility_criteria="All landholding farmer families with cultivable land. Must have Aadhaar-linked bank account. Excludes institutional landholders and high-income farmers.",
                    benefits="Rs. 6,000 per year in three equal installments of Rs. 2,000 each. Direct bank transfer.",
                    scheme_type="Central",
                    authority="Central Government",
                    documents="Aadhaar Card, Landholding Documents, Bank Passbook Photocopy",
                    min_land_acres=0.1,
                    max_land_acres=5.0,
                    min_age=18,
                    max_age=120,
                    allowed_caste="All"
                ),
                GovernmentScheme(
                    title="Pradhan Mantri Fasal Bima Yojana (PMFBY)",
                    description="Crop insurance scheme to provide comprehensive insurance coverage against crop loss due to natural calamities, pests, and diseases.",
                    eligibility_criteria="All farmers including sharecroppers and tenant farmers. Both loanee and non-loanee farmers are eligible.",
                    benefits="Premium: 2% for Kharif, 1.5% for Rabi, 5% for commercial/horticulture crops. Full sum insured for crop damage. Post-harvest loss coverage for 14 days.",
                    scheme_type="Central",
                    authority="Central Government",
                    documents="Land Sowing Certificate, Land Rent Agreement (if tenant), Bank Passbook, Aadhaar Card",
                    min_land_acres=0.1,
                    max_land_acres=999.0,
                    min_age=18,
                    max_age=120,
                    allowed_caste="All"
                ),
                GovernmentScheme(
                    title="Kisan Credit Card (KCC)",
                    description="Provides timely and adequate credit to farmers for their crop production, post-harvest needs, and farm maintenance requirements.",
                    eligibility_criteria="All farmers, tenant farmers, sharecroppers, and self-help groups. Must have agricultural land or allied activities (dairy, fisheries, etc.).",
                    benefits="Credit limit up to Rs. 3 lakh at 4% interest rate (after government subsidy). Flexible repayment. Covers crop cultivation, post-harvest, and farm equipment.",
                    scheme_type="Central",
                    authority="Central Government",
                    documents="Land Ownership Proof, Aadhaar Card, PAN Card, Bank Statement",
                    min_land_acres=0.1,
                    max_land_acres=999.0,
                    min_age=18,
                    max_age=120,
                    allowed_caste="All"
                ),
                GovernmentScheme(
                    title="Soil Health Card Scheme",
                    description="Provides soil health cards to farmers every 2 years with information on nutrient status and recommendations for fertilizer application.",
                    eligibility_criteria="All farmers across India. Free of cost.",
                    benefits="Free soil testing. Detailed soil health report with nutrient levels (N, P, K, pH, organic carbon). Customized fertilizer recommendations to improve soil fertility.",
                    scheme_type="Central",
                    authority="Central Government",
                    documents="Soil Sample Location Details, Farmer ID Card",
                    min_land_acres=0.0,
                    max_land_acres=999.0,
                    min_age=18,
                    max_age=120,
                    allowed_caste="All"
                ),
                GovernmentScheme(
                    title="e-NAM (National Agriculture Market)",
                    description="Online trading portal connecting APMC mandis across India to create a unified national market for agricultural commodities.",
                    eligibility_criteria="All farmers, traders, commission agents. Registration through local APMC mandi.",
                    benefits="Real-time price discovery across mandis. Direct payment to farmer bank account. Reduced intermediary costs. Better price realization.",
                    scheme_type="Central",
                    authority="Central Government",
                    documents="Farmer Registration Proof, Mandi Gate Entry Slip, Bank Details",
                    min_land_acres=0.0,
                    max_land_acres=999.0,
                    min_age=18,
                    max_age=120,
                    allowed_caste="All"
                ),
                GovernmentScheme(
                    title="Paramparagat Krishik Vikas Yojana (PKVY)",
                    description="Promotes organic farming through cluster approach and PGS (Participatory Guarantee System) certification.",
                    eligibility_criteria="Farmer groups (clusters of 50+ farmers with 50 acres). Priority for tribal and northeastern regions.",
                    benefits="Rs. 50,000 per hectare over 3 years for organic inputs, certification, and marketing. Free PGS organic certification.",
                    scheme_type="Central",
                    authority="Central Government",
                    documents="Group / Cluster Registration Proof, Aadhaar Card, Land Details",
                    min_land_acres=0.1,
                    max_land_acres=999.0,
                    min_age=18,
                    max_age=120,
                    allowed_caste="All"
                )
            ]
            db.bulk_save_objects(gov_schemes)
            db.commit()
            print(f"Successfully seeded/repaired {len(gov_schemes)} government schemes in database.")
    except Exception as e:
        print(f"Error seeding government schemes: {e}")
    finally:
        db.close()

    # Seed default Staff (Admin & Expert) if empty
    db = SessionLocal()
    try:
        import bcrypt
        from ..models.schemas import Staff
        
        if db.query(Staff).count() == 0:
            print("Seeding default staff accounts...")
            admin_pwd = bcrypt.hashpw("admin123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            expert_pwd = bcrypt.hashpw("expert123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            
            staff_members = [
                Staff(
                    name="System Admin",
                    email="admin@gmail.com",
                    password_hash=admin_pwd,
                    role="admin"
                ),
                Staff(
                    name="Agri Expert",
                    email="expert@gmail.com",
                    password_hash=expert_pwd,
                    role="expert"
                )
            ]
            db.bulk_save_objects(staff_members)
            db.commit()
            print("Successfully seeded staff accounts.")
    except Exception as e:
        print(f"Error seeding staff accounts: {e}")
    finally:
        db.close()

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
