import os
import uuid
import logging
import httpx
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import PlainTextResponse, JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..core.database import get_db
from ..core.config import settings
from ..models.schemas import Farmer, Crop, DiseaseRecord, GovernmentScheme, MarketPrice, UserActivity
from ..ml.disease_detection import detect_disease
from ..ml.price_prediction import predict_price
from .chat import ChatRequest, ChatMessage

logger = logging.getLogger("farmer_assistant")
router = APIRouter(prefix="/api/whatsapp", tags=["WhatsApp Webhook"])

# Verification token for Meta webhook
VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "krishik2024")

class WhatsAppWebhookResponse(BaseModel):
    status: str

async def send_whatsapp_reply(to_number: str, text: str):
    """Send text message reply using Meta WhatsApp Cloud API."""
    if not settings.WHATSAPP_API_TOKEN or not settings.WHATSAPP_PHONE_NUMBER_ID:
        logger.warning(f"[WhatsApp Simulation] To: {to_number} | Message: {text}")
        return False

    url = f"https://graph.facebook.com/v18.0/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_API_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to_number,
        "type": "text",
        "text": {"body": text}
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code in (200, 201):
                logger.info(f"WhatsApp reply successfully sent to {to_number}")
                return True
            else:
                logger.error(f"WhatsApp API sending failed: {resp.status_code} - {resp.text}")
                logger.warning(f"[WhatsApp Simulation Fallback] To: {to_number} | Message: {text}")
    except Exception as e:
        logger.exception("Error sending WhatsApp reply:")
        logger.warning(f"[WhatsApp Simulation Fallback] To: {to_number} | Message: {text}")
    return False

async def send_whatsapp_interactive_list(to_number: str, header: str, body: str, button_text: str, sections: list):
    """Send Interactive List Message using Meta WhatsApp Cloud API."""
    if not settings.WHATSAPP_API_TOKEN or not settings.WHATSAPP_PHONE_NUMBER_ID:
        sim_text = f"--- WhatsApp Interactive List Simulation ---\nHeader: {header}\nBody: {body}\nOptions:\n"
        for sec in sections:
            sim_text += f"[{sec.get('title', '')}]:\n"
            for row in sec.get("rows", []):
                sim_text += f"  - ID: {row.get('id')} | Title: {row.get('title')} | Desc: {row.get('description', '')}\n"
        logger.warning(f"[WhatsApp Simulation] To: {to_number}\n{sim_text}")
        return False

    url = f"https://graph.facebook.com/v18.0/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_API_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to_number,
        "type": "interactive",
        "interactive": {
            "type": "list",
            "header": {"type": "text", "text": header},
            "body": {"text": body},
            "footer": {"text": "Select an option from list to proceed"},
            "action": {
                "button": button_text,
                "sections": sections
            }
        }
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code in (200, 201):
                logger.info(f"WhatsApp interactive list sent to {to_number}")
                return True
            else:
                logger.error(f"WhatsApp interactive list failed: {resp.status_code} - {resp.text}")
                logger.warning(f"[WhatsApp Simulation Fallback] To: {to_number} | Header: {header} | Body: {body}")
    except Exception as e:
        logger.exception("Error sending WhatsApp interactive list:")
    return False

