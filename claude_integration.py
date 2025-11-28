import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def get_claude_response(
    user_message: str,
    chatbot_personality: str = "You are a helpful assistant.",
    conversation_history: list = None
) -> str:
    """
    Get AI response from Claude
    
    Args:
        user_message: The customer's message
        chatbot_personality: System prompt for bot personality
        conversation_history: List of previous messages for context
    
    Returns:
        Bot response string
    """
    
    # Build messages array
    messages = []
    
    # Add conversation history if provided
    if conversation_history:
        messages.extend(conversation_history)
    
    # Add current user message
    messages.append({
        "role": "user",
        "content": user_message
    })
    
    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=300,
            system=chatbot_personality,
            messages=messages
        )
        
        return response.content[0].text
        
    except Exception as e:
        print(f"Claude AI Error: {e}")
        return "Izvините, trenutno ne mogu da odgovorim. Molim vas pokušajte ponovo."

def get_response_with_context(
    user_message: str,
    chatbot_personality: str,
    recent_messages: list = None
) -> str:
    """
    Get Claude response with conversation context
    
    Args:
        user_message: Current message
        chatbot_personality: Bot personality
        recent_messages: List of recent Message objects from database
    
    Returns:
        Bot response
    """
    
    conversation_history = []
    
    # Build conversation history from recent messages
    if recent_messages:
        for msg in recent_messages[-5:]:  # Last 5 messages for context
            conversation_history.append({
                "role": "user",
                "content": msg.customer_message
            })
            conversation_history.append({
                "role": "assistant",
                "content": msg.bot_response
            })
    
    return get_claude_response(user_message, chatbot_personality, conversation_history)
