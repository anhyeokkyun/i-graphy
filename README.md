# i-graphy

개인적인 경험, 생각, 지식을 게시글 형태로 축적하고 관리하는 웹 애플리케이션.

## MVP

- 계정 생성 및 로그인/로그아웃
- 세션 기반 인증으로 게시판과 게시글 API 보호
- 게시글 목록 조회 및 검색
- 게시글 작성·조회·수정·삭제
- PostgreSQL 저장

## Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Python, FastAPI
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
3. `.env.example`을 참고해 `.env`에 `DATABASE_URL`과 `SESSION_SECRET`을 설정한다.
4. `alembic upgrade head`
5. `uvicorn backend.app.main:app --reload`
6. 브라우저에서 `http://127.0.0.1:8000/`을 열고 계정을 생성한다.

배포 환경에서는 예측하기 어려운 긴 `SESSION_SECRET`을 설정하고 HTTPS를 사용한다. HTTPS 배포 시 `COOKIE_SECURE=true`로 설정한다. 암호는 PBKDF2-HMAC-SHA256 해시로 저장하며 평문으로 저장하지 않는다.
