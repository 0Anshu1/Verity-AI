# Verity AI — KYC Verification Platform

Verity AI is a full-stack platform for customer KYC verification. It provides a guided, mobile-friendly KYC flow for end-users and an organization-facing backend with secure APIs, data models, and AI-assisted checks such as OCR, face verification, liveness, and risk scoring.

## Highlights
- Customer-facing KYC flow with progressive steps and live feedback
- Organization invitations to onboard customers via secure links
- Document OCR using pretrained models
- Face match and liveness checks with graceful fallbacks
- Risk scoring and review workflow
- Modern, responsive UI with step progress and accessibility

## Architecture

flowchart LR
  subgraph Client["Frontend: React + Vite"]
    UI["Customer + Org UIs"]
    Store["Zustand Session Store"]
    I18n["I18n Service"]
    APIClient["Fetch / axios"]
  end

  subgraph Backend["Backend: FastAPI"]
    Auth["Auth: signup / login / refresh"]
    Inv["Invitations: create / list / validate"]
    Sub["Submissions: create / approve / reject"]
    OTP["OTP: send / verify"]
    AI["AI: OCR / Face / Liveness / Risk"]
    Svc["Services Layer"]
    Models["SQLAlchemy Models"]
  end

  subgraph External["External Providers"]
    SMTP["SMTP Email"]
    SMS["SMS Gateway"]
    Storage["Object Storage"]
    Redis["Redis Cache"]
    Workers["Celery Workers"]
  end

  UI --> APIClient --> Auth
  UI --> APIClient --> Inv
  UI --> APIClient --> Sub
  UI --> APIClient --> OTP
  UI --> APIClient --> AI

  Auth --> Models
  Inv --> Models
  Sub --> Models
  AI --> Svc --> Models

  OTP -- dispatch --> SMTP
  OTP -- dispatch --> SMS
  Svc --> Storage
  Workers --> Redis
  Svc --> Workers


## Tech Stack
- Frontend: React 18, Vite, TypeScript, React Router, Zustand, axios, lucide-react
- Backend: FastAPI, Pydantic v2, SQLAlchemy 2.x, Alembic, JWT (PyJWT / python-jose)
- Workers: Celery 5, Redis
- AI Models:
  - OCR: PaddleOCR (pretrained)
  - Face Verification: InsightFace (ONNXRuntime), with fallback when unavailable
  - Liveness: lightweight placeholder, ready for model integration
- Storage: Local filesystem (dev) with pluggable provider for cloud

## Repository Layout
- `frontend_new/` — React application (customer and org UIs)
  - `src/pages/*` — KYC steps (document capture, selfie, liveness, GPS, risk)
  - `src/services/api.ts` — Calls backend OCR/face/liveness/risk endpoints
  - `src/store/kycStore.ts` — Session state and navigation
- `backend/` — FastAPI service
  - `app/api/ai.py` — AI endpoints (OCR/Face/Liveness/Risk)
  - `app/services/ai_models.py` — Model loaders and fallbacks
  - `app/routers/*` — Legacy endpoints for invitations and submissions
  - `app/models/*` — SQLAlchemy models for sessions and submissions
  - `app/main.py` — App init, CORS, router registration

## Key Backend Endpoints
- `POST /api/v1/ai/ocr` — Upload document image and receive extracted fields
- `POST /api/v1/ai/face/verify` — Upload selfie and document image, returns match confidence
- `POST /api/v1/ai/liveness` — Upload liveness input (image/video), returns liveness signal
- `POST /api/v1/ai/risk` — Post factor scores to compute overall risk level
- `POST /api/v1/invitations` — Create KYC invitation (org)
- `GET /api/v1/invitations/{code}` — Fetch invitation details by code
- `POST /api/v1/kyc/{code}/submissions` — Submit customer KYC payload and uploaded files

## KYC Flow (Frontend)
1. Welcome and language/theme selection
2. User info and phone verification (OTP)
3. Document selection and capture
4. OCR extraction and review
5. Selfie capture and face match
6. Liveness checks
7. GPS capture and address verification
8. Risk summary and final submission

## Development
### Backend
- Environment: `backend/.env` (DATABASE_URL, JWT, STORAGE_PATH)
- Run server: `uvicorn app.main:app --host 127.0.0.1 --port 8000`
- Docs: `http://127.0.0.1:8000/api/docs`

### Frontend
- Dev: `npm run dev` in `frontend_new/`
- Build: `npm run build`
- Preview: `npm run preview`

## Security Practices
- Never log secrets; JWT keys loaded via env
- CORS configured for local dev; add production origins
- Input validation via Pydantic; file uploads handled safely
- Graceful model fallbacks to avoid leaking server errors

## Notes
- Some AI dependencies (InsightFace, ONNXRuntime) may require platform-specific tooling on Windows. The service includes fallbacks to keep endpoints responsive when these packages are unavailable.