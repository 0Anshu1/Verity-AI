from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid
from typing import Optional
from .. import models, schemas
from ..db import get_db
from ..dependencies import get_current_org

router = APIRouter()


@router.post('/api/v1/invitations', response_model=schemas.InvitationOut)
def create_invitation(payload: schemas.InvitationCreate, db: Session = Depends(get_db), organization_id: str = Depends(get_current_org)):
    code = 'KYC' + uuid.uuid4().hex[:10].upper()
    inv = models.Invitation(
        id='inv_' + uuid.uuid4().hex,
        code=code,
        organization_id=organization_id,
        name=payload.name,
        share_url=f"/kyc/invite/{code}",
        expires_at=payload.expires_at,
        usage_limit=payload.usage_limit,
        usage_count=0,
        is_active=True,
        custom_branding=str(payload.custom_branding) if payload.custom_branding else None,
        created_by=organization_id,
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv


@router.get('/api/v1/invitations/{code}', response_model=schemas.InvitationOut)
def get_invitation(code: str, db: Session = Depends(get_db)):
    inv = db.query(models.Invitation).filter(models.Invitation.code == code, models.Invitation.is_active == True).first()
    if not inv:
        raise HTTPException(status_code=404, detail='Invitation not found')
    # check expiry/usage
    return inv
