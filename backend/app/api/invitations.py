"""
Invitation endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.security import get_current_user
from app.schemas import KYCInvitationCreate, KYCInvitationResponse, KYCInvitationValidate, PaginatedResponse
from app.services.invitation import InvitationService
from app.models.invitation import KYCInvitation

router = APIRouter(tags=["invitations"])


@router.post("/api/v1/invitations", response_model=KYCInvitationResponse)
async def create_invitation(
    invitation_data: KYCInvitationCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Create a new invitation link (org authenticated)."""
    return await InvitationService.create_invitation(
        db,
        current_user["organization_id"],
        current_user["user_id"],
        invitation_data,
    )


@router.get("/api/v1/invitations", response_model=PaginatedResponse)
async def list_invitations(
    skip: int = 0,
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """List invitations for organization."""
    total, invitations = await InvitationService.list_org_invitations(
        db,
        current_user["organization_id"],
        skip,
        limit,
    )
    return PaginatedResponse(
        total=total,
        skip=skip,
        limit=limit,
        items=[KYCInvitationResponse.model_validate(inv) for inv in invitations],
    )


@router.get("/api/v1/invitations/{code}/validate", response_model=KYCInvitationValidate)
async def validate_invitation(
    code: str,
    db: AsyncSession = Depends(get_db),
):
    """Validate invitation code (public)."""
    try:
        invitation = await InvitationService.get_invitation_by_code(db, code)
        return KYCInvitationValidate(
            valid=True,
            invitation=KYCInvitationResponse.model_validate(invitation),
        )
    except HTTPException as e:
        return KYCInvitationValidate(
            valid=False,
            reason=e.detail,
        )


@router.post("/api/v1/invitations/{invitation_id}/revoke", response_model=KYCInvitationResponse)
async def revoke_invitation(
    invitation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Revoke an invitation."""
    return await InvitationService.revoke_invitation(
        db,
        current_user["organization_id"],
        invitation_id,
    )
