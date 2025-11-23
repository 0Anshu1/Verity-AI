from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin
import uuid


class User(Base, TimestampMixin):
    __tablename__ = "auth_users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=True)
    role = Column(String(50), default="user")  # admin, reviewer, user
    is_active = Column(Boolean, default=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="users")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index("idx_user_email", "email"),
        Index("idx_user_org_id", "organization_id"),
    )
