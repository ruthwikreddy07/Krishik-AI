import logging
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.config import settings
from ..models.schemas import Farmer, Crop
from .auth import get_current_farmer

logger = logging.getLogger("farmer_assistant")
router = APIRouter(prefix="/api/chat", tags=["AI Chatbot"])

class ChatMessage(BaseModel):
    sender: str  # 'user' or 'bot'
    text: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    farmer_id: Optional[int] = None
    language: Optional[str] = "en"

class ChatResponse(BaseModel):
    response: str

@router.post("", response_model=ChatResponse)
async def chat_with_assistant(
    req: ChatRequest,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    # Fetch farmer profile & crops using authenticated current_farmer
    farmer = current_farmer
    crops = db.query(Crop).filter(Crop.farmer_id == farmer.id).all()
    crops_str = ", ".join([c.crop_name for c in crops]) if crops else "None registered yet"
    profile_info = (
        f"Farmer Name: {farmer.name}\n"
        f"Location: {farmer.village} village, {farmer.mandal} mandal, {farmer.district} district, Telangana\n"
        f"Soil Type: {farmer.soil_type}\n"
        f"Water Source: {farmer.water_source}\n"
        f"Land Size: {farmer.land_size_acres} acres\n"
        f"Active Crops Sown: {crops_str}\n"
    )

    # 2. Build instructions & contents for Gemini
    system_instruction = (
        "You are Krishik AI, a professional, smart, and friendly AI Farming Assistant for Telangana farmers.\n"
        "You have access to the farmer's database. Provide localized, accurate, and practical agronomy advice.\n"
        "Recommend correct fertilizers, pesticide solutions, water management practices, and local crop cycles.\n"
        "Keep your response concise, clear, and action-oriented. Suggest modern sustainable farming techniques.\n"
    )
    if profile_info:
        system_instruction += f"\nBelow is the context about the farmer you are talking to:\n{profile_info}\n"

    system_instruction += f"\nPlease respond in {'Telugu' if req.language == 'te' else 'English'} language. Keep formatting simple (avoid heavy markdown, keep paragraphs short)."

    # Fallback response generator if Gemini API key is missing or calls fail
    def get_fallback_response(query: str, language: str) -> str:
        q = query.lower()
        if "water" in q or "irrigation" in q or "నీరు" in q:
            soil = "Red Sandy"
            if farmer:
                soil = farmer.soil_type
            return (
                "రైతు సోదరా, మీ పొలం మట్టి రకం: " + soil + ". ప్రస్తుత వాతావరణ పరిస్థితుల దృష్ట్యా పంటకు ప్రతి 4-5 రోజులకు ఒకసారి తేలికపాటి తడులు ఇవ్వడం అవసరం. ముఖ్యంగా పొట్టదశలో నీరు నిలకడగా ఉండేలా చూసుకోండి."
                if language == 'te' else
                f"Dear Farmer, since your soil type is {soil}, we recommend irrigating your field every 4-5 days. Ensure standing water during critical growth and flowering stages."
            )
        elif "fertilizer" in q or "fertiliser" in q or "ఎరువులు" in q:
            return (
                "పంట పూత దశలో ఉన్నప్పుడు ఎకరానికి 50 కిలోల యూరియా మరియు 15 కిలోల పొటాష్ మొదటి దఫాగా వేయండి. ఎరువులు వేసేటప్పుడు మట్టిలో తగినంత తేమ ఉండేలా చూసుకోండి."
                if language == 'te' else
                "For your crop in the growth phase, apply 50 kg Urea and 15 kg MOP (Muriate of Potash) per acre. Ensure adequate soil moisture during fertilizer application."
            )
        elif "leaf curl" in q or "ముడత" in q or "disease" in q or "pest" in q or "తెగులు" in q:
            return (
                "ఆకు ముడత మరియు తెగుళ్ళ నివారణకు ఎకరానికి డయాఫెన్థియురాన్ (Polo) 240 గ్రాములు లేదా ఫిప్రోనిల్ 400 మి.లీ చొప్పున 200 లీటర్ల నీటిలో కలిపి పిచికారీ చేయండి."
                if language == 'te' else
                "To control pests and leaf curl diseases, spray Diafenthiuron @ 240g or Fipronil @ 400ml in 200 liters of water per acre."
            )
        else:
            loc = "Telangana"
            if farmer:
                loc = f"{farmer.village}, {farmer.district}"
            return (
                f"ధన్యవాదాలు. మీ ప్రశ్నను విశ్లేషిస్తున్నాను. మీ ప్రాంతం ({loc}) వాతావరణ మరియు పంట పరిస్థితులకు అనుగుణంగా త్వరలో సమగ్ర సమాచారం అందిస్తాను."
                if language == 'te' else
                f"Thank you for asking. I am analyzing your query for your farm in {loc}. Based on your farm profile, I recommend consulting local experts or checking our weather advisory section for daily updates."
            )

    if not settings.GEMINI_API_KEY:
        logger.info("Gemini API key is not configured. Using fallback local response.")
        return ChatResponse(response=get_fallback_response(req.message, req.language))

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
    
    contents = []
    for msg in req.history:
        role = "user" if msg.sender == "user" else "model"
        contents.append({
            "role": role,
            "parts": [{"text": msg.text}]
        })
        
    contents.append({
        "role": "user",
        "parts": [{"text": req.message}]
    })

    payload = {
        "contents": contents,
        "systemInstruction": {
            "parts": [{"text": system_instruction}]
        },
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 800
        }
    }

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
                        reply_text = parts[0].get("text", "")
                        if reply_text.strip():
                            return ChatResponse(response=reply_text.strip())
                logger.warning(f"Unexpected empty response shape from Gemini: {data}")
            else:
                logger.error(f"Gemini API returned status {resp.status_code}: {resp.text}")
    except Exception as e:
        logger.exception("Error calling Gemini API:")

    return ChatResponse(response=get_fallback_response(req.message, req.language))
