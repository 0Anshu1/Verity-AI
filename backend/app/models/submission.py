from sqlalchemy import Column, String, Text, DateTime, Integer, JSON, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin
import uuid


class CustomerSubmission(Base, TimestampMixin):
    __tablename__ = "customer_submissions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    invitation_id = Column(String, ForeignKey("kyc_invitations.id"), nullable=False)
    kyc_session_id = Column(String, ForeignKey("kyc_sessions.id"), nullable=True)
    
    # Customer info
    customer_name = Column(String(255), nullable=True)
    customer_email = Column(String(255), nullable=True)
    customer_phone = Column(String(20), nullable=True)
    
    # Status
    status = Column(String(50), default="submitted")  # submitted, approved, rejected, needs_review, archived
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_by = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Risk assessment
    risk_score = Column(Integer, nullable=True)  # 0-100
    risk_level = Column(String(50), nullable=True)  # green, amber, red
    
    # Context
    source_ip = Column(String(50), nullable=True)
    source_location = Column(String(255), nullable=True)
    submission_metadata = Column(JSON, nullable=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="submissions")
    invitation = relationship("KYCInvitation", back_populates="submissions")
    session = relationship("KYCSession", back_populates="submission")
    
    __table_args__ = (
        Index("idx_sub_org_id", "organization_id"),
        Index("idx_sub_inv_id", "invitation_id"),
        Index("idx_sub_status", "status"),
        Index("idx_sub_email", "customer_email"),
    )
