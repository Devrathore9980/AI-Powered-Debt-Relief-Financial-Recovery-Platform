# Requirement Analysis

## Functional Requirements
- User registration & login (JWT-based authentication)
- Add / view / delete loan records
- AI-generated negotiation strategy per loan
- Settlement percentage prediction (rule-based risk engine)
- AI-generated negotiation email (lender-specific)
- Financial health dashboard (total debt, health status, AI strategies count)
- AI strategy history & debt timeline view
- Forgot password (security question based)
- Delete account

## Non-Functional Requirements
- Secure password storage (hashing)
- Responsive UI (desktop + mobile)
- Free-tier cloud deployment (Render + Vercel)

## Tech Stack
- Frontend: React.js (Vite)
- Backend: FastAPI (Python)
- Database: SQLite + SQLAlchemy ORM
- AI: Google Gemini API
- Auth: JWT + password hashing