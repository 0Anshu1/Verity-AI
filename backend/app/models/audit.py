from sqlalchemy import Column, String, Text, DateTime, JSON, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin
import uuid


class AuditLog(Base, TimestampMixin):
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    user_id = Column(String, ForeignKey("auth_users.id"), nullable=True)
    action = Column(String(100), nullable=False)  # create, update, delete, approve, reject, etc.
    target_type = Column(String(50), nullable=False)  # invitation, submission, session, etc.
    target_id = Column(String, nullable=True)
    details = Column(JSON, nullable=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="audit_logs")
    user = relationship("User", back_populates="audit_logs")
    
    __table_args__ = (
        Index("idx_audit_org_id", "organization_id"),
        Index("idx_audit_user_id", "user_id"),
        Index("idx_audit_action", "action"),
        Index("idx_audit_target", "target_type", "target_id"),
    )
