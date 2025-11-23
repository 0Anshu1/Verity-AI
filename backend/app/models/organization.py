from sqlalchemy import Column, String, Text, DateTime, Boolean, Integer, JSON, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin
import uuid


class Organization(Base, TimestampMixin):
    __tablename__ = "organizations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    plan = Column(String(50), default="starter")  # starter, business, enterprise
    settings = Column(JSON, nullable=True)
    branding = Column(JSON, nullable=True)
    
    # Relationships
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    invitations = relationship("KYCInvitation", back_populates="organization", cascade="all, delete-orphan")
    sessions = relationship("KYCSession", back_populates="organization", cascade="all, delete-orphan")
    submissions = relationship("CustomerSubmission", back_populates="organization", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="organization", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index("idx_org_name", "name"),
        Index("idx_org_email", "email"),
    )
