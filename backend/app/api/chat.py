"""
AI Chat API — Profile-injected Gemini personal assistant.

Every response is personalized using the farmer's complete context:
profile, soil data, current crop, ML prediction history, disease records,
live weather, and session-based chat history.
"""
import logging
import uuid
from datetime import datetime

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import desc
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.config import settings
from ..models.schemas import Farmer, Crop, ChatHistory
from ..services.gemini_context import build_farmer_context, get_session_chat_history, fetch_live_weather
from .auth import get_current_farmer

logger = logging.getLogger("farmer_assistant")
router = APIRouter(prefix="/api/chat", tags=["AI Chatbot"])


# ── Pydantic models ─────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None  # UUID — if not provided, creates a new session
    language: Optional[str] = "en"


class ChatResponse(BaseModel):
    response: str
    session_id: str  # Return the session_id so frontend can reuse it


class ChatMessageResponse(BaseModel):
    id: int
    sender: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatSessionResponse(BaseModel):
    session_id: str
    first_message: str
    message_count: int
    started_at: datetime
    last_message_at: datetime


# ── System Prompt ───────────────────────────────────────────

SYSTEM_PROMPT_TEMPLATE = """You are Krishik AI (కృషిక్ AI), a personal AI farming assistant for Telangana farmers.

You have access to this farmer's complete profile, their ML prediction results, disease history, and current weather. Use this data to give highly personalized, actionable farming advice.

RULES:
1. Always reference the farmer's specific data in your answers (their soil, crop, location, area).
2. When asked about crops, consider their actual soil NPK, pH, and location.
3. When asked about selling or market, reference their mandi predictions and adjusted return.
4. When asked about irrigation or weather, use the live weather data provided.
5. You EXPLAIN and CONTEXTUALIZE ML model results — you do NOT make predictions yourself.
6. Keep responses concise, clear, and action-oriented.
7. Use farmer-friendly language. Avoid technical jargon unless asked.
8. If the farmer's data is missing for a question, say so honestly and suggest what data they should provide.
9. Respond in {language_name} language.
10. Keep formatting simple — short paragraphs, no heavy markdown.

FARMER CONTEXT:
{farmer_context}

{weather_context}"""


# ── Fallback Responses ──────────────────────────────────────

def get_fallback_response(query: str, language: str, farmer: Farmer) -> str:
    """Generate a rule-based fallback response when Gemini API is unavailable."""
    q = query.lower()
    if "water" in q or "irrigation" in q or "నీరు" in q:
        soil = farmer.soil_type if farmer else "Red Sandy"
        return (
            "రైతు సోదరా, మీ పొలం మట్టి రకం: " + soil + ". ప్రస్తుత వాతావరణ పరిస్థితుల దృష్ట్యా పంటకు ప్రతి 4-5 రోజులకు ఒకసారి తేలికపాటి తడులు ఇవ్వడం అవసరం."
            if language == 'te' else
            f"Dear Farmer, since your soil type is {soil}, we recommend irrigating your field every 4-5 days. Ensure standing water during critical growth and flowering stages."
        )
    elif "fertilizer" in q or "fertiliser" in q or "ఎరువులు" in q:
        return (
            "పంట పూత దశలో ఉన్నప్పుడు ఎకరానికి 50 కిలోల యూరియా మరియు 15 కిలోల పొటాష్ మొదటి దఫాగా వేయండి."
            if language == 'te' else
            "For your crop in the growth phase, apply 50 kg Urea and 15 kg MOP (Muriate of Potash) per acre."
        )
    elif "disease" in q or "pest" in q or "తెగులు" in q:
        return (
            "ఆకు ముడత మరియు తెగుళ్ళ నివారణకు ఎకరానికి డయాఫెన్థియురాన్ 240 గ్రాములు పిచికారీ చేయండి."
            if language == 'te' else
            "To control pests and diseases, spray Diafenthiuron @ 240g in 200 liters of water per acre."
        )
    else:
        loc = f"{farmer.village}, {farmer.district}" if farmer else "Telangana"
        return (
            f"ధన్యవాదాలు. మీ ప్రాంతం ({loc}) వాతావరణ మరియు పంట పరిస్థితులకు అనుగుణంగా సమాచారం అందిస్తాను."
            if language == 'te' else
            f"Thank you for asking. Based on your farm profile in {loc}, I recommend consulting our advisory sections for detailed guidance."
        )


# ── Main Chat Endpoint ──────────────────────────────────────

