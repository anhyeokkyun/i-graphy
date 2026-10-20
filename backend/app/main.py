import os
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

from .routers.auth import router as auth_router
from .routers.posts import router as posts_router
from .security import session_secret

BASE_DIR = Path(__file__).resolve().parents[2]
FRONTEND_DIR = BASE_DIR / "frontend"

app = FastAPI(title="i-graphy")
app.add_middleware(
    SessionMiddleware,
    secret_key=session_secret(),
    session_cookie="i_graphy_session",
    max_age=60 * 60 * 24 * 14,
    same_site="lax",
    https_only=os.getenv("COOKIE_SECURE", "false").lower() == "true",
)

app.mount("/css", StaticFiles(directory=FRONTEND_DIR / "css"), name="css")
app.mount("/js", StaticFiles(directory=FRONTEND_DIR / "js"), name="js")
app.include_router(auth_router)
app.include_router(posts_router)


@app.get("/")
def index():
    return FileResponse(FRONTEND_DIR / "index.html")


def protected_page(request: Request, filename: str):
    if not request.session.get("user_id"):
        return RedirectResponse(url="/", status_code=303)
    return FileResponse(FRONTEND_DIR / filename)


@app.get("/board")
def board(request: Request):
    return protected_page(request, "board.html")


@app.get("/post")
def post(request: Request):
    return protected_page(request, "post.html")


@app.get("/new-post")
def new_post(request: Request):
    return protected_page(request, "new-post.html")


@app.get("/edit-post")
def edit_post(request: Request):
    return protected_page(request, "edit-post.html")
