import logging
import httpx
from ..core.config import settings

logger = logging.getLogger("farmer_assistant")

async def send_twilio_whatsapp_message(to_number: str, body_text: str) -> bool:
    """
    Send WhatsApp message using Twilio Messages REST API with HTTPX.
    Uses Basic Authentication with Account SID and Auth Token.
    """
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        logger.warning(f"[Twilio Simulation] To: {to_number} | Message: {body_text}")
        return False

    # Standardize recipient number format
    formatted_to = to_number.strip()
    if not formatted_to.startswith("whatsapp:"):
        # Format the number as whatsapp:+E164
        if not formatted_to.startswith("+"):
            if len(formatted_to) == 10:
                formatted_to = f"+91{formatted_to}"
            elif formatted_to.startswith("91") and len(formatted_to) == 12:
                formatted_to = f"+{formatted_to}"
            else:
                formatted_to = f"+91{formatted_to}"
        formatted_to = f"whatsapp:{formatted_to}"

    url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
    
    # Twilio API uses application/x-www-form-urlencoded
    data = {
        "From": settings.TWILIO_WHATSAPP_NUMBER,
        "To": formatted_to,
        "Body": body_text
    }
    
    auth = (settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, data=data, auth=auth)
            if resp.status_code in (200, 201):
                logger.info(f"Twilio WhatsApp message successfully sent to {formatted_to}")
                return True
            else:
                logger.error(f"Twilio API sending failed: {resp.status_code} - {resp.text}")
    except Exception as e:
        logger.exception("Error sending Twilio WhatsApp message:")
        
    return False
