# Apply SQLAlchemy compatibility patch for Python 3.13+ before any imports
from . import compat  # noqa: F401

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth as legacy_auth, invitations as legacy_invitations, submissions as legacy_submissions
from .api.ai import router as ai_router
from .api.otp import router as otp_router
from .db import engine
from .models import Base
import os
from .config import UPLOADS_DIR

app = FastAPI(title='Verity-AI Backend', docs_url='/api/docs')

# Configure CORS - MUST be added before other middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],  # Add production origins here
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods including OPTIONS
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.on_event('startup')
def startup():
    # create DB tables if they don't exist (simple dev flow)
    Base.metadata.create_all(bind=engine)
    os.makedirs(UPLOADS_DIR, exist_ok=True)


app.include_router(ai_router)
app.include_router(otp_router)
app.include_router(legacy_auth.router)
app.include_router(legacy_invitations.router)
app.include_router(legacy_submissions.router)


@app.get('/healthz')
def health():
    return {'status': 'ok'}