@router.post("", response_model=ChatResponse)
async def chat_with_assistant(
    req: ChatRequest,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """
    Profile-injected personal AI assistant.

    Automatically loads the farmer's complete context (profile, crops, ML results,
    disease history, weather) and sends it to Gemini for personalized responses.
    Chat messages are persisted server-side in the database.
    """
    farmer = current_farmer

    # Generate or reuse session_id
    session_id = req.session_id or str(uuid.uuid4())

    # ── Step 1: Save user message to DB ────────────────────────
    user_msg = ChatHistory(
        farmer_id=farmer.id,
        sender="user",
        message=req.message,
        language=req.language or "en",
        session_id=session_id,
    )
    db.add(user_msg)
    db.commit()

    # ── Step 2: Build farmer context ───────────────────────────
    farmer_context = build_farmer_context(farmer, session_id, db)

    # Fetch live weather (async)
    weather_context = ""
    if farmer.latitude and farmer.longitude:
        weather_str = await fetch_live_weather(
            float(farmer.latitude), float(farmer.longitude)
        )
        if weather_str:
            weather_context = weather_str

    # ── Step 3: Build system prompt ────────────────────────────
    language_name = "Telugu" if req.language == "te" else "English"
    system_instruction = SYSTEM_PROMPT_TEMPLATE.format(
        language_name=language_name,
        farmer_context=farmer_context,
        weather_context=weather_context,
    )

    # ── Step 4: Load session chat history from DB ──────────────
    chat_history = get_session_chat_history(farmer.id, session_id, db)

    # Build Gemini contents array from DB history
    contents = []
    for msg in chat_history:
        contents.append({
            "role": msg["role"],
            "parts": [{"text": msg["text"]}]
        })

    # Add current message
    contents.append({
        "role": "user",
        "parts": [{"text": req.message}]
    })

    # ── Step 5: Call Gemini API ─────────────────────────────────
    if not settings.GEMINI_API_KEY:
        logger.info("Gemini API key is not configured. Using fallback local response.")
        fallback = get_fallback_response(req.message, req.language or "en", farmer)
        # Save fallback response
        bot_msg = ChatHistory(
            farmer_id=farmer.id,
            sender="bot",
            message=fallback,
            language=req.language or "en",
            session_id=session_id,
        )
        db.add(bot_msg)
        db.commit()
        return ChatResponse(response=fallback, session_id=session_id)

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}"

    payload = {
        "contents": contents,
        "systemInstruction": {
            "parts": [{"text": system_instruction}]
        },
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 2048
        }
    }

    reply_text = None
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    content = candidates[0].get("content", {})
                    parts = content.get("parts", [])
                    if parts:
                        reply_text = parts[0].get("text", "").strip()
            else:
                logger.error(f"Gemini API returned status {resp.status_code}: {resp.text}")
    except Exception as e:
        logger.exception("Error calling Gemini API:")

    # Use fallback if Gemini failed
    if not reply_text:
        reply_text = get_fallback_response(req.message, req.language or "en", farmer)

    # ── Step 6: Save bot response to DB ────────────────────────
    bot_msg = ChatHistory(
        farmer_id=farmer.id,
        sender="bot",
        message=reply_text,
        language=req.language or "en",
        session_id=session_id,
    )
    db.add(bot_msg)
    db.commit()

    return ChatResponse(response=reply_text, session_id=session_id)


# ── Chat History Endpoints ──────────────────────────────────

@router.get("/history/{session_id}", response_model=List[ChatMessageResponse])
def get_chat_session_history(
    session_id: str,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Get all messages for a specific chat session."""
    messages = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.farmer_id == current_farmer.id,
            ChatHistory.session_id == session_id,
        )
        .order_by(ChatHistory.created_at.asc())
        .all()
    )
    return messages


@router.get("/sessions", response_model=List[ChatSessionResponse])
def get_chat_sessions(
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Get a list of all chat sessions for the authenticated farmer."""
    from sqlalchemy import func

    sessions = (
        db.query(
            ChatHistory.session_id,
            func.min(ChatHistory.message).label("first_message"),
            func.count(ChatHistory.id).label("message_count"),
            func.min(ChatHistory.created_at).label("started_at"),
            func.max(ChatHistory.created_at).label("last_message_at"),
        )
        .filter(ChatHistory.farmer_id == current_farmer.id)
        .group_by(ChatHistory.session_id)
        .order_by(desc(func.max(ChatHistory.created_at)))
        .limit(50)
        .all()
    )

    return [
        ChatSessionResponse(
            session_id=s.session_id,
            first_message=s.first_message[:100] if s.first_message else "",
            message_count=s.message_count,
            started_at=s.started_at,
            last_message_at=s.last_message_at,
        )
        for s in sessions
    ]
