"""
Invitation service for managing KYC invitation codes.
"""
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.invitation import KYCInvitation
from app.core.security import generate_invitation_code
from app.core.config import settings
from app.schemas import KYCInvitationCreate, KYCInvitationResponse
from fastapi import HTTPException, status
import uuid


class InvitationService:
    @staticmethod
    async def create_invitation(
        db: AsyncSession,
        org_id: str,
        created_by: str,
        invitation_data: KYCInvitationCreate,
    ) -> KYCInvitationResponse:
        """Create a new invitation code."""
        code = generate_invitation_code()
        
        # Set expiration (90 days from now if not specified)
        expires_at = invitation_data.expires_at or (datetime.now(timezone.utc) + timedelta(days=90))
        
        # Generate share URL
        share_url = f"{settings.FRONTEND_URL}/kyc/invite/{code}"
        
        invitation = KYCInvitation(
            id=str(uuid.uuid4()),
            code=code,
            organization_id=org_id,
            name=invitation_data.name,
            share_url=share_url,
            expires_at=expires_at,
            usage_limit=invitation_data.usage_limit,
            usage_count=0,
            is_active=True,
            custom_branding=invitation_data.custom_branding,
            created_by=created_by,
        )
        db.add(invitation)
        await db.commit()
        await db.refresh(invitation)
        
        return KYCInvitationResponse.model_validate(invitation)
    
    @staticmethod
    async def get_invitation_by_code(
        db: AsyncSession,
        code: str,
    ) -> KYCInvitation:
        """Get invitation by code (public endpoint)."""
        result = await db.execute(
            select(KYCInvitation).where(KYCInvitation.code == code)
        )
        invitation = result.scalar_one_or_none()
        
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found",
            )
        
        # Check if active
        if not invitation.is_active:
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="This invitation link has been revoked",
            )
        
        # Check expiration
        if invitation.expires_at and invitation.expires_at < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="This invitation link has expired",
            )
        
        # Check usage limit
        if invitation.usage_limit and invitation.usage_count >= invitation.usage_limit:
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="This invitation link has reached its usage limit",
            )
        
        return invitation
    
    @staticmethod
    async def list_org_invitations(
        db: AsyncSession,
        org_id: str,
        skip: int = 0,
        limit: int = 10,
    ) -> tuple[int, list[KYCInvitation]]:
        """List invitations for an organization."""
        # Get total count
        count_result = await db.execute(
            select(KYCInvitation).where(KYCInvitation.organization_id == org_id)
        )
        total = len(count_result.scalars().all())
        
        # Get paginated results
        result = await db.execute(
            select(KYCInvitation)
            .where(KYCInvitation.organization_id == org_id)
            .offset(skip)
            .limit(limit)
            .order_by(KYCInvitation.created_at.desc())
        )
        invitations = result.scalars().all()
        
        return total, invitations
    
    @staticmethod
    async def increment_usage(
        db: AsyncSession,
        invitation: KYCInvitation,
    ) -> None:
        """Increment usage count for an invitation."""
        invitation.usage_count += 1
        await db.commit()
    
    @staticmethod
    async def revoke_invitation(
        db: AsyncSession,
        org_id: str,
        invitation_id: str,
    ) -> KYCInvitationResponse:
        """Revoke an invitation."""
        result = await db.execute(
            select(KYCInvitation).where(
                (KYCInvitation.id == invitation_id) &
                (KYCInvitation.organization_id == org_id)
            )
        )
        invitation = result.scalar_one_or_none()
        
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found",
            )
        
        invitation.is_active = False
        await db.commit()
        await db.refresh(invitation)
        
        return KYCInvitationResponse.model_validate(invitation)
