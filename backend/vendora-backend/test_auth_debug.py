import os
from dotenv import load_dotenv
load_dotenv()
from app.core.database import supabase

def test_login_and_validate():
    # Attempt login
    try:
        res = supabase.auth.sign_in_with_password({"email": "officer@vendora.com", "password": "password123"})
        token = res.session.access_token
        print("Login successful. Token:", token[:20], "...")
        
        # Now validate
        user_res = supabase.auth.get_user(token)
        print("Validation successful. User:", user_res.user.id)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test_login_and_validate()
