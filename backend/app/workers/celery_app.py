"""
Celery background tasks (placeholder - will integrate with trained models)
"""
from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "verity_ai",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)


@celery_app.task
def process_ocr_task(session_id: str, document_url: str):
    """Process OCR extraction task."""
    # Placeholder - will integrate real OCR model
    return {"session_id": session_id, "ocr_result": {}}


@celery_app.task
def check_liveness_task(session_id: str, video_url: str):
    """Check liveness task."""
    # Placeholder - will integrate real liveness model
    return {"session_id": session_id, "liveness_result": {}}


@celery_app.task
def calculate_risk_score_task(submission_id: str, submission_data: dict):
    """Calculate risk score task."""
    # Placeholder - will integrate real risk scoring
    return {"submission_id": submission_id, "risk_score": 50}


@celery_app.task
def send_email_task(to_email: str, subject: str, html_content: str):
    """Send email task."""
    # Placeholder - will integrate email service
    return {"email": to_email, "sent": True}
