# i-graphy 아키텍처

## 1. 개요

i-graphy는 개인의 경험, 생각, 지식, 기록 등을 게시글 형태로 축적하고 관리하는 웹 애플리케이션이다.

초기 버전은 FastAPI 하나의 애플리케이션에서 Frontend와 REST API를 함께 제공한다.

```text
Browser
   │
   ├── HTML / CSS / JavaScript
   │
   └── REST API
          │
          ▼
       FastAPI
          │
          ▼
      SQLAlchemy
          │
          ▼
       psycopg
          │
          ▼
      PostgreSQL
```

Database는 Supabase에서 운영하고, 애플리케이션은 Render에 배포한다.

---

## 2. 아키텍처 원칙

### 2.1 MVP 우선

초기에는 게시글 CRUD, 검색, 페이지네이션 등 핵심 기능 구현에 집중한다.

### 2.2 단순한 구조

실제 복잡성이 발생하기 전에는 불필요한 계층을 만들지 않는다.

따라서 초기 버전에서는 다음과 같은 별도 계층을 만들지 않는다.

```text
services/
repositories/
controllers/
crud/
utils/
```

실제 필요성이 확인되면 이후 구조를 확장할 수 있다.

### 2.3 Frontend와 Backend의 역할 분리

Frontend는 화면 표시와 사용자 입력 및 API 호출을 담당한다.

Backend는 API, 데이터 검증, 데이터베이스 접근을 담당한다.

```text
Frontend
├── 화면 표시
├── 사용자 입력
├── URL 상태 관리
└── fetch()를 통한 API 호출

Backend
├── REST API
├── 요청 검증
├── SQLAlchemy ORM
└── PostgreSQL 접근
```

### 2.4 문서와 구현의 동기화

구조나 주요 기술 선택이 변경되면 관련 문서도 함께 변경한다.

---

## 3. 프로젝트 구조

최종적인 초기 구조는 다음과 같다.

```text
i-graphy/
├── alembic/
│   ├── versions/
│   └── env.py
│
├── alembic.ini
├── .env
├── .gitignore
│
├── frontend/
│   ├── index.html
│   ├── board.html
│   ├── post.html
│   ├── new-post.html
│   ├── edit-post.html
│   │
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       ├── board.js
│       ├── post.js
│       ├── new-post.js
│       └── edit-post.js
│
├── backend/
│   └── app/
│       ├── main.py
│       ├── database.py
│       ├── models.py
│       ├── schemas.py
│       │
│       └── routers/
│           └── posts.py
│
├── README.md
├── requirements.md
├── architecture.md
├── database.md
└── api.md
```

`.env`는 실제 환경 설정 파일이며 Git에 커밋하지 않는다.

---

## 4. Frontend

Frontend는 별도의 프론트엔드 서버 없이 FastAPI에서 직접 제공한다.

### 4.1 HTML

HTML 페이지:

```text
/
    → frontend/index.html

/board
    → frontend/board.html

/post
    → frontend/post.html

/new-post
    → frontend/new-post.html

/edit-post
    → frontend/edit-post.html
```

FastAPI의 `FileResponse`를 사용하여 HTML 파일을 반환한다.

### 4.2 Static Files

CSS와 JavaScript는 FastAPI의 `StaticFiles`를 통해 제공한다.

```text
/css/*
    → frontend/css/*

/js/*
    → frontend/js/*
```

### 4.3 JavaScript

각 페이지의 JavaScript는 해당 페이지의 동작을 담당한다.

```text
board.js
├── 게시글 목록 조회
├── 검색
├── 페이지네이션
└── 게시글 행 클릭

post.js
├── 게시글 조회
├── 수정 페이지 이동
└── 삭제

new-post.js
└── 게시글 생성

edit-post.js
└── 게시글 수정
```

---

## 5. Frontend 페이지 흐름

### 5.1 초기 진입

초기 MVP에서는 `/`에 접속하면 게시판 첫 페이지로 이동한다.

```text
/
 ↓
/board?page=1
```

`index.html`은 향후 로그인 및 계정 생성 등을 포함하는 landing page로 확장할 수 있도록 유지한다.

### 5.2 게시판

일반 게시글 목록:

```text
/board?page=1
```

페이지 이동:

```text
/board?page=2
/board?page=3
...
```

검색:

```text
/board?search=운동&page=1
```

검색 결과의 페이지 이동:

```text
/board?search=운동&page=2
```

게시판과 검색 결과를 별도의 HTML 페이지로 분리하지 않는다.

### 5.3 게시글 상세

게시글 목록의 행 전체를 클릭하면:

```text
/board?page=1
    ↓
행 클릭
    ↓
/post?id=123
```

