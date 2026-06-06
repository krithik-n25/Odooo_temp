from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import UserLogin, UserSignup, UserOut
from app.services import auth_service
from app.core.dependencies import get_current_user

router = APIRouter()

@router.post("/login")
def login(data: UserLogin):
    return auth_service.login_user(data.email, data.password)

@router.post("/signup")
def signup(data: UserSignup):
    return auth_service.signup_user(data)

@router.post("/logout")
def logout(user: UserOut = Depends(get_current_user)):
    return {"message": "logged out"}

@router.get("/me", response_model=UserOut)
def get_me(user: UserOut = Depends(get_current_user)):
    return user
