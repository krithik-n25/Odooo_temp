import os
import resend
from app.core.config import settings

resend.api_key = settings.RESEND_API_KEY

def send_email(to_email: str, subject: str, html_content: str):
    if not settings.RESEND_API_KEY or settings.RESEND_API_KEY.startswith("re_xxxx"):
        print(f"MOCK EMAIL: To: {to_email} | Subject: {subject}")
        return
        
    try:
        r = resend.Emails.send({
            "from": settings.FROM_EMAIL,
            "to": to_email,
            "subject": subject,
            "html": html_content
        })
        return r
    except Exception as e:
        print("Email sending failed:", e)
