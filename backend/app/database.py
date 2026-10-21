import os
from collections.abc import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

# 로컬 개발에서는 .env를 읽고, Render/Supabase 같은 배포 환경에서는
# 플랫폼이 주입한 환경 변수를 그대로 사용한다.
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL 환경 변수가 설정되지 않았습니다.")


class Base(DeclarativeBase):
    """SQLAlchemy ORM 모델의 공통 Base 클래스."""


engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Generator[Session, None, None]:
    """요청 하나에서 사용할 DB Session을 만들고 요청 종료 후 닫는다."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