`post.js`가 게시글 ID를 읽고 다음 API를 호출한다.

```text
GET /api/posts/123
```

### 5.4 게시글 작성

```text
/new-post
    ↓
POST /api/posts
    ↓
/board?page=1
```

### 5.5 게시글 수정

```text
/post?id=123
    ↓
수정
    ↓
/edit-post?id=123
    ↓
PUT /api/posts/123
    ↓
/post?id=123
```

### 5.6 게시글 삭제

```text
/post?id=123
    ↓
삭제
    ↓
confirm()
    ↓
DELETE /api/posts/123
    ↓
기존 board 검색/페이지 상태 유지
```

삭제 후 현재 페이지가 더 이상 존재하지 않는 경우 마지막 유효 페이지로 이동한다.

---

## 6. 페이지네이션 구조

번호 방식 페이지네이션을 사용한다.

페이지당 게시글 수는 20개로 고정한다.

클라이언트는 `size`를 지정하지 않는다.

```text
GET /api/posts?page=1
GET /api/posts?page=2
```

### 6.1 OFFSET / LIMIT

페이지 번호를 기반으로 다음과 같이 계산한다.

```text
page=1
OFFSET 0
LIMIT 20

page=2
OFFSET 20
LIMIT 20

page=3
OFFSET 40
LIMIT 20
```

### 6.2 전체 개수 조회

페이지 범위와 페이지 수를 계산하기 위해 게시글 조회 전에 `COUNT(*)`를 수행한다.

```text
COUNT(*)
    ↓
total_count
    ↓
total_pages 계산
    ↓
page 유효성 검사
    ↓
LIMIT / OFFSET 게시글 조회
```

검색이 적용된 경우 `COUNT(*)`와 실제 게시글 조회 모두 동일한 검색 조건을 적용한다.

### 6.3 페이지 검증

```text
page 미지정
    → 1

page < 1
    → 422

page가 정수가 아님
    → 422

page > total_pages
    → 422
```

게시글이 하나도 없으면:

```text
total_count = 0
total_pages = 0
```

### 6.4 페이지 번호 UI

페이지 번호는 10개 단위로 묶는다.

```text
[이전] 1 2 3 4 5 6 7 8 9 10 [다음]
```

다음 묶음:

```text
[이전] 11 12 13 14 15 16 17 18 19 20 [다음]
```

이전/다음은 페이지 하나가 아니라 페이지 묶음을 이동한다.

현재 페이지는 CSS class를 이용하여 시각적으로 구분한다.

현재 페이지도 클릭할 수 있도록 한다.

---

## 7. Backend

Backend는 FastAPI를 중심으로 구성한다.

### 7.1 `main.py`

담당:

* FastAPI 애플리케이션 생성
* Frontend HTML route 등록
* StaticFiles 설정
* API router 등록

### 7.2 `database.py`

담당:

* `DATABASE_URL` 읽기
* SQLAlchemy Engine 생성
* SQLAlchemy Session 생성
* `get_db()` dependency 제공

기본 흐름:

```text
Request
    ↓
Depends(get_db)
    ↓
Session 생성
    ↓
API에서 사용
    ↓
요청 종료
    ↓
Session 정리
```

### 7.3 `models.py`

SQLAlchemy ORM 모델을 정의한다.

초기에는 `Post` 모델을 정의한다.

```text
Post
├── id
├── title
├── content
├── created_at
└── updated_at
```

### 7.4 `schemas.py`

Pydantic Schema를 정의한다.

```text
PostWrite
├── title
└── content

PostListItem
├── id
├── title
├── created_at
└── updated_at

PostResponse
├── id
├── title
├── content
├── created_at
└── updated_at
```

`PostWrite`는 게시글 생성과 수정에 함께 사용한다.

응답 Schema는 SQLAlchemy ORM 객체의 attributes를 읽을 수 있도록 `from_attributes=True`를 사용한다.

### 7.5 `routers/posts.py`

게시글 REST API를 담당한다.

```text
GET    /api/posts
GET    /api/posts/{id}
POST   /api/posts
PUT    /api/posts/{id}
DELETE /api/posts/{id}
```

DB transaction은 각 API 함수에서 직접 관리한다.

```text
성공
    → db.commit()

오류
    → db.rollback()
```

별도의 service/repository/crud 계층은 사용하지 않는다.

---

## 8. API 데이터 흐름

### 게시글 목록

```text
board.js
    ↓ fetch()
GET /api/posts?page=1
    ↓
FastAPI
    ↓
COUNT(*)
    ↓
page 검증
    ↓
SQLAlchemy SELECT
    ↓
PostgreSQL
    ↓
PostListItem
    ↓
JSON
    ↓
board.js
```

