# 🎨 Chatbot Platform Frontend

Modern, minimalistic React dashboard for managing AI chatbots.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Frontend will run on: **http://localhost:3000**

Backend must be running on: **http://localhost:8000**

## 📦 Features

✅ Login & Registration  
✅ Dashboard with stats  
✅ Chatbot management  
✅ Keyword editor  
✅ Real-time analytics  
✅ Modern, minimalistic design  

## 🎨 Design

- **Style:** Minimalistic, clean, professional
- **Colors:** Monochromatic with black accents
- **Fonts:** Inter (modern sans-serif)
- **Layout:** Spacious, breathable

## 📁 Project Structure

```
src/
├── pages/
│   ├── Login.jsx          # Login page
│   ├── Register.jsx       # Registration page
│   ├── Dashboard.jsx      # Main dashboard
│   └── ChatbotDetail.jsx  # Chatbot management
├── services/
│   └── api.js             # API integration
├── App.jsx                # Main app with routing
├── main.jsx               # Entry point
└── index.css              # Global styles
```

## 🔗 API Endpoints Used

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/chatbots` - List chatbots
- `POST /api/chatbots` - Create chatbot
- `GET /api/chatbots/:id` - Get chatbot details
- `PUT /api/chatbots/:id` - Update chatbot
- `GET /api/chatbots/:id/keywords` - Get keywords
- `POST /api/chatbots/:id/keywords` - Add keyword
- `DELETE /api/keywords/:id` - Delete keyword
- `GET /api/chatbots/:id/messages` - Get messages
- `GET /api/chatbots/:id/analytics` - Get analytics

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## 📝 Usage

### Login

1. Navigate to http://localhost:3000
2. Enter username: `Milan`
3. Enter password: `Milan97`
4. Click "Sign in"

### Create Chatbot

1. Click "New Chatbot" button
2. Enter name and description
3. Click "Create"

### Add Keywords

1. Open a chatbot
2. Click "Add" in Keywords section
3. Enter keyword and response
4. Click "Add Keyword"

### Toggle AI

1. Open a chatbot
2. Toggle "AI Assistant" switch
3. AI responses are now enabled/disabled

## 🎯 Next Steps

- Connect Instagram webhook
- Add more analytics
- Add team management
- Add billing

## 💎 Design Philosophy

**Less is more.** Clean interfaces, clear typography, intuitive interactions.

---

**Made for ModaBot Platform**
