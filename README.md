# i-graphy

개인적인 경험, 생각, 지식, 기록을 게시글 형태로 축적하고 관리하는 웹 애플리케이션.

## MVP

- 게시글 목록 조회
- 게시글 검색
- 게시글 작성
- 게시글 조회
- 게시글 수정
- 게시글 삭제
- PostgreSQL 저장

## Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Python, FastAPI
- API: REST API
- DB access: SQLAlchemy
- Database: PostgreSQL
- Driver: psycopg
- Migration: Alembic
- Environment: python-dotenv
- DB hosting: Supabase
- Hosting: Render
- Version control: Git / GitHub

## Run

1. Python 가상환경을 만든다.
2. `pip install -r requirements.txt`
3. `.env.example`을 참고하여 `.env`에 `DATABASE_URL`을 설정한다.
4. `alembic upgrade head`
5. `uvicorn backend.app.main:app --reload`
6. 브라우저에서 `http://127.0.0.1:8000/`을 연다.

`DATABASE_URL`은 PostgreSQL 접속 URL이어야 한다.