async def send_whatsapp_interactive_buttons(to_number: str, body: str, buttons: list, header: str = None):
    """Send Interactive Quick Reply Buttons Message (max 3 buttons)."""
    if not settings.WHATSAPP_API_TOKEN or not settings.WHATSAPP_PHONE_NUMBER_ID:
        sim_text = f"--- WhatsApp Quick Replies Simulation ---\nBody: {body}\nButtons:\n"
        for btn in buttons:
            sim_text += f"  - ID: {btn.get('id')} | Title: {btn.get('title')}\n"
        logger.warning(f"[WhatsApp Simulation] To: {to_number}\n{sim_text}")
        return False

    url = f"https://graph.facebook.com/v18.0/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_API_TOKEN}",
        "Content-Type": "application/json",
    }
    action_buttons = []
    for btn in buttons:
        action_buttons.append({
            "type": "reply",
            "reply": {
                "id": btn.get("id"),
                "title": btn.get("title")
            }
        })
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to_number,
        "type": "interactive",
        "interactive": {
            "type": "button",
            "body": {"text": body},
            "action": {
                "buttons": action_buttons
            }
        }
    }
    if header:
        payload["interactive"]["header"] = {"type": "text", "text": header}
        
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code in (200, 201):
                logger.info(f"WhatsApp quick reply buttons sent to {to_number}")
                return True
            else:
                logger.error(f"WhatsApp quick reply buttons failed: {resp.status_code} - {resp.text}")
    except Exception as e:
        logger.exception("Error sending WhatsApp quick replies:")
    return False

@router.get("/webhook", response_class=PlainTextResponse)
def verify_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
    hub_verify_token: str = Query(None, alias="hub.verify_token")
):
    """
    Webhook verification endpoint for Meta WhatsApp Cloud API.
    """
    if hub_mode == "subscribe" and hub_verify_token == VERIFY_TOKEN:
        logger.info("WhatsApp Webhook verified successfully!")
        return hub_challenge
    logger.warning("WhatsApp Webhook verification failed.")
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Verification token mismatch")

