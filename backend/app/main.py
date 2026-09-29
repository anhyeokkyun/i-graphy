from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .routers.posts import router as posts_router

BASE_DIR = Path(__file__).resolve().parents[2]
FRONTEND_DIR = BASE_DIR / "frontend"

app = FastAPI(title="i-graphy")

# HTML은 FileResponse로 직접 제공하고, CSS/JS만 StaticFiles로 제공한다.
app.mount("/css", StaticFiles(directory=FRONTEND_DIR / "css"), name="css")
app.mount("/js", StaticFiles(directory=FRONTEND_DIR / "js"), name="js")
app.include_router(posts_router)


@app.get("/")
def index():
    return FileResponse(FRONTEND_DIR / "index.html")


@app.get("/board")
def board():
    return FileResponse(FRONTEND_DIR / "board.html")


@app.get("/post")
def post():
    return FileResponse(FRONTEND_DIR / "post.html")


@app.get("/new-post")
def new_post():
    return FileResponse(FRONTEND_DIR / "new-post.html")


@app.get("/edit-post")
def edit_post():
    return FileResponse(FRONTEND_DIR / "edit-post.html")
