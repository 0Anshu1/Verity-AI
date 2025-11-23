"""
Auth service for handling authentication logic.
"""
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from app.models.user import User
from app.models.organization import Organization
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.schemas import UserLogin, UserSignup, TokenResponse
from fastapi import HTTPException, status
import uuid


class AuthService:
    @staticmethod
    async def register_user(
        db: AsyncSession,
        signup_data: UserSignup,
    ) -> TokenResponse:
        """Register a new organization and user."""
        # Check if email exists
        result = await db.execute(select(User).where(User.email == signup_data.email))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )
        
        # Create organization
        org = Organization(
            id=str(uuid.uuid4()),
            name=signup_data.organization_name,
            email=signup_data.email,
            plan="starter",
        )
        db.add(org)
        await db.flush()
        
        # Create user
        user = User(
            id=str(uuid.uuid4()),
            organization_id=org.id,
            email=signup_data.email,
            password_hash=hash_password(signup_data.password),
            name=signup_data.name,
            role="admin",
            is_active=True,
        )
        db.add(user)
        await db.commit()
        
        # Generate tokens
        access_token = create_access_token({
            "sub": user.id,
            "org_id": org.id,
            "email": user.email,
            "role": user.role,
        })
        refresh_token = create_refresh_token({
            "sub": user.id,
            "org_id": org.id,
        })
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user_id=user.id,
            organization_id=org.id,
            organization_name=org.name,
        )
    
    @staticmethod
    async def login_user(
        db: AsyncSession,
        login_data: UserLogin,
    ) -> TokenResponse:
        """Authenticate user and return tokens."""
        result = await db.execute(
            select(User).options(selectinload(User.organization)).where(User.email == login_data.email)
        )
        user = result.scalar_one_or_none()
        
        if not user or not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive",
            )
        
        # Generate tokens
        access_token = create_access_token({
            "sub": user.id,
            "org_id": user.organization_id,
            "email": user.email,
            "role": user.role,
        })
        refresh_token = create_refresh_token({
            "sub": user.id,
            "org_id": user.organization_id,
        })
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user_id=user.id,
            organization_id=user.organization_id,
            organization_name=user.organization.name,
        )
    
    @staticmethod
    async def refresh_access_token(
        db: AsyncSession,
        refresh_token: str,
    ) -> TokenResponse:
        """Refresh access token using refresh token."""
        from app.core.security import decode_token
        
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )
        
        user_id = payload.get("sub")
        org_id = payload.get("org_id")
        
        result = await db.execute(
            select(User).options(selectinload(User.organization)).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive",
            )
        
        access_token = create_access_token({
            "sub": user.id,
            "org_id": user.organization_id,
            "email": user.email,
            "role": user.role,
        })
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user_id=user.id,
            organization_id=user.organization_id,
            organization_name=user.organization.name,
        )
