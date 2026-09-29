# i-graphy 요구사항

## 1. 프로젝트 개요

**i-graphy**는 개인의 경험, 생각, 지식, 기록 등을 게시글 형태로 축적하고
관리하기 위한 웹 애플리케이션이다.

단순한 게시판 구현에 그치지 않고, 요구사항 정의 → 설계 → 구현 → 테스트 →
배포의 전체 개발 과정을 단계적으로 진행한다.

## 2. 개발 원칙

### 2.1 MVP 우선

초기 버전은 핵심 기능을 우선 구현한다. 불필요한 기능이나 복잡한 구조는
처음부터 추가하지 않는다.

### 2.2 단순한 구현

가능한 한 단순한 코드와 구조를 사용한다. 각 기술을 사용하는 이유를
이해할 수 있는 수준으로 구성한다.

### 2.3 학습 가능한 구현

코드는 기능뿐 아니라 구조와 동작을 이해할 수 있도록 작성한다. 필요한
부분에는 충분한 주석과 설명을 작성한다.

### 2.4 결정과 구현의 분리

프로젝트의 기술적·기능적 결정은 사용자가 한다. 구현은 결정된 요구사항과
설계를 기준으로 진행한다. 새로운 결정이 필요한 경우 선택지를 먼저
검토하고 결정한 후 구현한다.

### 2.5 문서와 구현의 동기화

요구사항, 설계 및 주요 결정사항을 지속적으로 문서화한다. 요구사항이나
설계가 변경되면 관련 문서도 함께 업데이트한다.

## 3. 사용자 및 게시글

### 3.1 사용자

초기 버전에서는 사용자 계정 및 인증 기능을 구현하지 않는다. 향후
필요성이 확인되면 로그인, 계정 생성 등의 기능을 확장할 수 있다.

### 3.2 게시글

사용자는 게시글을 작성하고 관리할 수 있어야 한다.

게시글은 최소한 다음 정보를 가진다.

-   게시글 ID
-   제목
-   내용
-   작성일시
-   수정일시

초기 버전에서는 게시글에 별도의 카테고리를 사용하지 않는다. 미리 정의된
카테고리 목록도 두지 않는다.

## 4. 필수 기능

### 4.1 게시글 목록

게시글 목록을 확인할 수 있어야 한다.

-   게시글 목록 표시
-   게시글의 기본 정보 표시
-   개별 게시글 조회 화면으로 이동

### 4.2 게시글 작성

사용자는 새로운 게시글을 작성할 수 있어야 한다.

-   제목 입력
-   내용 입력
-   게시글 저장

### 4.3 게시글 조회

사용자는 특정 게시글의 내용을 확인할 수 있어야 한다.

게시글 조회 화면의 파일명은 `search-post.html`로 한다.

### 4.4 게시글 수정

사용자는 기존 게시글을 수정할 수 있어야 한다.

-   기존 제목 표시
-   기존 내용 표시
-   내용 수정
-   수정 내용 저장

### 4.5 게시글 삭제

사용자는 기존 게시글을 삭제할 수 있어야 한다.

## 5. 페이지 구성

### `index.html`

향후 로그인 및 계정 생성 등을 포함한 랜딩 페이지로 확장할 수 있도록
유지한다.

초기 구현에서는 실제 랜딩 페이지 기능을 구현하지 않고, 필요한 경우
게시판 화면으로 이동하도록 최소한으로 구성한다.

### `board.html`

게시글 목록을 표시한다.

### `new-post.html`

새 게시글을 작성한다.

### `search-post.html`

특정 게시글을 조회한다.

### `edit-post.html`

기존 게시글을 수정한다.

## 6. 기술 스택

  영역               기술
  ------------------ -----------------------
  Frontend           HTML, CSS, JavaScript
  Backend            Python, FastAPI
  API                REST API
  ORM / DB 접근      SQLAlchemy
  Database           PostgreSQL
  Database Hosting   Supabase
  Deployment         Render
  Version Control    Git
  Repository         GitHub
  IDE                Visual Studio Code

## 7. 애플리케이션 구조

Frontend와 Backend를 분리하여 관리한다.

예정된 기본 구조:

``` text
i-graphy/
├── frontend/
│   ├── index.html
│   ├── board.html
│   ├── new-post.html
│   ├── search-post.html
│   ├── edit-post.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── board.js
│       ├── new-post.js
│       ├── search-post.js
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
└── README.md
```

구체적인 파일 및 디렉터리는 구현 과정에서 필요한 경우 변경할 수 있으며,
변경 시 관련 문서를 업데이트한다.

## 8. Backend 요구사항

### 8.1 FastAPI

Python 기반의 FastAPI를 Backend 웹 프레임워크로 사용한다.

