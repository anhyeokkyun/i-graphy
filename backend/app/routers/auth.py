from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Account
from ..security import hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["authentication"])


class Credentials(BaseModel):
    username: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=1, max_length=256)


def current_user(request: Request) -> dict:
    user_id = request.session.get("user_id")
    username = request.session.get("username")
    if user_id is None or username is None:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    return {"id": user_id, "username": username}


@router.get("/me")
def me(user: dict = Depends(current_user)):
    return user


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: Credentials, request: Request, db: Session = Depends(get_db)):
    if payload.username != payload.username.strip():
        raise HTTPException(status_code=422, detail="계정명 앞뒤에 공백을 넣을 수 없습니다.")
    if not payload.username.strip():
        raise HTTPException(status_code=422, detail="계정명을 입력하세요.")

    account = Account(username=payload.username, password_hash=hash_password(payload.password))
    db.add(account)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="이미 사용 중인 계정명입니다.") from None

    db.refresh(account)
    request.session.clear()
    request.session["user_id"] = account.id
    request.session["username"] = account.username
    return {"id": account.id, "username": account.username}


@router.post("/login")
def login(payload: Credentials, request: Request, db: Session = Depends(get_db)):
    account = db.scalar(select(Account).where(Account.username == payload.username))
    if account is None or not verify_password(payload.password, account.password_hash):
        raise HTTPException(status_code=401, detail="계정명 또는 암호가 올바르지 않습니다.")
    request.session.clear()
    request.session["user_id"] = account.id
    request.session["username"] = account.username
    return {"id": account.id, "username": account.username}


@router.post("/logout")
def logout(request: Request):
    request.session.clear()
    return {"message": "로그아웃했습니다."}
