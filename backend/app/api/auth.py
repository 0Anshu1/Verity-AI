"""
Auth endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas import UserLogin, UserSignup, TokenResponse, RefreshTokenRequest
from app.services.auth import AuthService
from app.core.security import decode_token

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse)
async def signup(signup_data: UserSignup, db: AsyncSession = Depends(get_db)):
    """Register a new organization and user."""
    return await AuthService.register_user(db, signup_data)


@router.post("/login", response_model=TokenResponse)
async def login(login_data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login user and get tokens."""
    return await AuthService.login_user(db, login_data)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Refresh access token."""
    return await AuthService.refresh_access_token(db, request.refresh_token)
