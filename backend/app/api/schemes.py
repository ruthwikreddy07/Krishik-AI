"""
Government Schemes API — Central & Telangana state agricultural schemes lookup.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..models.schemas import GovernmentScheme

router = APIRouter(prefix="/api/schemes", tags=["Government Schemes"])


# ── Pydantic models ─────────────────────────────────────────

class SchemeResponse(BaseModel):
    id: int
    title: str
    description: str
    eligibility_criteria: str
    benefits: str
    scheme_type: str  # "State" or "Central"

    class Config:
        from_attributes = True


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