FastAPI를 이용하여 REST API를 구현한다.

### 8.2 API 통신

Frontend와 Backend는 HTTP 기반 REST API를 통해 통신한다.

Frontend의 JavaScript에서는 `fetch()`를 사용하여 API를 호출한다.

기본 통신 구조:

``` text
Browser
    ↓ fetch()
FastAPI REST API
    ↓
SQLAlchemy
    ↓
PostgreSQL
```

### 8.3 SQLAlchemy

PostgreSQL 데이터베이스에 접근하기 위한 ORM/DB 접근 기술로 SQLAlchemy를
사용한다.

## 9. REST API 요구사항

게시글 관리를 위한 기본 API:

  HTTP Method   Endpoint            기능
  ------------- ------------------- ------------------
  GET           `/api/posts`        게시글 목록 조회
  GET           `/api/posts/{id}`   특정 게시글 조회
  POST          `/api/posts`        게시글 작성
  PUT           `/api/posts/{id}`   게시글 수정
  DELETE        `/api/posts/{id}`   게시글 삭제

API의 구체적인 요청 데이터와 응답 데이터 형식은 API 설계 단계에서 별도로
결정하고 문서화한다.

## 10. Database 요구사항

PostgreSQL을 데이터베이스로 사용한다.

초기 게시글 테이블은 최소한 다음 구조를 가진다.

``` text
posts
├── id
├── title
├── content
├── created_at
└── updated_at
```

구체적인 데이터 타입, 기본값, 제약조건 및 인덱스 등의 세부사항은
Database 설계 단계에서 결정한다.

## 11. Hosting 및 배포

### 11.1 Frontend / Backend

Render를 사용하여 웹 애플리케이션을 배포한다.

Frontend와 FastAPI Backend를 하나의 배포 환경에서 운영하는 방향으로
구성하여 초기 프로젝트에서 불필요한 CORS 복잡성을 줄인다.

### 11.2 Database

PostgreSQL 데이터베이스는 Supabase에서 운영한다.

### 11.3 Repository

소스 코드는 Git으로 버전 관리하며 GitHub 저장소에서 관리한다.

GitHub 저장소: `anhyeokkyun/i-graphy`

## 12. 보안 및 환경 설정

데이터베이스 접속 정보 등 민감한 설정값을 소스 코드에 직접 작성하지
않는다.

배포 환경에서 필요한 비밀값과 환경 설정은 환경 변수 등을 사용하는
방향으로 구성한다.

구체적인 환경 변수 목록과 설정 방법은 구현 단계에서 별도로 문서화한다.

## 13. 문서화 요구사항

프로젝트의 개발 과정에서 결정된 사항과 변경사항을 지속적으로 문서화한다.

### `README.md`

프로젝트의 전체적인 소개, 실행 방법, 기술 스택 및 현재 개발 상태 등을
기록한다.

### `requirements.md`

프로젝트가 **무엇을 만들어야 하는지**를 기록한다. 기능 요구사항과
프로젝트의 기본 원칙을 관리한다.

### `architecture.md`

프로젝트를 **어떤 구조로 구현할 것인지**를 기록한다. Frontend, Backend,
API, Database 등의 구조와 구성요소 간 관계를 관리한다.

### `database.md`

데이터베이스의 구조와 설계를 기록한다.

### `api.md`

REST API의 Endpoint, 요청 형식, 응답 형식 등을 기록한다.

## 14. 요구사항 변경 관리

개발 과정에서 요구사항이나 설계가 변경될 수 있다.

변경이 필요한 경우 다음 순서로 진행한다.

``` text
문제 또는 새로운 요구 발생
        ↓
선택지 및 영향 검토
        ↓
사용자 결정
        ↓
관련 문서 업데이트
        ↓
구현 또는 수정
        ↓
테스트
```

현재 결정되지 않은 사항은 임의로 확정하지 않는다.

새로운 기술적 또는 기능적 결정이 필요한 경우 먼저 선택지를 제시하고
결정한 후 프로젝트에 반영한다.

## 15. 초기 개발 범위

초기 MVP의 핵심 범위:

1.  프로젝트 기본 구조 구성
2.  PostgreSQL 연결
3.  SQLAlchemy 설정
4.  FastAPI 기본 서버 구성
5.  게시글 REST API 구현
6.  게시글 목록 화면 구현
7.  게시글 작성 화면 구현
8.  게시글 조회 화면 구현
9.  게시글 수정 화면 구현
10. 게시글 삭제 기능 구현
11. Frontend와 Backend 연동
12. 기본 테스트
13. GitHub를 통한 버전 관리
14. Render 배포
15. Supabase PostgreSQL 연결

로그인, 계정 생성, 카테고리 등의 기능은 초기 MVP 범위에 포함하지 않는다.
