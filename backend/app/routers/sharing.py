from datetime import datetime, timezone
import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Account, Post
from .auth import current_user

router = APIRouter(tags=["sharing"])


class ShareRequest(BaseModel):
    expires_at: datetime


def validate_expiry(value: datetime) -> datetime:
    if value.tzinfo is None or value.utcoffset() is None:
        raise HTTPException(status_code=422, detail="만료 시각에 시간대 정보가 필요합니다.")
    value = value.astimezone(timezone.utc)
    if value <= datetime.now(timezone.utc):
        raise HTTPException(status_code=422, detail="만료 시각은 현재보다 미래여야 합니다.")
    return value


def is_active(token: str | None, expires_at: datetime | None) -> bool:
    if not token or not expires_at:
        return False
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return expires_at > datetime.now(timezone.utc)


def get_owned_post(db: Session, post_id: int, owner_id: int) -> Post:
    post = db.scalar(select(Post).where(Post.id == post_id, Post.owner_id == owner_id))
    if post is None:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    return post


@router.get("/api/sharing/board")
def board_share_status(db: Session = Depends(get_db), user: dict = Depends(current_user)):
    account = db.get(Account, user["id"])
    active = is_active(account.board_share_token, account.board_share_expires_at)
    return {
        "active": active,
        "expires_at": account.board_share_expires_at if active else None,
        "url": f"/shared/board/{account.board_share_token}" if active else None,
    }


@router.post("/api/sharing/board")
def enable_board_sharing(payload: ShareRequest, db: Session = Depends(get_db), user: dict = Depends(current_user)):
    expires_at = validate_expiry(payload.expires_at)
    account = db.get(Account, user["id"])
    account.board_share_token = secrets.token_urlsafe(32)
    account.board_share_expires_at = expires_at
    db.commit()
    return {"active": True, "expires_at": expires_at, "url": f"/shared/board/{account.board_share_token}"}


@router.delete("/api/sharing/board", status_code=status.HTTP_204_NO_CONTENT)
def disable_board_sharing(db: Session = Depends(get_db), user: dict = Depends(current_user)):
    account = db.get(Account, user["id"])
    account.board_share_token = None
    account.board_share_expires_at = None
    db.commit()


@router.get("/api/sharing/posts/{post_id}")
def post_share_status(post_id: int, db: Session = Depends(get_db), user: dict = Depends(current_user)):
    post = get_owned_post(db, post_id, user["id"])
    active = is_active(post.share_token, post.share_expires_at)
    return {
        "active": active,
        "expires_at": post.share_expires_at if active else None,
        "url": f"/shared/post/{post.share_token}" if active else None,
    }


@router.post("/api/sharing/posts/{post_id}")
def enable_post_sharing(post_id: int, payload: ShareRequest, db: Session = Depends(get_db), user: dict = Depends(current_user)):
    expires_at = validate_expiry(payload.expires_at)
    post = get_owned_post(db, post_id, user["id"])
    post.share_token = secrets.token_urlsafe(32)
    post.share_expires_at = expires_at
    db.commit()
    return {"active": True, "expires_at": expires_at, "url": f"/shared/post/{post.share_token}"}


@router.delete("/api/sharing/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def disable_post_sharing(post_id: int, db: Session = Depends(get_db), user: dict = Depends(current_user)):
    post = get_owned_post(db, post_id, user["id"])
    post.share_token = None
    post.share_expires_at = None
    db.commit()


@router.get("/api/public/board/{token}")
def public_board(token: str, db: Session = Depends(get_db)):
    account = db.scalar(select(Account).where(Account.board_share_token == token))
    if account is None or not is_active(account.board_share_token, account.board_share_expires_at):
        raise HTTPException(status_code=404, detail="공유 링크가 만료되었거나 취소되었습니다.")
    posts = db.scalars(
        select(Post).where(Post.owner_id == account.id).order_by(Post.created_at.desc())
    ).all()
    return {
        "username": account.username,
        "expires_at": account.board_share_expires_at,
        "posts": [
            {
                "id": post.id,
                "title": post.title,
                "content": post.content,
                "created_at": post.created_at,
                "updated_at": post.updated_at,
            }
            for post in posts
        ],
    }


@router.get("/api/public/posts/{token}")
def public_post(token: str, db: Session = Depends(get_db)):
    post = db.scalar(select(Post).where(Post.share_token == token))
    if post is None or not is_active(post.share_token, post.share_expires_at):
        raise HTTPException(status_code=404, detail="공유 링크가 만료되었거나 취소되었습니다.")
    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "created_at": post.created_at,
        "updated_at": post.updated_at,
        "expires_at": post.share_expires_at,
    }
