from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from .config import SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES
import hashlib

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
ALGORITHM = 'HS256'
BCRYPT_MAX_LENGTH = 72

def _prepare_password(password: str) -> str:
    """
    Prepare password for bcrypt hashing.
    If password is longer than 72 bytes, hash it with SHA-256 first.
    This ensures bcrypt compatibility while maintaining security.
    Returns a string that when encoded to UTF-8 will be <= 72 bytes.
    """
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > BCRYPT_MAX_LENGTH:
        # Hash long passwords with SHA-256 before passing to bcrypt
        # SHA-256 hex digest is 64 characters (64 bytes when encoded as ASCII)
        # which is less than 72 bytes
        return hashlib.sha256(password_bytes).hexdigest()
    
    # For passwords <= 72 bytes, return as-is
    return password

def get_password_hash(password: str) -> str:
    prepared_password = _prepare_password(password)
    # Double-check the length to be absolutely safe
    password_bytes = prepared_password.encode('utf-8')
    if len(password_bytes) > BCRYPT_MAX_LENGTH:
        # Truncate to 72 bytes if somehow still too long
        prepared_password = password_bytes[:BCRYPT_MAX_LENGTH].decode('utf-8', errors='replace')
    return pwd_context.hash(prepared_password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    prepared_password = _prepare_password(plain_password)
    # Double-check the length to be absolutely safe
    password_bytes = prepared_password.encode('utf-8')
    if len(password_bytes) > BCRYPT_MAX_LENGTH:
        # Truncate to 72 bytes if somehow still too long
        prepared_password = password_bytes[:BCRYPT_MAX_LENGTH].decode('utf-8', errors='replace')
    return pwd_context.verify(prepared_password, hashed_password)

def create_access_token(data: dict, expires_minutes: Optional[int] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=(expires_minutes or ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({'exp': expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise
