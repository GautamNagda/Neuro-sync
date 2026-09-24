# 🧠 Neuro Sync AI — AI Mental Health Screening Platform

A government-deployable, full-stack AI-powered mental health screening platform built on WHO guidelines and validated psychiatric screening tools.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Frontend | React + Vite + Tailwind CSS + Framer Motion |
| Auth | JWT + bcrypt + HTTP-only cookies |
| AI/NLP | Anthropic Claude API (claude-sonnet-4-20250514) |
| Voice | Web Speech API + AssemblyAI |
| PDF Reports | pdfkit |
| Charts | Chart.js + react-chartjs-2 |
| i18n | i18next (9 languages) |

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Configure
```bash
# Configure environment variables
cd server
cp .env.example .env   # or edit .env directly
# Set MONGO_URI to your MongoDB connection string
```

### 2. Install & Run Backend
```bash
cd server
npm install
npm run dev    # Starts on http://localhost:5000
```

### 3. Install & Run Frontend
```bash
cd client
npm install
npm run dev    # Starts on http://localhost:5173
```

## Features

- **PHQ-9 Depression Screening** — Validated 9-question assessment
- **GAD-7 Anxiety Assessment** — Evidence-based anxiety screening
- **MindBot AI Chatbot** — Compassionate conversational AI (Claude-powered)
- **Voice Journal** — Record thoughts, get emotional tone analysis
- **3 AI Scenario Games** — Indirect screening through interactive scenarios
- **Dashboard** — Charts, screening history, progress tracking
- **PDF Reports** — Downloadable reports with clinical formatting
- **9 Languages** — EN, HI, BN, TA, TE, MR, FR, ES, AR
- **Crisis Detection** — Auto-display helpline modal when risk detected
- **GDPR Compliant** — Full data export + account deletion

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login (JWT cookie) |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |
| POST | `/api/screening` | Submit screening |
| GET | `/api/screening` | Get screening history |
| POST | `/api/chat/send` | Send message to MindBot |
| GET | `/api/chat/sessions` | Get chat sessions |
| POST | `/api/voice/upload` | Upload voice recording |
| GET | `/api/games/scenarios/:type` | Get game scenarios |
| POST | `/api/games/submit` | Submit game response |
| GET | `/api/reports/generate/:id` | Generate PDF report |
| GET | `/api/user/export` | Export all user data |
| DELETE | `/api/user/me` | Delete account (GDPR) |

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT in HTTP-only, Secure, SameSite=Strict cookies
- Rate limiting (5 auth attempts / 15 min)
- Helmet.js security headers
- CORS restricted to known origins
- No third-party tracking scripts

## Crisis Helplines

- **iCall**: 9152987821
- **Vandrevala Foundation**: 1860-2662-345
- **NIMHANS**: 080-46110007
- **Emergency**: 112

## Disclaimer

This platform is for screening purposes only and does not constitute a clinical diagnosis. Please consult a licensed mental health professional for a comprehensive evaluation.
