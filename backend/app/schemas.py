from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, Any
from datetime import datetime


class InvitationCreate(BaseModel):
    name: Optional[str] = None
    usage_limit: Optional[int] = None
    expires_at: Optional[datetime] = None
    custom_branding: Optional[Any] = None


class InvitationOut(BaseModel):
    id: str
    code: str
    organization_id: str
    name: Optional[str] = None
    share_url: Optional[str] = None
    usage_limit: Optional[int] = None
    usage_count: int
    is_active: bool
    custom_branding: Optional[Any] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SubmissionCreate(BaseModel):
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    submission_metadata: Optional[Any] = None


class SubmissionOut(BaseModel):
    id: str
    organization_id: str
    invitation_id: str
    status: Optional[str] = None
    submitted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
