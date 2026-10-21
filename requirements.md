# Requirements

## Pages

- `index.html`: future login/account landing page; MVP redirects to `/board?page=1`.
- `board.html`: normal post list and search results.
- `post.html`: individual post view.
- `new-post.html`: create post.
- `edit-post.html`: edit post.

## Posts

- ID: integer, PostgreSQL identity primary key.
- Title: required, 1~255 characters; empty string is rejected, whitespace-only is allowed.
- Content: required field, unlimited length, empty string allowed.
- Created/updated timestamps: PostgreSQL-managed UTC timestamps.

## Search

- Conditions: `title`, `content`, `title_content`.
- Default: `title_content`.
- Terms are separated by whitespace and combined with AND.
- Each term is a substring match.
- Case-insensitive.
- `%` and `_` are treated as literal characters.
- Empty search means all posts.
- Results use `created_at DESC`.

## List

- 20 posts per page.
- `created_at` displayed as `YYYY-MM-DD HH:mm` in the user's local browser time.
- Pagination uses groups of 10 pages.
- Empty dataset allows page 1 and reports `total_pages: 0`.

## Navigation

- A board URL is preserved in the `from` query parameter when entering a post/edit page.
- `[목록]` restores the originating board state.
- Browser back/forward uses normal browser history; History API is not used.
