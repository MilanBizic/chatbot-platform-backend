from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    chatbots = relationship("Chatbot", back_populates="owner")

class Chatbot(Base):
    __tablename__ = "chatbots"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    
    # Instagram credentials
    instagram_account_id = Column(String, unique=True)
    instagram_access_token = Column(String)
    
    # Bot configuration
    ai_enabled = Column(Boolean, default=True)
    ai_personality = Column(Text, default="You are a helpful assistant for a fashion e-commerce business. Be friendly, concise, and professional.")
    welcome_message = Column(Text, default="Pozdrav! 👋 Kako mogu da vam pomognem?")
    
    # Settings
    is_active = Column(Boolean, default=True)
    response_delay = Column(Integer, default=0)  # seconds
    
    # Owner
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="chatbots")
    
    # Relationships
    keywords = relationship("Keyword", back_populates="chatbot", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="chatbot", cascade="all, delete-orphan")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Keyword(Base):
    __tablename__ = "keywords"
    
    id = Column(Integer, primary_key=True, index=True)
    keyword = Column(String, nullable=False)
    response = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    priority = Column(Integer, default=0)  # Higher priority = checked first
    
    # Chatbot
    chatbot_id = Column(Integer, ForeignKey("chatbots.id"))
    chatbot = relationship("Chatbot", back_populates="keywords")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Message content
    customer_message = Column(Text, nullable=False)
    bot_response = Column(Text, nullable=False)
    response_type = Column(String)  # "keyword", "ai", "fallback"
    
    # Instagram data
    instagram_message_id = Column(String)
    customer_instagram_id = Column(String)
    customer_name = Column(String)
    
    # Metadata
    response_time_ms = Column(Integer)  # milliseconds
    
    # Chatbot
    chatbot_id = Column(Integer, ForeignKey("chatbots.id"))
    chatbot = relationship("Chatbot", back_populates="messages")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Analytics(Base):
    __tablename__ = "analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    chatbot_id = Column(Integer, ForeignKey("chatbots.id"))
    
    # Daily stats
    date = Column(DateTime(timezone=True), nullable=False)
    total_messages = Column(Integer, default=0)
    keyword_responses = Column(Integer, default=0)
    ai_responses = Column(Integer, default=0)
    avg_response_time_ms = Column(Integer, default=0)
    unique_customers = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
