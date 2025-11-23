from sqlalchemy import Column, String, Integer, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Organization(Base):
    __tablename__ = 'organizations'
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String)
    branding = Column(Text)
    settings = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Invitation(Base):
    __tablename__ = 'kyc_invitations'
    id = Column(String, primary_key=True)
    code = Column(String, unique=True, nullable=False)
    organization_id = Column(String, ForeignKey('organizations.id'))
    name = Column(String)
    share_url = Column(String)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    usage_limit = Column(Integer, nullable=True)
    usage_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    custom_branding = Column(Text, nullable=True)
    created_by = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    organization = relationship('Organization')

class Submission(Base):
    __tablename__ = 'customer_submissions'
    id = Column(String, primary_key=True)
    organization_id = Column(String, ForeignKey('organizations.id'))
    invitation_id = Column(String, ForeignKey('kyc_invitations.id'))
    kyc_session_id = Column(String, nullable=True)
    customer_name = Column(String)
    customer_email = Column(String)
    customer_phone = Column(String)
    status = Column(String)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_by = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    risk_score = Column(Integer, nullable=True)
    risk_level = Column(String, nullable=True)
    source_ip = Column(String, nullable=True)
    source_location = Column(String, nullable=True)
    metadata = Column(Text, nullable=True)

    organization = relationship('Organization')
    invitation = relationship('Invitation')


class User(Base):
    __tablename__ = 'auth_users'
    id = Column(String, primary_key=True)
    organization_id = Column(String, ForeignKey('organizations.id'))
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=True)
    role = Column(String, default='admin')
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    organization = relationship('Organization')