### 검색

```text
board.js
    ↓
GET /api/posts?search=운동&page=1
    ↓
FastAPI
    ↓
검색 조건 적용
    ↓
COUNT(*)
    ↓
page 검증
    ↓
LIMIT / OFFSET
    ↓
PostgreSQL
```

### 게시글 상세

```text
post.js
    ↓
GET /api/posts/123
    ↓
FastAPI
    ↓
SQLAlchemy
    ↓
PostgreSQL
    ↓
PostResponse
    ↓
JSON
```

### 게시글 생성

```text
new-post.js
    ↓
POST /api/posts
    ↓
PostWrite
    ↓
SQLAlchemy Post
    ↓
db.commit()
    ↓
PostResponse
    ↓
/board?page=1
```

### 게시글 수정

```text
edit-post.js
    ↓
PUT /api/posts/123
    ↓
PostWrite
    ↓
SQLAlchemy Post 변경
    ↓
db.commit()
    ↓
PostResponse
    ↓
/post?id=123
```

### 게시글 삭제

```text
post.js
    ↓
confirm()
    ↓
DELETE /api/posts/123
    ↓
db.commit()
    ↓
204 No Content
    ↓
기존 board 상태로 이동
```

---

## 9. Database

PostgreSQL을 사용한다.

Database hosting은 Supabase를 사용한다.

SQLAlchemy는 ORM 및 DB 접근을 담당하고, PostgreSQL이 실제 데이터와 시간을 관리한다.

### 시간 관리

`created_at`과 `updated_at`은 PostgreSQL이 관리한다.

```text
INSERT
    ↓
DEFAULT CURRENT_TIMESTAMP

UPDATE
    ↓
PostgreSQL trigger
    ↓
updated_at = CURRENT_TIMESTAMP
```

SQLAlchemy나 FastAPI가 게시글 작성/수정 시간을 직접 생성하지 않는다.

### Migration

Alembic을 사용하여 Database Schema 변경 이력을 관리한다.

```text
SQLAlchemy models
        ↓
Alembic migration
        ↓
PostgreSQL schema
```

---

## 10. 검색 구조

검색은 PostgreSQL Full-Text Search를 사용하지 않는다.

단순한 부분 문자열 검색을 사용한다.

각 검색어는 제목 또는 내용에 포함되어야 한다.

예:

```text
search = "이것 테스트"
```

개념적인 조건:

```text
(title ILIKE '%이것%' OR content ILIKE '%이것%')
AND
(title ILIKE '%테스트%' OR content ILIKE '%테스트%')
```

검색어가 없거나 공백만 있으면 일반 게시글 목록과 동일하게 처리한다.

초기에는 `pg_trgm`, GIN/GiST 등의 검색 최적화 기능을 추가하지 않는다.

실제 데이터 규모와 검색 성능 문제가 확인될 경우 별도로 검토한다.

---

## 11. 환경 설정

Database 접속 정보는 `DATABASE_URL` 환경 변수로 관리한다.

로컬 개발:

```text
.env
 ↓
python-dotenv
 ↓
환경 변수
 ↓
os.getenv()
 ↓
database.py
```

운영 환경:

```text
Render Environment Variables
 ↓
DATABASE_URL
 ↓
database.py
```

`.env`는 Git에 커밋하지 않는다.

---

## 12. 사용 기술과 역할

| 기술            | 역할                 |
| ------------- | ------------------ |
| HTML          | 페이지 구조             |
| CSS           | 화면 스타일             |
| JavaScript    | 사용자 동작 및 API 통신    |
| FastAPI       | Backend 및 REST API |
| FileResponse  | HTML 제공            |
| StaticFiles   | CSS/JS 제공          |
| SQLAlchemy    | ORM 및 DB 접근        |
| psycopg       | PostgreSQL Driver  |
| Pydantic      | 요청/응답 Schema 및 검증  |
| python-dotenv | 로컬 `.env` 로딩       |
| Alembic       | Database Migration |
| PostgreSQL    | 데이터 저장 및 시간 관리     |
| Supabase      | PostgreSQL Hosting |
| Render        | 애플리케이션 Hosting     |
| Git           | 버전 관리              |
| GitHub        | Repository         |

---

## 13. 확장 방향

초기 MVP에서는 다음 기능을 구현하지 않는다.

* 사용자 계정
* 로그인
* 계정 생성
* 게시글 카테고리
* 별도의 검색 결과 페이지
* 복잡한 service/repository 계층
* PostgreSQL Full-Text Search
* 검색용 별도 인덱스 최적화

이후 실제 사용 과정에서 필요성이 확인되면 요구사항과 아키텍처를 다시 검토한 뒤 추가한다.
