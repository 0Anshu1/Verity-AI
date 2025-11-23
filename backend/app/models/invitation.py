from sqlalchemy import Column, String, Text, DateTime, Boolean, Integer, JSON, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin
import uuid


class KYCInvitation(Base, TimestampMixin):
    __tablename__ = "kyc_invitations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(100), unique=True, nullable=False)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    name = Column(String(255), nullable=True)
    share_url = Column(String(500), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    usage_limit = Column(Integer, nullable=True)
    usage_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    custom_branding = Column(JSON, nullable=True)
    created_by = Column(String, nullable=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="invitations")
    sessions = relationship("KYCSession", back_populates="invitation", cascade="all, delete-orphan")
    submissions = relationship("CustomerSubmission", back_populates="invitation", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index("idx_inv_code", "code"),
        Index("idx_inv_org_id", "organization_id"),
        Index("idx_inv_is_active", "is_active"),
    )
