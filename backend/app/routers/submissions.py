from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException
from fastapi import status
from sqlalchemy.orm import Session
import uuid, os, json
from typing import List, Optional
from .. import models, schemas
from ..db import get_db
from ..config import UPLOADS_DIR

router = APIRouter()

@router.post('/api/v1/kyc/{code}/submissions', response_model=schemas.SubmissionOut)
def create_submission(code: str, data: str = Form(...), files: Optional[List[UploadFile]] = None, db: Session = Depends(get_db)):
    # validate invitation exists
    inv = db.query(models.Invitation).filter(models.Invitation.code == code, models.Invitation.is_active == True).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Invitation not found')

    # parse form JSON payload
    try:
        payload = json.loads(data)
    except Exception:
        payload = {}

    sub_id = 'sub_' + uuid.uuid4().hex
    # Save files to uploads dir (local). Create folder.
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    saved_files = []
    if files:
        for f in files:
            filename = f"{sub_id}_{f.filename}"
            path = os.path.join(UPLOADS_DIR, filename)
            with open(path, 'wb') as fh:
                fh.write(f.file.read())
            saved_files.append(path)

    submission = models.Submission(
        id=sub_id,
        organization_id=inv.organization_id,
        invitation_id=inv.id,
        kyc_session_id=None,
        customer_name=payload.get('customer_name'),
        customer_email=payload.get('customer_email'),
        customer_phone=payload.get('customer_phone'),
        status='submitted',
        metadata=json.dumps({'files': saved_files, **payload.get('metadata', {})})
    )
    db.add(submission)
    # increment usage count
    inv.usage_count = (inv.usage_count or 0) + 1
    db.commit()
    db.refresh(submission)

    return submission
