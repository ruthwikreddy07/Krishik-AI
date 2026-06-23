"""
Government Schemes API — Central & Telangana state agricultural schemes lookup.
Supports full CRUD management by Administrators.
"""
import httpx
import json
import logging
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.config import settings
from ..models.schemas import GovernmentScheme, Staff
from .auth import verify_admin

logger = logging.getLogger("farmer_assistant")
router = APIRouter(prefix="/api/schemes", tags=["Government Schemes"])


# ── Gemini Translation Helper ────────────────────────────────

def translate_scheme_to_languages(
    title: str,
    description: str,
    eligibility_criteria: str,
    benefits: str,
    authority: str | None = None,
    documents: str | None = None
) -> dict:
    """
    Translates the scheme details into Telugu and Hindi using Gemini API.
    Returns a dictionary with translated fields. If API call fails or key is missing,
    falls back gracefully to returning the original English values.
    """
    fallback_result = {
        "title_telugu": title,
        "title_hindi": title,
        "description_telugu": description,
        "description_hindi": description,
        "eligibility_criteria_telugu": eligibility_criteria,
        "eligibility_criteria_hindi": eligibility_criteria,
        "benefits_telugu": benefits,
        "benefits_hindi": benefits,
        "authority_telugu": authority,
        "authority_hindi": authority,
        "documents_telugu": documents,
        "documents_hindi": documents
    }

    if not settings.GEMINI_API_KEY:
        logger.warning("Gemini API key is not configured. Falling back to English text for translations.")
        return fallback_result

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
    
    scheme_data = {
        "title": title,
        "description": description,
        "eligibility_criteria": eligibility_criteria,
        "benefits": benefits,
        "authority": authority or "",
        "documents": documents or ""
    }
    
    prompt = (
        "You are an expert translator. Translate the following agricultural scheme details from English into both Telugu and Hindi.\n"
        "Return the translations strictly as a JSON object with the exact keys specified in the schema below.\n"
        "Do not include any Markdown wrap, code blocks, or additional explanation. Return ONLY the raw JSON.\n\n"
        "Target JSON Schema:\n"
        "{\n"
        '  "title_telugu": "translated title in Telugu",\n'
        '  "title_hindi": "translated title in Hindi",\n'
        '  "description_telugu": "translated description in Telugu",\n'
        '  "description_hindi": "translated description in Hindi",\n'
        '  "eligibility_criteria_telugu": "translated eligibility criteria in Telugu",\n'
        '  "eligibility_criteria_hindi": "translated eligibility criteria in Hindi",\n'
        '  "benefits_telugu": "translated benefits in Telugu",\n'
        '  "benefits_hindi": "translated benefits in Hindi",\n'
        '  "authority_telugu": "translated authority in Telugu",\n'
        '  "authority_hindi": "translated authority in Hindi",\n'
        '  "documents_telugu": "translated documents in Telugu",\n'
        '  "documents_hindi": "translated documents in Hindi"\n'
        "}\n\n"
        f"Input Scheme Data:\n{json.dumps(scheme_data, indent=2)}"
    )

    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.2
        }
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    content = candidates[0].get("content", {})
                    parts = content.get("parts", [])
                    if parts:
                        reply_text = parts[0].get("text", "").strip()
                        if reply_text:
                            translated_data = json.loads(reply_text)
                            final_result = {}
                            for k, v in fallback_result.items():
                                final_result[k] = translated_data.get(k) or v
                            return final_result
                logger.warning(f"Gemini API returned unexpected structure or empty translation: {data}")
            else:
                logger.error(f"Gemini API translation request failed with status {resp.status_code}: {resp.text}")
    except Exception as e:
        logger.exception(f"Exception during Gemini scheme translation: {e}")

    return fallback_result


# ── Pydantic models ─────────────────────────────────────────

class SchemeResponse(BaseModel):
    id: int
    title: str
    description: str
    eligibility_criteria: str
    benefits: str
    scheme_type: str  # "State" or "Central"
    authority: str | None
    documents: str | None

    # Translation Fields
    title_telugu: str | None = None
    title_hindi: str | None = None
    description_telugu: str | None = None
    description_hindi: str | None = None
    eligibility_criteria_telugu: str | None = None
    eligibility_criteria_hindi: str | None = None
    benefits_telugu: str | None = None
    benefits_hindi: str | None = None
    authority_telugu: str | None = None
    authority_hindi: str | None = None
    documents_telugu: str | None = None
    documents_hindi: str | None = None

    # Dynamic Eligibility Rules
    min_land_acres: float | None = None
    max_land_acres: float | None = None
    min_age: int | None = None
    max_age: int | None = None
    allowed_caste: str | None = "All"

    class Config:
        from_attributes = True


class SchemeCreateRequest(BaseModel):
    title: str
    description: str
    eligibility_criteria: str
    benefits: str
    scheme_type: str  # "State" or "Central"
    authority: str | None = None
    documents: str | None = None

    # Dynamic Eligibility Rules
    min_land_acres: float | None = None
    max_land_acres: float | None = None
    min_age: int | None = None
    max_age: int | None = None
    allowed_caste: str | None = "All"


class SchemeUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    eligibility_criteria: str | None = None
    benefits: str | None = None
    scheme_type: str | None = None
    authority: str | None = None
    documents: str | None = None

    # Dynamic Eligibility Rules
    min_land_acres: float | None = None
    max_land_acres: float | None = None
    min_age: int | None = None
    max_age: int | None = None
    allowed_caste: str | None = None


# ── Endpoints ───────────────────────────────────────────────

@router.get("", response_model=list[SchemeResponse])
def list_schemes(
    scheme_type: str | None = Query(None, description="Filter: 'State' or 'Central'"),
    db: Session = Depends(get_db),
):
    """List all available government agricultural schemes."""
    query = db.query(GovernmentScheme)
    if scheme_type:
        query = query.filter(GovernmentScheme.scheme_type == scheme_type)
    return query.all()


@router.get("/{scheme_id}", response_model=SchemeResponse)
def get_scheme(scheme_id: int, db: Session = Depends(get_db)):
    """Get details of a specific government scheme."""
    scheme = db.query(GovernmentScheme).filter(GovernmentScheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return scheme


@router.post("", response_model=SchemeResponse, status_code=status.HTTP_201_CREATED)
def create_scheme(
    req: SchemeCreateRequest,
    current_staff: Staff = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Create a new government scheme (Admin only) with AI auto-translations."""
    # Call Gemini to translate fields to Telugu and Hindi
    translations = translate_scheme_to_languages(
        title=req.title,
        description=req.description,
        eligibility_criteria=req.eligibility_criteria,
        benefits=req.benefits,
        authority=req.authority,
        documents=req.documents
    )

    scheme = GovernmentScheme(
        title=req.title,
        description=req.description,
        eligibility_criteria=req.eligibility_criteria,
        benefits=req.benefits,
        scheme_type=req.scheme_type,
        authority=req.authority,
        documents=req.documents,
        
        # Translations
        title_telugu=translations["title_telugu"],
        title_hindi=translations["title_hindi"],
        description_telugu=translations["description_telugu"],
        description_hindi=translations["description_hindi"],
        eligibility_criteria_telugu=translations["eligibility_criteria_telugu"],
        eligibility_criteria_hindi=translations["eligibility_criteria_hindi"],
        benefits_telugu=translations["benefits_telugu"],
        benefits_hindi=translations["benefits_hindi"],
        authority_telugu=translations["authority_telugu"],
        authority_hindi=translations["authority_hindi"],
        documents_telugu=translations["documents_telugu"],
        documents_hindi=translations["documents_hindi"],

        # Eligibility parameters
        min_land_acres=req.min_land_acres,
        max_land_acres=req.max_land_acres,
        min_age=req.min_age,
        max_age=req.max_age,
        allowed_caste=req.allowed_caste
    )
    db.add(scheme)
    db.commit()
    db.refresh(scheme)
    return scheme


@router.put("/{scheme_id}", response_model=SchemeResponse)
def update_scheme(
    scheme_id: int,
    req: SchemeUpdateRequest,
    current_staff: Staff = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Update an existing government scheme (Admin only) with AI auto-translations."""
    scheme = db.query(GovernmentScheme).filter(GovernmentScheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
        
    update_data = req.model_dump(exclude_unset=True)
    
    content_fields = ["title", "description", "eligibility_criteria", "benefits", "authority", "documents"]
    content_changed = any(field in update_data for field in content_fields)
    
    for field, value in update_data.items():
        setattr(scheme, field, value)

    if content_changed:
        translations = translate_scheme_to_languages(
            title=scheme.title,
            description=scheme.description,
            eligibility_criteria=scheme.eligibility_criteria,
            benefits=scheme.benefits,
            authority=scheme.authority,
            documents=scheme.documents
        )
        scheme.title_telugu = translations["title_telugu"]
        scheme.title_hindi = translations["title_hindi"]
        scheme.description_telugu = translations["description_telugu"]
        scheme.description_hindi = translations["description_hindi"]
        scheme.eligibility_criteria_telugu = translations["eligibility_criteria_telugu"]
        scheme.eligibility_criteria_hindi = translations["eligibility_criteria_hindi"]
        scheme.benefits_telugu = translations["benefits_telugu"]
        scheme.benefits_hindi = translations["benefits_hindi"]
        scheme.authority_telugu = translations["authority_telugu"]
        scheme.authority_hindi = translations["authority_hindi"]
        scheme.documents_telugu = translations["documents_telugu"]
        scheme.documents_hindi = translations["documents_hindi"]
        
    db.commit()
    db.refresh(scheme)
    return scheme


@router.delete("/{scheme_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scheme(
    scheme_id: int,
    current_staff: Staff = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Delete a government scheme (Admin only)."""
    scheme = db.query(GovernmentScheme).filter(GovernmentScheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
        
    db.delete(scheme)
    db.commit()
    return
