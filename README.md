# 🤖 Instagram Chatbot Platform with Claude AI

**Luxury business dashboard for managing AI-powered Instagram chatbots**

---

## 🎯 Features

✅ **Multi-tenant Platform** - Multiple clients, one platform  
✅ **Claude AI Integration** - Powered by Anthropic's Claude 3.5 Sonnet  
✅ **Keyword Management** - Custom keyword → response mapping  
✅ **Instagram DM** - Automatic reply to Instagram messages  
✅ **Analytics Dashboard** - Track messages, response times, AI usage  
✅ **Luxury UI** - Modern, professional design with premium fonts  

---

## 📦 Tech Stack

### Backend:
- **FastAPI** (Python)
- **PostgreSQL** (Database)
- **SQLAlchemy** (ORM)
- **Claude AI** (Anthropic API)
- **JWT** (Authentication)

### Frontend:
- **React** (UI)
- **Tailwind CSS** (Styling)
- **Vite** (Build tool)
- **Axios** (API calls)

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your credentials:
# - DATABASE_URL
# - SECRET_KEY
# - ANTHROPIC_API_KEY
# - INSTAGRAM credentials

# Run migrations (create tables)
python -c "from database import Base, engine; Base.metadata.create_all(bind=engine)"

# Start server
uvicorn main:app --reload --port 8000
```

Backend will run on: **http://localhost:8000**

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: **http://localhost:5173**

---

## 🔑 Environment Variables

### Backend (`.env`):

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/chatbot_db

# Security
SECRET_KEY=your-super-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Anthropic Claude AI
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# Instagram
INSTAGRAM_APP_ID=your-app-id
INSTAGRAM_APP_SECRET=your-app-secret
INSTAGRAM_VERIFY_TOKEN=your-verify-token

# URLs
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

---

## 📱 Instagram Setup

### 1. Create Meta Developer App

1. Go to: https://developers.facebook.com/
2. Create new app → **Business**
3. Add **Instagram** product
4. Configure **Webhooks**

### 2. Webhook Configuration

**Callback URL:**
```
https://your-backend-domain.com/api/webhook
```

**Verify Token:** (same as in `.env`)
```
your-verify-token
```

**Subscribe to:** `messages`

### 3. Get Access Token

- Go to Instagram Basic Display
- Generate Long-Lived Access Token
- Save to database for each chatbot

---

## 💎 Usage

### 1. Register Account

```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "full_name": "John Doe"
}
```

### 2. Login

```bash
POST /api/auth/login
{
  "username": "username",
  "password": "password123"
}

# Returns: { "access_token": "xxx", "token_type": "bearer" }
```

### 3. Create Chatbot

```bash
POST /api/chatbots
Authorization: Bearer {access_token}
{
  "name": "Fashion Shop Bot",
  "description": "AI assistant for my fashion e-commerce",
  "instagram_account_id": "123456789"
}
```

### 4. Add Keywords

```bash
POST /api/chatbots/{chatbot_id}/keywords
Authorization: Bearer {access_token}
{
  "keyword": "dostava",
  "response": "Besplatna dostava za porudžbine preko 3000 RSD!",
  "priority": 10
}
```

---

## 🎨 Frontend Pages

- `/` - Landing page
- `/login` - Login
- `/register` - Registration
- `/dashboard` - Main dashboard
- `/dashboard/chatbots` - Chatbot list
- `/dashboard/chatbots/{id}` - Chatbot details
- `/dashboard/chatbots/{id}/keywords` - Keyword management
- `/dashboard/chatbots/{id}/analytics` - Analytics

---

## 📊 Database Schema

### Users
- id, email, username, hashed_password, full_name, is_active, created_at

### Chatbots
- id, name, description, instagram_account_id, instagram_access_token
- ai_enabled, ai_personality, welcome_message
- is_active, owner_id, created_at, updated_at

### Keywords
- id, keyword, response, is_active, priority, chatbot_id, created_at

### Messages
- id, customer_message, bot_response, response_type
- instagram_message_id, customer_instagram_id, customer_name
- response_time_ms, chatbot_id, created_at

---

## 💰 Pricing

### Estimated Monthly Costs:

**Backend Hosting:**
- Render: $7/month (or free tier)
- Railway: $5/month (or free tier)

**Database:**
- Render PostgreSQL: Free (1GB) or $7/month (256MB)
- Supabase: Free (500MB) or $25/month

**API Costs:**
- Anthropic Claude: ~$0.003 per 1K tokens
- Estimate: $10-30/month per 10 clients

**Total: ~$20-50/month**

---

## 🚀 Deployment

### Backend (Render):

1. Create account on https://render.com/
2. New **Web Service**
3. Connect GitHub repo
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables

### Frontend (Vercel):

1. Create account on https://vercel.com/
2. Import GitHub repo
3. Framework: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy!

---

## 🔐 Security Best Practices

- ✅ Use strong SECRET_KEY (32+ characters)
- ✅ Enable HTTPS in production
- ✅ Rotate access tokens regularly
- ✅ Rate limit API endpoints
- ✅ Validate all user inputs
- ✅ Use environment variables (never commit secrets)

---

## 📈 Scaling

**10 clients:** Single server OK  
**50 clients:** Add Redis cache  
**100+ clients:** Load balancer + multiple servers  

---

## 🆘 Support

**Issues:** Open GitHub issue  
**Email:** support@modabot.rs  

---

## 📄 License

MIT License - Free to use for commercial projects

---

## 🎉 Next Steps

1. ✅ Setup backend & frontend locally
2. ✅ Get Anthropic API key
3. ✅ Configure Instagram webhooks
4. ✅ Test with dummy Instagram account
5. ✅ Deploy to production
6. ✅ Find your first client!

---

**Made with ❤️ for ModaBot Platform**
