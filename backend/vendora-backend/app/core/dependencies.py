from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.core.config import settings
from app.core.database import supabase
from app.models.user import UserOut

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserOut:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise credentials_exception
        user_id = user_response.user.id
    except Exception as e:
        print(f"Auth error: {e}")
        raise credentials_exception

    # Fetch user profile from Supabase
    response = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    if not response.data:
        raise credentials_exception
        
    return UserOut(**response.data)

def require_role(*roles: str):
    def checker(user: UserOut = Depends(get_current_user)):
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient role")
        return user
    return checker
