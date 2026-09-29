# API Design

## 1. API Overview

Frontend는 JavaScript의 `fetch()`를 사용하여 FastAPI REST API와 통신한다.

Base path:

```text
/api
```

### Endpoints

| Method   | Endpoint          | Description    |
| -------- | ----------------- | -------------- |
| `GET`    | `/api/posts`      | 게시글 목록 조회 및 검색 |
| `GET`    | `/api/posts/{id}` | 게시글 조회         |
| `POST`   | `/api/posts`      | 게시글 작성         |
| `PUT`    | `/api/posts/{id}` | 게시글 수정         |
| `DELETE` | `/api/posts/{id}` | 게시글 삭제         |

---

# 2. GET /api/posts

게시글 목록을 조회한다.

검색어가 없는 경우 전체 게시글을 조회하고, `search` query parameter가 있는 경우 검색 조건에 맞는 게시글만 조회한다.

## Request

### 전체 게시글 조회

```http
GET /api/posts
```

### 게시글 검색

```http
GET /api/posts?search={검색어}
```

검색어는 공백을 기준으로 분리한다.

예:

```http
GET /api/posts?search=이것%20%20테스트
```

검색어는 다음과 같이 처리한다.

```text
이것  테스트
↓
이것
테스트
```

공백이 여러 개 입력되더라도 검색어를 구분하는 역할만 한다.

## Search Conditions

각 검색어는 제목 또는 내용에 부분 문자열로 포함되어 있으면 일치한다.

여러 검색어가 있는 경우 모든 검색어를 만족해야 한다.

논리적으로 다음과 같은 조건이다.

```text
("검색어 1"이 제목 OR 내용에 포함)
AND
("검색어 2"가 제목 OR 내용에 포함)
AND
...
```

검색은 대소문자를 구분하지 않는다.

예:

```text
test
Test
TEST
```

는 동일한 검색어로 취급한다.

### Empty Search

`search` 값이 없거나 공백만 있는 경우 검색 조건을 적용하지 않고 전체 게시글을 반환한다.

예:

```http
GET /api/posts
```

```http
GET /api/posts?search=
```

```http
GET /api/posts?search=%20%20%20
```

모두 전체 게시글을 반환한다.

## Response

### Status Code

```text
200 OK
```

### Response Body

게시글 목록을 배열로 반환한다.

목록 조회에서는 `content`를 반환하지 않는다.

```json
[
  {
    "id": 1,
    "title": "이것은 테스트입니다",
    "created_at": "2026-09-29T04:00:00Z",
    "updated_at": "2026-09-29T04:00:00Z"
  },
  {
    "id": 2,
    "title": "두 번째 게시글",
    "created_at": "2026-09-28T08:30:00Z",
    "updated_at": "2026-09-28T08:30:00Z"
  }
]
```

검색 결과가 없는 경우 빈 배열을 반환한다.

```json
[]
```

## Ordering

전체 게시글 조회와 검색 결과 모두 `created_at DESC`로 정렬한다.

즉, 최근에 생성된 게시글이 먼저 반환된다.

---

# 3. GET /api/posts/{id}

특정 게시글을 조회한다.

## Request

```http
GET /api/posts/{id}
```

예:

```http
GET /api/posts/1
```

## Response

### Success

```text
200 OK
```

```json
{
  "id": 1,
  "title": "이것은 테스트입니다",
  "content": "게시글 내용입니다.",
  "created_at": "2026-09-29T04:00:00Z",
  "updated_at": "2026-09-29T04:00:00Z"
}
```

### Post Not Found

```text
404 Not Found
```

---

# 4. POST /api/posts

새 게시글을 작성한다.

## Request

```http
POST /api/posts
Content-Type: application/json
```

```json
{
  "title": "게시글 제목",
  "content": "게시글 내용"
}
```

서버가 다음 값을 생성한다.

* `id`
* `created_at`
* `updated_at`

## Validation

### `title`

* 필수
* 1~255자
* 빈 문자열 불허
* 공백만 있는 문자열은 허용

### `content`

* 필수
* 최대 길이 제한 없음
* 빈 문자열 허용
* 누락은 허용하지 않음

## Response

### Success

```text
201 Created
```

```json
{
  "id": 1,
  "title": "게시글 제목",
  "content": "게시글 내용",
  "created_at": "2026-09-29T04:00:00Z",
  "updated_at": "2026-09-29T04:00:00Z"
}
```

### Validation Error

```text
422 Unprocessable Entity
```

---

# 5. PUT /api/posts/{id}

기존 게시글을 수정한다.

전체 게시글을 교체하는 방식으로 사용한다.

## Request

```http
PUT /api/posts/1
Content-Type: application/json
```

```json
{
  "title": "수정된 제목",
  "content": "수정된 내용"
}
```

`title`과 `content`를 모두 전달해야 한다.

## Response

### Success

```text
200 OK
```

```json
{
  "id": 1,
  "title": "수정된 제목",
  "content": "수정된 내용",
  "created_at": "2026-09-29T04:00:00Z",
  "updated_at": "2026-09-29T05:00:00Z"
}
```

`updated_at`은 PUT 요청이 성공하면 기존 값과 실제 내용이 동일하더라도 갱신된다.

### Post Not Found

```text
404 Not Found
```

### Validation Error

```text
422 Unprocessable Entity
```

---

# 6. DELETE /api/posts/{id}

게시글을 삭제한다.

## Request

```http
DELETE /api/posts/1
```

## Response

### Success

```text
204 No Content
```

응답 본문은 없다.

### Post Not Found

```text
404 Not Found
```

---

# 7. Error Handling

현재 MVP에서는 기본적인 HTTP status code를 사용한다.

| Situation            |                     Status |
| -------------------- | -------------------------: |
| 정상 조회/수정             |                   `200 OK` |
| 게시글 생성 성공            |              `201 Created` |
| 게시글 삭제 성공            |           `204 No Content` |
| 존재하지 않는 게시글          |            `404 Not Found` |
| 요청 데이터 validation 실패 | `422 Unprocessable Entity` |