@router.post("/webhook")
async def handle_whatsapp_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handles incoming messages (text, image, audio) from Meta WhatsApp Cloud API.
    """
    try:
        body = await request.json()
    except Exception:
        return JSONResponse(status_code=400, content={"status": "invalid_json"})

    logger.debug(f"Received WhatsApp Webhook payload: {body}")

    # Parse messages
    entry = body.get("entry", [])
    if not entry:
        return {"status": "ignored"}

    changes = entry[0].get("changes", [])
    if not changes:
        return {"status": "ignored"}

    value = changes[0].get("value", {})
    messages = value.get("messages", [])
    if not messages:
        return {"status": "ignored"}

    msg = messages[0]
    sender_phone = msg.get("from")  # Format: "919876543210" or similar
    if not sender_phone:
        return {"status": "ignored"}

    # Extract last 10 digits to query Farmer database
    phone_digits = "".join(filter(str.isdigit, sender_phone))
    phone_last_10 = phone_digits[-10:] if len(phone_digits) >= 10 else phone_digits

    # Look up farmer profile
    farmer = db.query(Farmer).filter(Farmer.mobile_number.like(f"%{phone_last_10}")).first()

    # Determine message type
    msg_type = msg.get("type", "text")
    
    text_body = ""
    if msg_type == "interactive":
        interactive = msg.get("interactive", {})
        ref_type = interactive.get("type")
        if ref_type == "list_reply":
            reply_val = interactive.get("list_reply", {})
            reply_id = reply_val.get("id")
            if reply_id == "menu_weather":
                text_body = "weather"
            elif reply_id == "menu_schemes":
                text_body = "schemes"
            elif reply_id == "menu_market_cotton":
                text_body = "cotton price"
            elif reply_id == "menu_market_paddy":
                text_body = "paddy price"
            else:
                text_body = reply_val.get("title", "")
        elif ref_type == "button_reply":
            reply_val = interactive.get("button_reply", {})
            reply_id = reply_val.get("id")
            if reply_id == "btn_weather":
                text_body = "weather"
            elif reply_id == "btn_schemes":
                text_body = "schemes"
            elif reply_id == "btn_price":
                text_body = "cotton price"
            else:
                text_body = reply_val.get("title", "")
        msg_type = "text"
    
    # 1. HANDLE IMAGE MESSAGE (Disease Detection)
    if msg_type == "image":
        image_data = msg.get("image", {})
        media_id = image_data.get("id")
        
        reply_prefix = "రైతు సోదరా, " if farmer else "Dear Farmer, "
        
        # Log activity
        activity = UserActivity(
            farmer_id=farmer.id if farmer else None,
            action="WhatsApp Disease Detection Upload",
            channel="WhatsApp",
            request_data=f"Media ID: {media_id}"
        )
        db.add(activity)
        db.commit()

        # Try downloading media from Meta API
        image_saved_path = None
        if settings.WHATSAPP_API_TOKEN and media_id:
            try:
                headers = {"Authorization": f"Bearer {settings.WHATSAPP_API_TOKEN}"}
                # Step 1: Get media URL
                media_meta_url = f"https://graph.facebook.com/v18.0/{media_id}"
                async with httpx.AsyncClient(timeout=10.0) as client:
                    meta_resp = await client.get(media_meta_url, headers=headers)
                    if meta_resp.status_code == 200:
                        download_url = meta_resp.json().get("url")
                        if download_url:
                            # Step 2: Download actual binary
                            img_resp = await client.get(download_url, headers=headers)
                            if img_resp.status_code == 200:
                                os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
                                filename = f"whatsapp_{uuid.uuid4().hex}.jpg"
                                filepath = os.path.join(settings.UPLOAD_DIR, filename)
                                with open(filepath, "wb") as f:
                                    f.write(img_resp.content)
                                image_saved_path = filepath
            except Exception as e:
                logger.error(f"Failed to download WhatsApp media from Meta API: {e}")

        # Run diagnosis
        if image_saved_path:
            try:
                result = detect_disease(image_saved_path)
                disease_name = result["disease_name"]
                treatment = result["treatment"]
                confidence = result["confidence"]
                
                # Save disease record to DB
                db_record = DiseaseRecord(
                    farmer_id=farmer.id if farmer else 1, # Default fallback if farmer not registered
                    image_url=f"/uploads/disease_images/{os.path.basename(image_saved_path)}",
                    detected_disease=disease_name,
                    confidence=confidence,
                    treatment_recommendation=treatment
                )
                db.add(db_record)
                db.commit()
                
                # Format reply text
                reply_text = (
                    f"🌿 *Krishik AI Disease Diagnosis Result* 🌿\n\n"
                    f"🎯 *Disease Detected:* {disease_name}\n"
                    f"📈 *Confidence:* {confidence}%\n\n"
                    f"💊 *Treatment Recommendations:* \n{treatment}"
                )
                if farmer and farmer.soil_type:
                    # Provide customized message if they are registered
                    reply_text += f"\n\nContext: Configured for soil type: {farmer.soil_type}"
            except Exception as e:
                logger.exception("Error during WhatsApp leaf disease diagnosis:")
                reply_text = f"{reply_prefix}మమ్మల్ని క్షమించండి, చిత్రం విశ్లేషణలో లోపం ఏర్పడింది. (Error diagnosing the image leaf. Please try again.)"
        else:
            # Fallback mock diagnosis for dev / local testing when Meta token is dummy or missing
            mock_diseases = [
                {"name": "Paddy Bacterial Leaf Blight (వరి బాక్టీరియల్ లీఫ్ బ్లైట్)", "treatment": "ఎకరానికి 120 గ్రాముల స్ట్రెప్టోసైక్లిన్ మరియు 300 గ్రాముల కాపర్ ఆక్సిక్లోరైడ్ 200 లీటర్ల నీటిలో కలిపి పిచికారీ చేయండి."},
                {"name": "Cotton Leaf Curl (పత్తి ఆకు ముడత తెగులు)", "treatment": "ఆకు ముడత నివారణకు ఎకరానికి ఫిప్రోనిల్ 400 మి.లీ చొప్పున 200 లీటర్ల నీటిలో కలిపి పిచికారీ చేయండి."}
            ]
            import random
            selected = random.choice(mock_diseases)
            
            # Save mock record to DB
            db_record = DiseaseRecord(
                farmer_id=farmer.id if farmer else 1,
                image_url="/uploads/disease_images/mock_whatsapp.jpg",
                detected_disease=selected["name"],
                confidence=89.5,
                treatment_recommendation=selected["treatment"]
            )
            db.add(db_record)
            db.commit()

            reply_text = (
                f"🌿 *Krishik AI - Disease Diagnosis (Simulation Mode)* 🌿\n\n"
                f"🎯 *Disease Detected:* {selected['name']}\n"
                f"📈 *Confidence:* 89.5%\n\n"
                f"💊 *Treatment Recommendations:* \n{selected['treatment']}\n\n"
                f"⚠️ Note: Meta WhatsApp media download failed or API token is simulated. Showing localized diagnostic recommendations."
            )

        await send_whatsapp_reply(sender_phone, reply_text)
        return {"status": "success"}

    # 2. HANDLE AUDIO MESSAGE (Voice prompt placeholder)
    elif msg_type == "audio":
        reply_text = (
            "🎙️ *Krishik AI Voice Command Receiver* 🎙️\n\n"
            "నేను మీ వాయిస్ సందేశాన్ని అందుకున్నాను. ప్రస్తుత వెర్షన్‌లో టెక్స్ట్ ప్రశ్నలను పంపమని సిఫార్సు చేస్తున్నాము.\n\n"
            "(I have received your voice message. For best results, please send your queries as text.)"
        )
        await send_whatsapp_reply(sender_phone, reply_text)
        return {"status": "success"}

    # 3. HANDLE TEXT MESSAGE
    elif msg_type == "text":
        if not text_body:
            text_body = msg.get("text", {}).get("body", "").strip()
        if not text_body:
            return {"status": "ignored"}

        # Log Activity
        activity = UserActivity(
            farmer_id=farmer.id if farmer else None,
            action="WhatsApp Query",
            channel="WhatsApp",
            request_data=text_body
        )
        db.add(activity)
        db.commit()

        lower_query = text_body.lower()

        # O. GREETING OR HELP MENU
        if lower_query in ("hi", "hello", "hey", "help", "menu", "నమస్కారం", "హలో", "స్టార్ట్", "start"):
            farmer_name = f" {farmer.name}" if farmer else ""
            header = "Krishik AI Farming Assistant"
            body = (
                f"నమస్కారం{farmer_name}! Welcome to Krishik AI.\n\n"
                f"I am your 24/7 AI Farming Assistant. Click the button below to select an option, or ask me any farming question directly!"
            )
            sections = [
                {
                    "title": "Select Service",
                    "rows": [
                        {
                            "id": "menu_weather",
                            "title": "☀️ Weather Forecast",
                            "description": "Get hyperlocal weather & farming advisories"
                        },
                        {
                            "id": "menu_market_cotton",
                            "title": "💰 Cotton Mandi Price",
                            "description": "Check current Cotton rate & LSTM trend"
                        },
                        {
                            "id": "menu_market_paddy",
                            "title": "🌾 Paddy Mandi Price",
                            "description": "Check current Paddy rate & LSTM trend"
                        },
                        {
                            "id": "menu_market_chilli",
                            "title": "🌶️ Chilli Mandi Price",
                            "description": "Check current Chilli rate & LSTM trend"
                        },
                        {
                            "id": "menu_market_groundnut",
                            "title": "🥜 Groundnut Mandi Price",
                            "description": "Check current Groundnut rate & LSTM trend"
                        },
                        {
                            "id": "menu_schemes",
                            "title": "🏛️ Govt Schemes",
                            "description": "Check active agriculture programs"
                        }
                    ]
                }
            ]
            await send_whatsapp_interactive_list(
                to_number=sender_phone,
                header=header,
                body=body,
                button_text="Select Service",
                sections=sections
            )
            return {"status": "success"}

        # A. KEYWORD: WEATHER
        elif lower_query in ("weather", "వాతావరణం", "rain", "forecast"):
            if not farmer:
                reply_text = (
                    "⚠️ మీరు ఇంకా రిజిస్టర్ చేసుకోలేదు. దయచేసి వెబ్‌సైట్‌లో లాగిన్ అవ్వండి.\n"
                    "(You are not registered. Please sign up on the Krishik AI platform to get weather advisories.)"
                )
            elif not farmer.latitude or not farmer.longitude:
                reply_text = (
                    f"👋 నమస్కారం, {farmer.name}.\n"
                    f"📍 మీ లొకేషన్ వివరాలు లేవు. దయచేసి ప్రొఫైల్‌లో GPS ని కోఆర్డినేట్ చేయండి.\n"
                    f"(Please update your GPS coordinates in your profile to receive hyperlocal weather updates.)"
                )
            else:
                # Call Open-Meteo API
                try:
                    lat, lon = float(farmer.latitude), float(farmer.longitude)
                    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=temperature_2m_max,temperature_2m_min,rain_sum,precipitation_probability_max&timezone=auto"
                    async with httpx.AsyncClient(timeout=10.0) as client:
                        resp = await client.get(url)
                        if resp.status_code == 200:
                            data = resp.json()
                            daily = data.get("daily", {})
                            tmax = daily.get("temperature_2m_max", [32])[0]
                            tmin = daily.get("temperature_2m_min", [22])[0]
                            prob = daily.get("precipitation_probability_max", [0])[0]
                            rain_sum = daily.get("rain_sum", [0])[0]
                            
                            advisory = (
                                "🌧️ వర్షం పడే అవకాశం ఉంది. ఎరువుల వాడకాన్ని వాయిదా వేయండి."
                                if prob > 50 else
                                "☀️ వాతావరణం పొడిగా ఉంది. నీటిపారుదల సక్రమంగా చేయండి."
                            )
                            
                            reply_text = (
                                f"☀️ *Krishik AI Hyperlocal Weather* ☀️\n\n"
                                f"📍 *Village:* {farmer.village}, {farmer.district}\n"
                                f"🌡️ *Temperature:* {tmin}°C - {tmax}°C\n"
                                f"🌧️ *Precipitation Prob:* {prob}%\n"
                                f"💧 *Rain Sum:* {rain_sum} mm\n\n"
                                f"💡 *Farming Advice:* {advisory}"
                            )
                        else:
                            reply_text = "weather API fetching failed."
                except Exception as e:
                    logger.error(f"Error fetching weather in WhatsApp: {e}")
                    reply_text = "Failed to fetch weather forecast. Please try again later."
            
            await send_whatsapp_reply(sender_phone, reply_text)
            return {"status": "success"}

        # B. KEYWORD: SCHEMES
        elif lower_query in ("schemes", "scheme", "పథకాలు", "పథకం"):
            schemes = db.query(GovernmentScheme).limit(5).all()
            if not schemes:
                reply_text = "No government schemes registered in database."
            else:
                reply_text = "🏛️ *Telangana Government Schemes* 🏛️\n\n"
                for s in schemes:
                    reply_text += (
                        f"🔹 *{s.title}*\n"
                        f"👉 {s.benefits[:120]}...\n\n"
                    )
                reply_text += "మరిన్ని వివరాలకు వెబ్‌సైట్ స్కీమ్స్ సెక్షన్ సందర్శించండి."
            
            await send_whatsapp_reply(sender_phone, reply_text)
            return {"status": "success"}

        # C. KEYWORD: MARKET PRICE / CROP PRICE
        elif "price" in lower_query or "ధర" in lower_query or "రేటు" in lower_query or "mandi" in lower_query or "మండీ" in lower_query:
            # Try to identify crop from query
            crop_name = None
            if "paddy" in lower_query or "rice" in lower_query or "వరి" in lower_query:
                crop_name = "Paddy"
            elif "cotton" in lower_query or "పత్తి" in lower_query:
                crop_name = "Cotton"
            elif "chilli" in lower_query or "మిర్చి" in lower_query or "మిరప" in lower_query:
                crop_name = "Chilli"
            elif "maize" in lower_query or "మొక్కజొన్న" in lower_query:
                crop_name = "Maize"
            elif "groundnut" in lower_query or "వేరుశనగ" in lower_query:
                crop_name = "Groundnut"
            elif "tomato" in lower_query or "టమోటా" in lower_query or "టమాటా" in lower_query:
                crop_name = "Tomato"
            elif "turmeric" in lower_query or "పసుపు" in lower_query:
                crop_name = "Turmeric"
            elif "sugarcane" in lower_query or "చెరకు" in lower_query or "చెరుకు" in lower_query:
                crop_name = "Sugarcane"
            elif "soybean" in lower_query or "సోయా" in lower_query:
                crop_name = "Soybean"
            elif "chickpea" in lower_query or "శనగ" in lower_query:
                crop_name = "Chickpea"
            elif "pigeon" in lower_query or "కంది" in lower_query:
                crop_name = "Pigeon Peas"

            if not crop_name:
                reply_text = (
                    "రైతు సోదరా, దయచేసి పంట పేరును పేర్కొనండి (ఉదాహరణకు: పత్తి ధర, వరి ధర).\n\n"
                    "Dear Farmer, please specify a supported crop (e.g., 'Cotton price', 'Paddy price').\n\n"
                    "We currently support price reports for:\n"
                    "• Cotton (పత్తి)\n"
                    "• Paddy / Rice (వరి)\n"
                    "• Chilli (మిరప)\n"
                    "• Groundnut (веరుశనగ)\n"
                    "• Maize (మొక్కజొన్న)\n"
                    "• Tomato (టమాటా)\n"
                    "• Turmeric (పసుపు)\n"
                    "• Sugarcane (చెరకు)\n"
                    "• Soybean (సోయాబీన్)\n"
                    "• Chickpea (శనగలు)\n"
                    "• Pigeon Peas (కందులు)\n\n"
                    "↩️ Reply '0' to return to menu."
                )
                await send_whatsapp_reply(sender_phone, reply_text)
                return {"status": "success"}

            # Query database
            latest_price_rec = db.query(MarketPrice).filter(MarketPrice.crop_name == crop_name).order_by(MarketPrice.price_date.desc()).first()
            if not latest_price_rec:
                # Seeding fallback if DB query failed
                latest_price_rec = MarketPrice(crop_name=crop_name, mandi_name="Warangal Mandi", price=6850.00, price_date=datetime.now())

            # Generate LSTM forecast for tomorrow
            try:
                forecast_res = predict_price(crop_name, days_ahead=1)
                pred_price = forecast_res["predicted_prices"][0]["price"]
                forecast_text = f"📈 *Tomorrow's Predicted Price:* ₹{pred_price:.2f} per quintal"
            except Exception:
                forecast_text = "📈 *Tomorrow's Predicted Price:* Trend is stable"

            reply_text = (
                f"💰 *Krishik AI Mandi Price Report* 💰\n\n"
                f"🌾 *Crop:* {crop_name}\n"
                f"🏢 *Mandi:* {latest_price_rec.mandi_name}\n"
                f"💵 *Latest Price:* ₹{latest_price_rec.price:.2f} per quintal\n"
                f"📅 *As of:* {latest_price_rec.price_date.strftime('%Y-%m-%d')}\n\n"
                f"{forecast_text}"
            )
            await send_whatsapp_reply(sender_phone, reply_text)
            return {"status": "success"}

        # D. GENERAL QUERY (Gemini AI Chatbot)
        else:
            # Build farmer context
            crops_str = "None"
            profile_info = ""
            if farmer:
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

            system_instruction = (
                "You are Krishik AI, a professional, smart, and friendly AI Farming Assistant for Telangana farmers.\n"
                "You have access to the farmer's database. Provide localized, accurate, and practical agronomy advice.\n"
                "Recommend correct fertilizers, pesticide solutions, water management practices, and local crop cycles.\n"
                "Keep your response concise, clear, and action-oriented. Suggest modern sustainable farming techniques.\n"
            )
            if profile_info:
                system_instruction += f"\nBelow is the context about the farmer you are talking to:\n{profile_info}\n"

            # Determine language: if contains Telugu script, reply in Telugu
            is_telugu = any(ord(char) >= 0x0C00 and ord(char) <= 0x0C7F for char in text_body)
            lang = "te" if is_telugu else "en"
            system_instruction += f"\nPlease respond in {'Telugu' if lang == 'te' else 'English'} language. Keep formatting simple (avoid heavy markdown, keep paragraphs short, use emojis sparingly)."

            # Query Gemini
            response_text = ""
            if settings.GEMINI_API_KEY:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
                payload = {
                    "contents": [{"role": "user", "parts": [{"text": text_body}]}],
                    "systemInstruction": {"parts": [{"text": system_instruction}]},
                    "generationConfig": {"temperature": 0.7, "maxOutputTokens": 2048}
                }
                try:
                    async with httpx.AsyncClient(timeout=20.0) as client:
                        resp = await client.post(url, json=payload)
                        if resp.status_code == 200:
                            data = resp.json()
                            candidates = data.get("candidates", [])
                            if candidates:
                                reply = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                                if reply.strip():
                                    response_text = reply.strip()
                except Exception as e:
                    logger.error(f"Error calling Gemini in WhatsApp webhook: {e}")

            # Fallback if Gemini fails or is not configured
            if not response_text:
                q = text_body.lower()
                if "water" in q or "irrigation" in q or "నీరు" in q:
                    soil = farmer.soil_type if farmer else "Red Sandy"
                    response_text = (
                        f"రైతు సోదరా, మీ పొలం మట్టి రకం: {soil}. ప్రస్తుత వాతావరణ పరిస్థితుల దృష్ట్యా పంటకు ప్రతి 4-5 రోజులకు ఒకసారి తేలికపాటి తడులు ఇవ్వడం అవసరం. ముఖ్యంగా పొట్టదశలో నీరు నిలకడగా ఉండేలా చూసుకోండి."
                        if lang == 'te' else
                        f"Dear Farmer, since your soil type is {soil}, we recommend irrigating your field every 4-5 days. Ensure standing water during critical growth stages."
                    )
                elif "fertilizer" in q or "fertiliser" in q or "ఎరువులు" in q:
                    response_text = (
                        "పంట పూత దశలో ఉన్నప్పుడు ఎకరానికి 50 కిలోల యూరియా మరియు 15 కిలోల పొటాష్ మొదటి దఫాగా వేయండి. ఎరువులు వేసేటప్పుడు మట్టిలో తగినంత తేమ ఉండేలా చూసుకోండి."
                        if lang == 'te' else
                        "For your crop in the growth phase, apply 50 kg Urea and 15 kg MOP (Muriate of Potash) per acre. Ensure adequate soil moisture."
                    )
                else:
                    loc = f"{farmer.village}, {farmer.district}" if farmer else "Telangana"
                    response_text = (
                        f"ధన్యవాదాలు. మీ ప్రశ్నకు సహాయపడటానికి నేను విశ్లేషిస్తున్నాను. మీ ప్రాంతం ({loc}) పంట పరిస్థితులకు అనుగుణంగా త్వరలో సమగ్ర సమాచారం అందిస్తాను."
                        if lang == 'te' else
                        f"Thank you for asking. I am analyzing your query for your farm in {loc}. Based on your farm profile, we recommend consulting local experts or checking our weather section."
                    )

            await send_whatsapp_reply(sender_phone, response_text)
            return {"status": "success"}

    return {"status": "ignored"}
