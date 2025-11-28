import os
import httpx
from fastapi import Request
from sqlalchemy.orm import Session
from models import Chatbot, Keyword, Message
from claude_integration import get_response_with_context
import time

INSTAGRAM_VERIFY_TOKEN = os.getenv("INSTAGRAM_VERIFY_TOKEN", "my_verify_token")

def verify_webhook(request: Request):
    """Verify Instagram webhook"""
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")
    
    if mode == "subscribe" and token == INSTAGRAM_VERIFY_TOKEN:
        return {"hub.challenge": challenge}
    
    return {"error": "Invalid verification token"}

async def handle_instagram_webhook(data: dict, db: Session):
    """Handle incoming Instagram messages"""
    
    try:
        # Parse webhook data
        entry = data.get("entry", [])[0]
        messaging = entry.get("messaging", [])[0]
        
        sender_id = messaging.get("sender", {}).get("id")
        recipient_id = messaging.get("recipient", {}).get("id")
        message_data = messaging.get("message", {})
        message_text = message_data.get("text", "")
        
        if not message_text:
            return {"status": "ok"}
        
        # Find chatbot by Instagram account ID
        chatbot = db.query(Chatbot).filter(
            Chatbot.instagram_account_id == recipient_id,
            Chatbot.is_active == True
        ).first()
        
        if not chatbot:
            return {"status": "no_bot_found"}
        
        # Process message and get response
        start_time = time.time()
        bot_response, response_type = await process_message(message_text, chatbot, db)
        response_time = int((time.time() - start_time) * 1000)  # milliseconds
        
        # Save to database
        msg = Message(
            customer_message=message_text,
            bot_response=bot_response,
            response_type=response_type,
            instagram_message_id=message_data.get("mid"),
            customer_instagram_id=sender_id,
            response_time_ms=response_time,
            chatbot_id=chatbot.id
        )
        db.add(msg)
        db.commit()
        
        # Send response back to customer
        await send_instagram_message(sender_id, bot_response, chatbot.instagram_access_token)
        
        return {"status": "ok"}
        
    except Exception as e:
        print(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

async def process_message(message: str, chatbot: Chatbot, db: Session) -> tuple:
    """
    Process incoming message and generate response
    
    Returns:
        (response_text, response_type)
    """
    
    message_lower = message.lower().strip()
    
    # Check keywords first (sorted by priority)
    keywords = db.query(Keyword).filter(
        Keyword.chatbot_id == chatbot.id,
        Keyword.is_active == True
    ).order_by(Keyword.priority.desc()).all()
    
    for kw in keywords:
        if kw.keyword.lower() in message_lower:
            return (kw.response, "keyword")
    
    # If no keyword match and AI is enabled, use Claude
    if chatbot.ai_enabled:
        # Get recent conversation for context
        recent_messages = db.query(Message).filter(
            Message.chatbot_id == chatbot.id
        ).order_by(Message.created_at.desc()).limit(5).all()
        
        ai_response = get_response_with_context(
            message,
            chatbot.ai_personality,
            list(reversed(recent_messages))
        )
        return (ai_response, "ai")
    
    # Fallback response
    fallback = "Hvala na poruci! Naš tim će vam uskoro odgovoriti. 😊"
    return (fallback, "fallback")

async def send_instagram_message(recipient_id: str, message: str, access_token: str):
    """Send message to Instagram user"""
    
    url = f"https://graph.facebook.com/v18.0/me/messages"
    
    payload = {
        "recipient": {"id": recipient_id},
        "message": {"text": message}
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    params = {
        "access_token": access_token
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers, params=params)
        return response.json()
