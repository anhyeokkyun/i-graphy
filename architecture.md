# Architecture

## 1. Overview

`i-graphy`는 FastAPI 하나를 통해 Frontend와 REST API를 함께 제공하는 구조로 구성한다.

```text
Browser
   │
   ├── HTML / CSS / JavaScript
   │
   └── fetch()
          │
          ↓
       FastAPI
       ├── Frontend
       └── REST API
              │
              ↓
          SQLAlchemy
              │
              ↓
          PostgreSQL
```

Frontend와 Backend를 별도의 서버로 분리하지 않는다.

이를 통해 MVP 단계에서 불필요한 CORS 설정과 별도의 Frontend 서버를 피하고, 하나의 FastAPI 애플리케이션으로 전체 서비스를 실행한다.

---

## 2. Project Structure

```text
i-graphy/
├── frontend/
│   ├── index.html
│   ├── board.html
│   ├── new-post.html
│   ├── search-post.html
│   ├── post.html
│   ├── edit-post.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── board.js
│       ├── new-post.js
│       ├── search-post.js
│       ├── post.js
│       └── edit-post.js
│
├── backend/
│   └── app/
│       ├── main.py
│       ├── database.py
│       ├── models.py
│       ├── schemas.py
│       └── routers/
│           └── posts.py
│
├── README.md
├── requirements.md
├── architecture.md
├── database.md
└── api.md
```

---

## 3. Frontend

### `frontend/index.html`

향후 로그인 및 계정 생성 등을 제공할 Landing Page로 사용한다.

현재 MVP에서는 최소한의 페이지로 구성하며, 필요하면 게시판으로 이동할 수 있도록 한다.

---

### `frontend/board.html`

전체 게시글을 조회하는 게시판 페이지이다.

주요 기능:

* 게시글 목록 표시
* 검색어 입력
* 검색 실행
* 게시글 선택
* 새 게시글 작성 페이지 이동

게시글 목록과 검색은 `board.js`가 API를 호출하여 처리한다.

---

### `frontend/search-post.html`

검색 결과를 표시하는 페이지이다.

`search` query parameter를 이용하여 검색 조건을 전달한다.

예:

```text
/search-post?search=이것%20테스트
```

검색 결과는 REST API를 통해 조회한다.

```text
GET /api/posts?search=이것%20테스트
```

검색 결과에서 게시글을 선택하면 해당 게시글의 `post.html`로 이동한다.

---

### `frontend/post.html`

개별 게시글을 조회하는 페이지이다.

게시글 ID를 URL parameter로 전달한다.

예:

```text
/post?id=1
```

JavaScript는 다음 API를 호출한다.

```text
GET /api/posts/1
```

조회 페이지에서는 게시글의 다음 정보를 표시한다.

* 제목
* 내용
* 생성일
* 수정일

필요한 경우 수정 및 삭제 기능으로 이동할 수 있다.

---

### `frontend/new-post.html`

새 게시글을 작성하는 페이지이다.

주요 기능:

* 제목 입력
* 내용 입력
* 작성
* 취소

작성 시 다음 API를 호출한다.

```text
POST /api/posts
```

취소 시 게시글 작성 API를 호출하지 않는다.

---

### `frontend/edit-post.html`

기존 게시글을 수정하는 페이지이다.

게시글 ID를 URL parameter로 전달한다.

예:

```text
/edit-post?id=1
```

게시글을 조회한 후 기존 제목과 내용을 입력 화면에 표시한다.

수정 시 다음 API를 호출한다.

```text
PUT /api/posts/1
```

취소 시 PUT 요청을 보내지 않는다.

따라서 취소만으로 `updated_at`이 변경되지 않는다.

---

## 4. Frontend JavaScript

각 페이지의 동작을 담당하는 JavaScript 파일을 페이지별로 분리한다.

```text
board.js
→ 게시글 목록 조회 및 검색

search-post.js
→ 검색 결과 조회 및 표시

post.js
→ 개별 게시글 조회 및 표시

new-post.js
→ 게시글 작성

edit-post.js
→ 게시글 수정 및 삭제 관련 동작
```

API 통신에는 브라우저의 `fetch()`를 사용한다.

---

## 5. Backend

### `backend/app/main.py`

FastAPI 애플리케이션의 시작점이다.

담당:

* FastAPI 애플리케이션 생성
* REST API router 등록
* Frontend 정적 파일 및 페이지 제공 설정

게시글 CRUD 로직 자체는 `main.py`에 작성하지 않는다.

---

### `backend/app/database.py`

PostgreSQL 데이터베이스 연결을 담당한다.

담당:

