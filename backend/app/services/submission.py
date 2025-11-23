"""
Submission service for managing KYC submissions.
"""
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.session import KYCSession
from app.models.submission import CustomerSubmission
from app.models.invitation import KYCInvitation
from app.core.config import settings
from app.schemas import CustomerSubmissionCreate, SubmissionApprove, SubmissionReject
from fastapi import HTTPException, status
import uuid
import random


class SubmissionService:
    @staticmethod
    async def create_submission(
        db: AsyncSession,
        invitation: KYCInvitation,
        submission_data: CustomerSubmissionCreate,
    ) -> CustomerSubmission:
        """Create a new KYC submission."""
        # Create KYC session first
        session = KYCSession(
            id=str(uuid.uuid4()),
            organization_id=invitation.organization_id,
            customer_id=str(uuid.uuid4()),
            invitation_id=invitation.id,
            status="submitted",
            current_step=11,  # All steps completed
            user_info=submission_data.user_info.model_dump() if submission_data.user_info else None,
            phone_verification=submission_data.phone_verification.model_dump() if submission_data.phone_verification else None,
            document=submission_data.document.model_dump() if submission_data.document else None,
            biometric=submission_data.biometric.model_dump() if submission_data.biometric else None,
            gps=submission_data.gps.model_dump() if submission_data.gps else None,
            submitted_at=datetime.now(timezone.utc),
        )
        db.add(session)
        await db.flush()
        
        # Create submission record
        submission = CustomerSubmission(
            id=str(uuid.uuid4()),
            organization_id=invitation.organization_id,
            invitation_id=invitation.id,
            kyc_session_id=session.id,
            customer_name=submission_data.customer_name,
            customer_email=submission_data.customer_email,
            customer_phone=submission_data.customer_phone,
            status="submitted",
            submitted_at=datetime.now(timezone.utc),
            risk_score=random.randint(20, 80),  # Placeholder - will be replaced with real scoring
            risk_level="green" if random.random() > 0.3 else "amber",  # Placeholder
            source_ip="0.0.0.0",  # Will be captured from request in router
            source_location="Unknown",  # Will be geocoded in future
        )
        db.add(submission)
        
        # Increment invitation usage
        invitation.usage_count += 1
        
        await db.commit()
        await db.refresh(submission)
        
        return submission
    
    @staticmethod
    async def get_submission(
        db: AsyncSession,
        org_id: str,
        submission_id: str,
    ) -> CustomerSubmission:
        """Get a submission by ID."""
        result = await db.execute(
            select(CustomerSubmission).where(
                and_(
                    CustomerSubmission.id == submission_id,
                    CustomerSubmission.organization_id == org_id,
                )
            )
        )
        submission = result.scalar_one_or_none()
        
        if not submission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Submission not found",
            )
        
        return submission
    
    @staticmethod
    async def list_submissions(
        db: AsyncSession,
        org_id: str,
        status_filter: str = None,
        skip: int = 0,
        limit: int = 10,
    ) -> tuple[int, list[CustomerSubmission]]:
        """List submissions for an organization."""
        query = select(CustomerSubmission).where(CustomerSubmission.organization_id == org_id)
        
        if status_filter:
            query = query.where(CustomerSubmission.status == status_filter)
        
        # Get total count
        count_result = await db.execute(query)
        total = len(count_result.scalars().all())
        
        # Get paginated results
        result = await db.execute(
            query.offset(skip).limit(limit).order_by(CustomerSubmission.submitted_at.desc())
        )
        submissions = result.scalars().all()
        
        return total, submissions
    
    @staticmethod
    async def approve_submission(
        db: AsyncSession,
        org_id: str,
        submission_id: str,
        reviewed_by: str,
        approve_data: SubmissionApprove,
    ) -> CustomerSubmission:
        """Approve a submission."""
        submission = await SubmissionService.get_submission(db, org_id, submission_id)
        
        submission.status = "approved"
        submission.reviewed_at = datetime.now(timezone.utc)
        submission.reviewed_by = reviewed_by
        submission.notes = approve_data.notes
        
        await db.commit()
        await db.refresh(submission)
        
        return submission
    
    @staticmethod
    async def reject_submission(
        db: AsyncSession,
        org_id: str,
        submission_id: str,
        reviewed_by: str,
        reject_data: SubmissionReject,
    ) -> CustomerSubmission:
        """Reject a submission."""
        submission = await SubmissionService.get_submission(db, org_id, submission_id)
        
        submission.status = "rejected"
        submission.reviewed_at = datetime.now(timezone.utc)
        submission.reviewed_by = reviewed_by
        submission.notes = f"Rejection reason: {reject_data.reason}\n\n{reject_data.notes or ''}"
        
        await db.commit()
        await db.refresh(submission)
        
        return submission
