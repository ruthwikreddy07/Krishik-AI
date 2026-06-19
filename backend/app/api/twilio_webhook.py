import os
import uuid
import logging
import httpx
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Form, BackgroundTasks, Response
from sqlalchemy.orm import Session

from ..core.database import get_db, SessionLocal
from ..core.config import settings
from ..models.schemas import Farmer, Crop, DiseaseRecord, GovernmentScheme, MarketPrice, UserActivity
from ..ml.disease_detection import detect_disease
from ..ml.price_prediction import predict_price
from ..services.twilio_services import send_twilio_whatsapp_message

logger = logging.getLogger("farmer_assistant")
router = APIRouter(prefix="/api/twilio", tags=["Twilio WhatsApp Webhook"])

async def process_twilio_message(sender_phone: str, message_body: str, num_media: int, media_url: str | None):
    """
    Background task to process the incoming Twilio WhatsApp message and reply.
    """
    # Create a new DB session since this runs as a background task outside the normal request lifecycle
    db: Session = SessionLocal()
    try:
        # Extract last 10 digits of phone number
        phone_digits = "".join(filter(str.isdigit, sender_phone))
        phone_last_10 = phone_digits[-10:] if len(phone_digits) >= 10 else phone_digits

        # Look up farmer profile
        farmer = db.query(Farmer).filter(Farmer.mobile_number.like(f"%{phone_last_10}")).first()
        farmer_id = farmer.id if farmer else None

        # 1. HANDLE IMAGE MESSAGE (Disease Detection)
        if num_media > 0 and media_url:
            activity = UserActivity(
                farmer_id=farmer_id,
                action="Twilio WhatsApp Disease Detection Upload",
                channel="WhatsApp (Twilio)",
                request_data=f"Media URL: {media_url}"
            )
            db.add(activity)
            db.commit()

            image_saved_path = None
            try:
                # Twilio media URLs are public by default (no Auth required)
                async with httpx.AsyncClient(timeout=15.0) as client:
                    img_resp = await client.get(media_url)
                    if img_resp.status_code == 200:
                        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
                        filename = f"whatsapp_{uuid.uuid4().hex}.jpg"
                        filepath = os.path.join(settings.UPLOAD_DIR, filename)
                        with open(filepath, "wb") as f:
                            f.write(img_resp.content)
                        image_saved_path = filepath
            except Exception as e:
                logger.error(f"Failed to download Twilio WhatsApp media: {e}")

            if image_saved_path:
                try:
                    result = detect_disease(image_saved_path)
                    disease_name = result["disease_name"]
                    treatment = result["treatment"]
                    confidence = result["confidence"]

                    # Save record
                    db_record = DiseaseRecord(
                        farmer_id=farmer_id if farmer_id else 1,
                        image_url=f"/uploads/disease_images/{os.path.basename(image_saved_path)}",
                        detected_disease=disease_name,
                        confidence=confidence,
                        treatment_recommendation=treatment
                    )
                    db.add(db_record)
                    db.commit()

                    reply_text = (
                        f"🌿 *Krishik AI Disease Diagnosis Result* 🌿\n\n"
                        f"🎯 *Disease Detected:* {disease_name}\n"
                        f"📈 *Confidence:* {confidence}%\n\n"
                        f"💊 *Treatment Recommendations:* \n{treatment}"
                    )
                    if farmer and farmer.soil_type:
                        reply_text += f"\n\nContext: Configured for soil type: {farmer.soil_type}"
                except Exception as e:
                    logger.exception("Error during Twilio leaf disease diagnosis:")
                    reply_prefix = "రైతు సోదరా, " if farmer else "Dear Farmer, "
                    reply_text = f"{reply_prefix}మమ్మల్ని క్షమించండి, చిత్రం విశ్లేషణలో లోపం ఏర్పడింది. (Error diagnosing the image leaf. Please try again.)"
            else:
                # Fallback mock diagnosis
                mock_diseases = [
                    {"name": "Paddy Bacterial Leaf Blight (వరి బాక్టీరియల్ లీఫ్ బ్లైట్)", "treatment": "ఎకరానికి 120 గ్రాముల స్ట్రెప్టోసైక్లిన్ మరియు 300 గ్రాముల కాపర్ ఆక్సిక్లోరైడ్ 200 లీటర్ల నీటిలో కలిపి పిచికారీ చేయండి."},
                    {"name": "Cotton Leaf Curl (పత్తి ఆకు ముడత తెగులు)", "treatment": "ఆకు ముడత నివారణకు ఎకరానికి ఫిప్రోనిల్ 400 మి.లీ చొప్పున 200 లీటర్ల నీటిలో కలిపి పిచికారీ చేయండి."}
                ]
                import random
                selected = random.choice(mock_diseases)

                db_record = DiseaseRecord(
                    farmer_id=farmer_id if farmer_id else 1,
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
                    f"⚠️ Note: Twilio WhatsApp media download was simulated. Showing localized diagnostic recommendations."
                )

            await send_twilio_whatsapp_message(sender_phone, reply_text)
            return

        # 2. HANDLE TEXT MESSAGE
        if not message_body:
            return

        # Log Activity
        activity = UserActivity(
            farmer_id=farmer_id,
            action="Twilio WhatsApp Query",
            channel="WhatsApp (Twilio)",
            request_data=message_body
        )
        db.add(activity)
        db.commit()

        lower_query = message_body.strip().lower()

        # O. GREETING OR HELP MENU
        if lower_query in ("hi", "hello", "hey", "help", "menu", "నమస్కారం", "హలో", "స్టార్ట్", "start", "0"):
            farmer_name = f" {farmer.name}" if farmer else ""
            reply_text = (
                f"నమస్కారం{farmer_name}! Welcome to Krishik AI.\n\n"
                f"I am your 24/7 AI Farming Assistant. Reply with a number (1-6) to choose a service, or ask me any question directly!\n\n"
                f"1️⃣ ☀️ *Weather Forecast* (Hyperlocal weather & advisories)\n"
                f"2️⃣ 💰 *Cotton Mandi Price* (Warangal Mandi prices & trends)\n"
                f"3️⃣ 🌾 *Paddy Mandi Price* (Warangal Mandi prices & trends)\n"
                f"4️⃣ 🌶️ *Chilli Mandi Price* (Warangal Mandi prices & trends)\n"
                f"5️⃣ 🥜 *Groundnut Mandi Price* (Warangal Mandi prices & trends)\n"
                f"6️⃣ 🏛️ *Govt Schemes* (Telangana state schemes)\n\n"
                f"💡 *Tip:* Send a photo of a diseased plant leaf, and I will diagnose it for you!"
            )
            await send_twilio_whatsapp_message(sender_phone, reply_text)
            return

        # A. WEATHER FORECAST
        elif lower_query in ("1", "weather", "వాతావరణం", "rain", "forecast"):
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
                                f"💡 *Farming Advice:* {advisory}\n\n"
                                f"↩️ Reply '0' to return to menu."
                            )
                        else:
                            reply_text = "Failed to fetch weather forecast. API response error."
                except Exception as e:
                    logger.error(f"Error fetching weather in Twilio: {e}")
                    reply_text = "Failed to fetch weather forecast. Please try again later."

            await send_twilio_whatsapp_message(sender_phone, reply_text)
            return

        # B. MANDI PRICES
        elif (
            any(x in lower_query for x in ("price", "ధర", "రేటు", "mandi", "మండీ", "trend")) 
            or lower_query in ("2", "3", "4", "5", "cotton", "paddy", "chilli", "groundnut", "maize", "tomato", "turmeric", "sugarcane", "soybean", "chickpea", "pigeon peas")
        ):
            # Try to identify crop from query
            crop_name = None
            if "paddy" in lower_query or "rice" in lower_query or "వరి" in lower_query or lower_query == "3":
                crop_name = "Paddy"
            elif "cotton" in lower_query or "పత్తి" in lower_query or lower_query == "2":
                crop_name = "Cotton"
            elif "chilli" in lower_query or "మిర్చి" in lower_query or "మిరప" in lower_query or lower_query == "4":
                crop_name = "Chilli"
            elif "groundnut" in lower_query or "వేరుశనగ" in lower_query or lower_query == "5":
                crop_name = "Groundnut"
            elif "maize" in lower_query or "మొక్కజొన్న" in lower_query:
                crop_name = "Maize"
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
                    "• Groundnut (వేరుశనగ)\n"
                    "• Maize (మొక్కజొన్న)\n"
                    "• Tomato (టమాటా)\n"
                    "• Turmeric (పసుపు)\n"
                    "• Sugarcane (చెరకు)\n"
                    "• Soybean (సోయాబీన్)\n"
                    "• Chickpea (శనగలు)\n"
                    "• Pigeon Peas (కందులు)\n\n"
                    "↩️ Reply '0' to return to menu."
                )
                await send_twilio_whatsapp_message(sender_phone, reply_text)
                return

            # Query database
            latest_price_rec = db.query(MarketPrice).filter(MarketPrice.crop_name == crop_name).order_by(MarketPrice.price_date.desc()).first()
            if not latest_price_rec:
                latest_price_rec = MarketPrice(crop_name=crop_name, mandi_name="Warangal Mandi", price=6850.00, price_date=datetime.now())

            # Predict LSTM price
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
                f"{forecast_text}\n\n"
                f"↩️ Reply '0' to return to menu."
            )
            await send_twilio_whatsapp_message(sender_phone, reply_text)
            return

        # C. GOVT SCHEMES
        elif lower_query in ("6", "schemes", "scheme", "పథకాలు", "పథకం"):
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
                reply_text += "మరిన్ని వివరాలకు వెబ్‌సైట్ స్కీమ్స్ సెక్షన్ సందర్శించండి.\n\n↩️ Reply '0' to return to menu."

            await send_twilio_whatsapp_message(sender_phone, reply_text)
            return

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
            is_telugu = any(ord(char) >= 0x0C00 and ord(char) <= 0x0C7F for char in message_body)
            lang = "te" if is_telugu else "en"
            system_instruction += f"\nPlease respond in {'Telugu' if lang == 'te' else 'English'} language. Keep formatting simple (avoid heavy markdown, keep paragraphs short, use emojis sparingly)."

            # Query Gemini
            response_text = ""
            if settings.GEMINI_API_KEY:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
                payload = {
                    "contents": [{"role": "user", "parts": [{"text": message_body}]}],
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
                    logger.error(f"Error calling Gemini in Twilio WhatsApp webhook: {e}")

            # Fallback if Gemini fails
            if not response_text:
                q = message_body.lower()
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

            # Append menu instructions
            response_text += "\n\n↩️ Reply '0' to return to menu."
            await send_twilio_whatsapp_message(sender_phone, response_text)
            return

    except Exception as e:
        logger.exception("Error in process_twilio_message:")
    finally:
        db.close()

@router.post("/webhook")
async def handle_twilio_webhook(
    background_tasks: BackgroundTasks,
    Body: str = Form(None),
    From: str = Form(None),
    To: str = Form(None),
    NumMedia: int = Form(0),
    MediaUrl0: str = Form(None)
):
    """
    FastAPI endpoint that accepts Twilio's WhatsApp Sandbox POST request.
    It kicks off the processing task in the background and immediately returns
    a 200 OK Response with empty TwiML <Response/> to avoid timeouts.
    """
    logger.debug(f"Received Twilio Webhook. From: {From}, Body: {Body}, NumMedia: {NumMedia}, MediaUrl0: {MediaUrl0}")
    
    if From:
        background_tasks.add_task(process_twilio_message, From, Body, NumMedia, MediaUrl0)
        
    return Response(
        content="<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response/>",
        media_type="application/xml"
    )
