# API

## GET /api/posts

Query parameters:

- `search`: optional
- `search_type`: `title`, `content`, `title_content`; default `title_content`
- `page`: integer >= 1; default 1

20 posts per page. `created_at DESC`.

Response:

```json
{
  "posts": [],
  "page": 1,
  "total_count": 0,
  "total_pages": 0
}
```

Invalid page and invalid search type use FastAPI-style 422 errors.

## GET /api/posts/{id}

Returns the complete post. Missing post: 404.

## POST /api/posts

Request:

```json
{"title": "제목", "content": "내용"}
```

Returns 201 and the complete post.

## PUT /api/posts/{id}

Full replacement using the same request shape. Returns 200. Successful UPDATE always changes `updated_at` through the PostgreSQL trigger. Missing post: 404.

## DELETE /api/posts/{id}

Returns 204 with no body. Missing post: 404.

Validation errors use FastAPI/Pydantic's default 422 response format; no custom error schema is introduced.
