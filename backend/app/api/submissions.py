"""
Submission endpoints
"""
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.security import get_current_user
from app.schemas import (
    CustomerSubmissionCreate,
    CustomerSubmissionResponse,
    PaginatedResponse,
    SubmissionApprove,
    SubmissionReject,
    UserInfoData,
)
from app.services.submission import SubmissionService
from app.services.invitation import InvitationService
from app.services.email import email_service
import json

router = APIRouter(tags=["submissions"])


@router.post("/api/v1/kyc/submissions", response_model=CustomerSubmissionResponse)
async def create_submission(
    invitation_code: str,
    customer_name: str,
    customer_email: str,
    customer_phone: str,
    user_info: str,  # JSON string
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Create KYC submission (public)."""
    # Validate invitation
    invitation = await InvitationService.get_invitation_by_code(db, invitation_code)
    
    # Parse user info
    try:
        user_info_dict = json.loads(user_info)
        user_info_data = UserInfoData(**user_info_dict)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user info format",
        )
    
    # Create submission data
    submission_data = CustomerSubmissionCreate(
        invitation_code=invitation_code,
        customer_name=customer_name,
        customer_email=customer_email,
        customer_phone=customer_phone,
        user_info=user_info_data,
    )
    
    # Create submission
    submission = await SubmissionService.create_submission(db, invitation, submission_data)
    
    # Send confirmation email
    await email_service.send_submission_confirmation(customer_email, submission.id)
    
    return CustomerSubmissionResponse.model_validate(submission)


@router.get("/api/v1/submissions/{submission_id}", response_model=CustomerSubmissionResponse)
async def get_submission(
    submission_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Get submission details (org authenticated)."""
    submission = await SubmissionService.get_submission(
        db,
        current_user["organization_id"],
        submission_id,
    )
    return CustomerSubmissionResponse.model_validate(submission)


@router.get("/api/v1/submissions", response_model=PaginatedResponse)
async def list_submissions(
    status: str = None,
    skip: int = 0,
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """List submissions for organization (org authenticated)."""
    total, submissions = await SubmissionService.list_submissions(
        db,
        current_user["organization_id"],
        status,
        skip,
        limit,
    )
    return PaginatedResponse(
        total=total,
        skip=skip,
        limit=limit,
        items=[CustomerSubmissionResponse.model_validate(sub) for sub in submissions],
    )


@router.post("/api/v1/submissions/{submission_id}/approve", response_model=CustomerSubmissionResponse)
async def approve_submission(
    submission_id: str,
    approve_data: SubmissionApprove,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Approve a submission (org authenticated)."""
    submission = await SubmissionService.approve_submission(
        db,
        current_user["organization_id"],
        submission_id,
        current_user["user_id"],
        approve_data,
    )
    
    # Send approval email
    await email_service.send_submission_approved(submission.customer_email, submission.id)
    
    return CustomerSubmissionResponse.model_validate(submission)


@router.post("/api/v1/submissions/{submission_id}/reject", response_model=CustomerSubmissionResponse)
async def reject_submission(
    submission_id: str,
    reject_data: SubmissionReject,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Reject a submission (org authenticated)."""
    submission = await SubmissionService.reject_submission(
        db,
        current_user["organization_id"],
        submission_id,
        current_user["user_id"],
        reject_data,
    )
    
    # Send rejection email
    await email_service.send_submission_rejected(
        submission.customer_email,
        submission.id,
        reject_data.reason,
    )
    
    return CustomerSubmissionResponse.model_validate(submission)
