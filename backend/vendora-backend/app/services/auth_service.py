from app.core.database import supabase
from app.models.user import UserSignup
from fastapi import HTTPException, status
from supabase import create_client
from app.core.config import settings

def login_user(email: str, password: str):
    try:
        # Create a temporary client to avoid mutating the global client's auth headers/session
        temp_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        res = temp_client.auth.sign_in_with_password({"email": email, "password": password})
        if not res.session:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Fetch profile using the global client (which uses the service role key and bypasses RLS)
        profile = supabase.table("profiles").select("*").eq("id", res.user.id).single().execute()
        return {
            "token": res.session.access_token,
            "user": profile.data
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

def signup_user(data: UserSignup):
    try:
        # Create a temporary client for sign-up to prevent mutating global client state
        temp_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        res = temp_client.auth.sign_up({
            "email": str(data.email),
            "password": data.password,
            "options": {
                "data": {
                    "name": data.name,
                    "role": data.role
                }
            }
        })
        if not res.user:
            raise HTTPException(status_code=400, detail="Signup failed")
            
        # The database trigger will create the profile, but we might want to wait a split second 
        # or fetch it to return. We fetch it using the global client.
        profile = supabase.table("profiles").select("*").eq("id", res.user.id).single().execute()
        
        # If they provided a company name, update the profile
        if data.company_name:
            profile = supabase.table("profiles").update({"company_name": data.company_name}).eq("id", res.user.id).single().execute()
            
        return {"user": profile.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

