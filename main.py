from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
import os

from database import engine, get_db, Base
from models import User, Chatbot, Keyword, Message
import auth
from claude_integration import get_claude_response
from instagram import handle_instagram_webhook, verify_webhook

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Instagram Chatbot Platform")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ AUTH ROUTES ============

@app.post("/api/auth/register")
def register(email: str, username: str, password: str, full_name: str = None, db: Session = Depends(get_db)):
    # Check if user exists
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create user
    hashed_password = auth.get_password_hash(password)
    user = User(
        email=email,
        username=username,
        hashed_password=hashed_password,
        full_name=full_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return {"message": "User created successfully", "user_id": user.id}

@app.post("/api/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me")
def get_me(current_user: User = Depends(auth.get_current_active_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name
    }

# ============ CHATBOT ROUTES ============

@app.get("/api/chatbots")
def get_chatbots(current_user: User = Depends(auth.get_current_active_user), db: Session = Depends(get_db)):
    chatbots = db.query(Chatbot).filter(Chatbot.owner_id == current_user.id).all()
    return chatbots

@app.post("/api/chatbots")
def create_chatbot(
    name: str,
    description: str = None,
    instagram_account_id: str = None,
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    chatbot = Chatbot(
        name=name,
        description=description,
        instagram_account_id=instagram_account_id,
        owner_id=current_user.id
    )
    db.add(chatbot)
    db.commit()
    db.refresh(chatbot)
    return chatbot

@app.get("/api/chatbots/{chatbot_id}")
def get_chatbot(
    chatbot_id: int,
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    chatbot = db.query(Chatbot).filter(
        Chatbot.id == chatbot_id,
        Chatbot.owner_id == current_user.id
    ).first()
    
    if not chatbot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    
    return chatbot

@app.put("/api/chatbots/{chatbot_id}")
def update_chatbot(
    chatbot_id: int,
    name: str = None,
    description: str = None,
    ai_enabled: bool = None,
    ai_personality: str = None,
    welcome_message: str = None,
    is_active: bool = None,
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    chatbot = db.query(Chatbot).filter(
        Chatbot.id == chatbot_id,
        Chatbot.owner_id == current_user.id
    ).first()
    
    if not chatbot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    
    if name: chatbot.name = name
    if description: chatbot.description = description
    if ai_enabled is not None: chatbot.ai_enabled = ai_enabled
    if ai_personality: chatbot.ai_personality = ai_personality
    if welcome_message: chatbot.welcome_message = welcome_message
    if is_active is not None: chatbot.is_active = is_active
    
    db.commit()
    db.refresh(chatbot)
    return chatbot

@app.delete("/api/chatbots/{chatbot_id}")
def delete_chatbot(
    chatbot_id: int,
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    chatbot = db.query(Chatbot).filter(
        Chatbot.id == chatbot_id,
        Chatbot.owner_id == current_user.id
    ).first()
    
    if not chatbot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    
    db.delete(chatbot)
    db.commit()
    return {"message": "Chatbot deleted"}

# ============ KEYWORD ROUTES ============

@app.get("/api/chatbots/{chatbot_id}/keywords")
def get_keywords(
    chatbot_id: int,
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    chatbot = db.query(Chatbot).filter(
        Chatbot.id == chatbot_id,
        Chatbot.owner_id == current_user.id
    ).first()
    
    if not chatbot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    
    return chatbot.keywords

@app.post("/api/chatbots/{chatbot_id}/keywords")
def create_keyword(
    chatbot_id: int,
    keyword: str,
    response: str,
    priority: int = 0,
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    chatbot = db.query(Chatbot).filter(
        Chatbot.id == chatbot_id,
        Chatbot.owner_id == current_user.id
    ).first()
    
    if not chatbot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    
    kw = Keyword(
        keyword=keyword.lower(),
        response=response,
        priority=priority,
        chatbot_id=chatbot_id
    )
    db.add(kw)
    db.commit()
    db.refresh(kw)
    return kw

@app.delete("/api/keywords/{keyword_id}")
def delete_keyword(
    keyword_id: int,
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    keyword = db.query(Keyword).join(Chatbot).filter(
        Keyword.id == keyword_id,
        Chatbot.owner_id == current_user.id
    ).first()
    
    if not keyword:
        raise HTTPException(status_code=404, detail="Keyword not found")
    
    db.delete(keyword)
    db.commit()
    return {"message": "Keyword deleted"}

# ============ ANALYTICS ROUTES ============

@app.get("/api/chatbots/{chatbot_id}/messages")
def get_messages(
    chatbot_id: int,
    limit: int = 50,
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    chatbot = db.query(Chatbot).filter(
        Chatbot.id == chatbot_id,
        Chatbot.owner_id == current_user.id
    ).first()
    
    if not chatbot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    
    messages = db.query(Message).filter(
        Message.chatbot_id == chatbot_id
    ).order_by(Message.created_at.desc()).limit(limit).all()
    
    return messages

@app.get("/api/chatbots/{chatbot_id}/analytics")
def get_analytics(
    chatbot_id: int,
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    chatbot = db.query(Chatbot).filter(
        Chatbot.id == chatbot_id,
        Chatbot.owner_id == current_user.id
    ).first()
    
    if not chatbot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    
    total_messages = db.query(Message).filter(Message.chatbot_id == chatbot_id).count()
    keyword_count = db.query(Message).filter(
        Message.chatbot_id == chatbot_id,
        Message.response_type == "keyword"
    ).count()
    ai_count = db.query(Message).filter(
        Message.chatbot_id == chatbot_id,
        Message.response_type == "ai"
    ).count()
    
    return {
        "total_messages": total_messages,
        "keyword_responses": keyword_count,
        "ai_responses": ai_count,
        "keyword_percentage": round((keyword_count / total_messages * 100) if total_messages > 0 else 0, 1),
        "ai_percentage": round((ai_count / total_messages * 100) if total_messages > 0 else 0, 1)
    }

# ============ INSTAGRAM WEBHOOK ============

@app.get("/api/webhook")
def webhook_verify(request: dict):
    return verify_webhook(request)

@app.post("/api/webhook")
async def webhook_handler(request: dict, db: Session = Depends(get_db)):
    return await handle_instagram_webhook(request, db)

# ============ HEALTH CHECK ============

@app.get("/")
def root():
    return {"status": "ok", "message": "Instagram Chatbot Platform API"}

@app.get("/health")
def health():
    return {"status": "healthy"}
