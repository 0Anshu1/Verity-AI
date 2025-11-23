from sqlalchemy import Column, String, Text, DateTime, Integer, JSON, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin
import uuid


class KYCSession(Base, TimestampMixin):
    __tablename__ = "kyc_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    customer_id = Column(String, nullable=True)
    invitation_id = Column(String, ForeignKey("kyc_invitations.id"), nullable=True)
    status = Column(String(50), default="pending")  # pending, submitted, approved, rejected, needs_review
    current_step = Column(Integer, default=0)
    
    # Data fields
    user_info = Column(JSON, nullable=True)
    phone_verification = Column(JSON, nullable=True)
    document = Column(JSON, nullable=True)
    biometric = Column(JSON, nullable=True)
    gps = Column(JSON, nullable=True)
    risk_assessment = Column(JSON, nullable=True)
    
    # Review fields
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_by = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="sessions")
    invitation = relationship("KYCInvitation", back_populates="sessions")
    submission = relationship("CustomerSubmission", back_populates="session", uselist=False)
    
    __table_args__ = (
        Index("idx_session_org_id", "organization_id"),
        Index("idx_session_status", "status"),
        Index("idx_session_inv_id", "invitation_id"),
    )
