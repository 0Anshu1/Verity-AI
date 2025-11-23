"""
Organization endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.organization import Organization
from app.schemas import OrganizationResponse

router = APIRouter(prefix="/api/v1/org", tags=["organization"])


@router.get("/me", response_model=OrganizationResponse)
async def get_org_info(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Get current organization info."""
    result = await db.execute(
        select(Organization).where(Organization.id == current_user["organization_id"])
    )
    org = result.scalar_one()
    return OrganizationResponse.model_validate(org)