* SQLAlchemy Engine 생성
* 데이터베이스 Session 설정
* API에서 사용할 DB Session 제공
* 데이터베이스 연결 설정

데이터베이스 접속 정보는 환경변수를 사용하며 소스 코드에 직접 작성하지 않는다.

---

### `backend/app/models.py`

SQLAlchemy ORM 모델을 정의한다.

현재 주요 모델은 `Post` 하나이다.

```text
Post
├── id
├── title
├── content
├── created_at
└── updated_at
```

이 모델은 `database.md`에서 정의한 `posts` 테이블을 Python 코드로 표현한다.

---

### `backend/app/schemas.py`

API 요청 및 응답 데이터 구조를 정의한다.

Pydantic을 사용하여 다음과 같은 데이터를 관리한다.

```text
게시글 생성/수정 요청
├── title
└── content
```

```text
게시글 목록 응답
├── id
├── title
├── created_at
└── updated_at
```

```text
게시글 상세 응답
├── id
├── title
├── content
├── created_at
└── updated_at
```

API 입력값의 기본적인 validation도 이곳에서 정의한다.

---

### `backend/app/routers/posts.py`

게시글 REST API를 담당한다.

```text
GET    /api/posts
GET    /api/posts/{id}
POST   /api/posts
PUT    /api/posts/{id}
DELETE /api/posts/{id}
```

검색 역시 `GET /api/posts`의 `search` query parameter를 통해 처리한다.

```text
GET /api/posts?search=...
```

MVP에서는 별도의 `services`, `repositories`, `crud` 등의 계층을 만들지 않는다.

---

## 6. Frontend and API Routing

FastAPI 하나가 Frontend와 REST API를 함께 제공한다.

### Frontend

```text
GET /
→ index.html

GET /board
→ board.html

GET /search-post
→ search-post.html

GET /post
→ post.html

GET /new-post
→ new-post.html

GET /edit-post
→ edit-post.html
```

### REST API

```text
GET    /api/posts
GET    /api/posts/{id}
POST   /api/posts
PUT    /api/posts/{id}
DELETE /api/posts/{id}
```

Frontend 페이지와 API의 경로를 `/api`를 기준으로 분리하여 구분한다.

```text
/board
/search-post
/post
...
```

는 Frontend 페이지이고,

```text
/api/posts
/api/posts/{id}
```

는 REST API이다.

---

## 7. Request Flow

### 게시글 목록

```text
Browser
   ↓
GET /board
   ↓
board.html
   ↓
board.js
   ↓ fetch()
GET /api/posts
   ↓
posts.py
   ↓
SQLAlchemy
   ↓
PostgreSQL
```

### 검색

```text
Browser
   ↓
검색어 입력
   ↓
/search-post?search=이것 테스트
   ↓
search-post.js
   ↓ fetch()
GET /api/posts?search=이것 테스트
   ↓
posts.py
   ↓
PostgreSQL
   ↓
검색 결과
```

### 개별 게시글 조회

```text
Browser
   ↓
/post?id=1
   ↓
post.html
   ↓
post.js
   ↓ fetch()
GET /api/posts/1
   ↓
posts.py
   ↓
PostgreSQL
```

---

## 8. Architecture Principles

### Simple Implementation

MVP 단계에서는 필요한 기능을 구현하는 데 필요한 최소한의 구조만 사용한다.

불필요한 계층이나 추상화를 미리 추가하지 않는다.

현재는 다음과 같은 별도 계층을 만들지 않는다.

```text
services/
repositories/
controllers/
crud/
utils/
```

실제 코드가 복잡해지고 분리가 필요한 상황이 발생하면 그때 구조를 변경한다.

### Minimal UI

Frontend는 필요한 기능을 명확하게 제공하는 것을 우선한다.

불필요한 UI 요소나 기능을 추가하지 않는다.

### Thorough Comments

코드는 초보자가 구조와 동작을 이해할 수 있도록 충분한 주석을 작성한다.

주석은 특히 다음 내용을 설명하는 데 사용한다.

* 파일의 역할
* 주요 객체와 함수의 역할
* 데이터 흐름
* 처음 접하면 이해하기 어려운 코드
* 특정 구현 방식을 선택한 이유

단순히 코드를 그대로 읽어주는 형태의 불필요한 주석은 작성하지 않는다.

### Separation of Decisions and Implementation

기능 및 기술적 결정은 구현 전에 확정한다.

새로운 요구사항이나 구조 변경이 발생하면:

```text
요구사항 발생
    ↓
선택 가능한 방법 검토
    ↓
사용자 결정
    ↓
문서 수정
    ↓
구현
    ↓
테스트
```

의 순서로 진행한다.
