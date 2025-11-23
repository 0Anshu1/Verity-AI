from sqlalchemy.orm import declarative_base
from datetime import datetime
from sqlalchemy import Column, DateTime, func

Base = declarative_base()


class TimestampMixin:
    """Mixin for timestamp columns."""
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
