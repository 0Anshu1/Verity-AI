"""
Email service for sending notifications.
"""
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
from typing import List


class EmailService:
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        """Send email."""
        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = self.from_email
            message["To"] = to_email
            
            if text_content:
                message.attach(MIMEText(text_content, "plain"))
            message.attach(MIMEText(html_content, "html"))
            
            async with aiosmtplib.SMTP(hostname=self.smtp_host, port=self.smtp_port) as smtp:
                await smtp.login(self.smtp_user, self.smtp_password)
                await smtp.sendmail(self.from_email, to_email, message.as_string())
            
            return True
        except Exception as e:
            print(f"Failed to send email: {str(e)}")
            return False
    
    async def send_submission_confirmation(self, email: str, submission_id: str) -> bool:
        """Send submission confirmation email."""
        subject = "KYC Submission Received"
        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Your KYC Application Has Been Received</h2>
                <p>We've successfully received your identity verification documents.</p>
                <p><strong>Submission ID:</strong> {submission_id}</p>
                <p>We'll review your documents and get back to you within 1-3 business days.</p>
                <p>If you have any questions, please contact our support team.</p>
                <p>Best regards,<br/>Verity AI Team</p>
            </body>
        </html>
        """
        return await self.send_email(email, subject, html)
    
    async def send_submission_approved(self, email: str, submission_id: str) -> bool:
        """Send submission approved email."""
        subject = "KYC Verification Approved"
        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Great News! Your Verification is Approved</h2>
                <p>Your identity verification has been successfully approved.</p>
                <p><strong>Submission ID:</strong> {submission_id}</p>
                <p>You can now proceed with your account.</p>
                <p>Best regards,<br/>Verity AI Team</p>
            </body>
        </html>
        """
        return await self.send_email(email, subject, html)
    
    async def send_submission_rejected(self, email: str, submission_id: str, reason: str) -> bool:
        """Send submission rejected email."""
        subject = "KYC Verification Status"
        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>KYC Verification - Action Required</h2>
                <p>Unfortunately, your identity verification didn't pass our checks.</p>
                <p><strong>Submission ID:</strong> {submission_id}</p>
                <p><strong>Reason:</strong> {reason}</p>
                <p>Please resubmit with corrected documents or contact support for assistance.</p>
                <p>Best regards,<br/>Verity AI Team</p>
            </body>
        </html>
        """
        return await self.send_email(email, subject, html)


email_service = EmailService()
