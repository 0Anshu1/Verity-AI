from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
import asyncio
import os
import random
import time
import smtplib
from email.mime.text import MIMEText

router = APIRouter(prefix="/api/v1/otp", tags=["otp"])

# Simple in-memory store for demo/dev
OTP_STORE: dict[str, dict] = {}
TTL_SECONDS = 10 * 60


class SendOTPRequest(BaseModel):
  phone: Optional[str] = None
  email: Optional[EmailStr] = None
  purpose: Optional[str] = "phone_verification"


class SendOTPResponse(BaseModel):
  success: bool
  message: str


class VerifyOTPRequest(BaseModel):
  phone: Optional[str] = None
  email: Optional[EmailStr] = None
  otp: str


class VerifyOTPResponse(BaseModel):
  success: bool
  message: str


def _generate_otp() -> str:
  return f"{random.randint(0, 999999):06d}"


async def _send_email(email: str, subject: str, body: str) -> bool:
  host = os.getenv("SMTP_HOST")
  port = int(os.getenv("SMTP_PORT", "587"))
  user = os.getenv("SMTP_USER")
  password = os.getenv("SMTP_PASSWORD")
  from_email = os.getenv("SMTP_FROM_EMAIL") or user

  if not all([host, port, user, password, from_email]):
    return False

  msg = MIMEText(body)
  msg["Subject"] = subject
  msg["From"] = from_email
  msg["To"] = email

  def send_blocking():
    with smtplib.SMTP(host, port) as server:
      server.starttls()
      server.login(user, password)
      server.sendmail(from_email, [email], msg.as_string())

  try:
    await asyncio.to_thread(send_blocking)
    return True
  except Exception:
    return False


@router.post("/send", response_model=SendOTPResponse)
async def send_otp(payload: SendOTPRequest):
  if not payload.phone and not payload.email:
    raise HTTPException(status_code=400, detail="Provide at least phone or email")

  otp = _generate_otp()
  now = int(time.time())

  key = payload.phone or payload.email
  OTP_STORE[key] = {"otp": otp, "expires": now + TTL_SECONDS, "purpose": payload.purpose}

  sms_sent = False
  email_sent = False

  # SMS (provider integration recommended)
  if payload.phone:
    # For production, integrate Twilio, Vonage, or AWS SNS using env vars
    # Here we only log; actual sending requires provider credentials
    print(f"[OTP] SMS to {payload.phone}: {otp}")
    sms_sent = bool(os.getenv("ENABLE_SMS_LOG", "1"))

  # Email via SMTP if configured
  if payload.email:
    email_sent = await _send_email(payload.email, "Your Verification Code", f"Your OTP is {otp}")

  if sms_sent or email_sent:
    return SendOTPResponse(success=True, message="OTP dispatched")
  else:
    return SendOTPResponse(success=True, message="OTP generated (no dispatch configured)")


@router.post("/verify", response_model=VerifyOTPResponse)
async def verify_otp(payload: VerifyOTPRequest):
  key = payload.phone or payload.email
  if not key:
    raise HTTPException(status_code=400, detail="Provide phone or email for verification")

  record = OTP_STORE.get(key)
  if not record:
    raise HTTPException(status_code=404, detail="No OTP request found")

  if int(time.time()) > record["expires"]:
    del OTP_STORE[key]
    raise HTTPException(status_code=410, detail="OTP expired")

  if record["otp"] != payload.otp:
    raise HTTPException(status_code=400, detail="Invalid OTP")

  # Success; cleanup
  del OTP_STORE[key]
  return VerifyOTPResponse(success=True, message="Verification successful")