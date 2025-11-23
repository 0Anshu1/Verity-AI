from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas
from ..db import get_db
from ..security import get_password_hash, verify_password, create_access_token
import uuid
from pydantic import BaseModel

router = APIRouter()


class LoginIn(BaseModel):
    email: str
    password: str


class SignupIn(BaseModel):
    email: str
    password: str
    org_name: str


@router.post('/api/v1/auth/signup')
def signup(payload: SignupIn, db: Session = Depends(get_db)):
    # create org
    org_id = 'org_' + uuid.uuid4().hex
    org = models.Organization(id=org_id, name=payload.org_name, email=payload.email)
    db.add(org)

    # create user
    user_id = 'user_' + uuid.uuid4().hex
    user = models.User(id=user_id, organization_id=org_id, email=payload.email, password_hash=get_password_hash(payload.password), name=payload.email.split('@')[0], role='admin')
    db.add(user)
    db.commit()
    return {'message': 'signup successful', 'organization_id': org_id, 'user_id': user_id}


@router.post('/api/v1/auth/login')
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials')

    token = create_access_token({'sub': user.id, 'org': user.organization_id})
    return {'access_token': token, 'token_type': 'bearer', 'user': {'id': user.id, 'email': user.email, 'organization_id': user.organization_id}}


@router.post('/api/v1/auth/refresh')
def refresh(token: str):
    # For simplicity, we issue long-lived access tokens; refresh can be implemented later
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail='Refresh endpoint not implemented')
