/*
 * 게시글 조회 화면.
 * `from`은 게시판에서 이 페이지로 들어온 당시의 URL을 보존한다.
 * 목록 버튼과 조회 오류는 이 값을 사용해 같은 게시판 상태로 돌아간다.
 */

const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));
const from = params.get("from");
const fallbackBoard = "/board?page=1";
const postElement = document.getElementById("post");

function getReturnUrl() {
    if (!from || !from.startsWith("/board")) return fallbackBoard;
    return from;
}

function formatDate(value) {
    const date = new Date(value);
    const pad = (number) => String(number).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function showLoadError(message) {
    alert(message);
    window.location.href = getReturnUrl();
}

function renderPost(post) {
    const title = document.createElement("h1");
    title.className = "post-title";
    title.textContent = post.title;

    const meta = document.createElement("div");
    meta.className = "post-meta";
    meta.textContent = `작성 ${formatDate(post.created_at)} · 수정 ${formatDate(post.updated_at)}`;

    const separator = document.createElement("hr");
    separator.className = "post-separator";

    const body = document.createElement("div");
    body.className = "post-body";
    body.textContent = post.content;

    const actions = document.createElement("div");
    actions.className = "post-actions";

    const listButton = document.createElement("a");
    listButton.className = "button";
    listButton.href = getReturnUrl();
    listButton.textContent = "목록";

    const right = document.createElement("div");
    right.className = "post-actions-right";

    const editButton = document.createElement("a");
    editButton.className = "button";
    editButton.href = `/edit-post?id=${encodeURIComponent(post.id)}&from=${encodeURIComponent(getReturnUrl())}`;
    editButton.textContent = "수정";

    const deleteButton = document.createElement("button");
    deleteButton.className = "button";
    deleteButton.type = "button";
    deleteButton.textContent = "삭제";
    deleteButton.addEventListener("click", () => deletePost(post.id));

    right.append(editButton, deleteButton);
    actions.append(listButton, right);
    postElement.replaceChildren(title, meta, separator, body, actions);
}

async function deletePost(postId) {
    if (!confirm("게시글을 삭제하시겠습니까?")) return;

    try {
        const response = await fetch(`/api/posts/${encodeURIComponent(postId)}`, { method: "DELETE" });
        if (!response.ok) {
            alert("게시글을 삭제하지 못했습니다.");
            return;
        }

        // 삭제 후 현재 페이지가 사라졌는지 서버의 현재 페이지 조회로 확인한다.
        // 422이면 마지막 페이지를 다시 조회해 같은 검색 상태를 유지한다.
        const returnUrl = new URL(getReturnUrl(), window.location.origin);
        const check = await fetch(`/api/posts${returnUrl.search}`);
        if (check.ok) {
            window.location.href = getReturnUrl();
            return;
        }

        const firstPageUrl = new URL("/api/posts", window.location.origin);
        firstPageUrl.searchParams.set("page", "1");
        const checkFirst = await fetch(firstPageUrl);
        if (checkFirst.ok) {
            const data = await checkFirst.json();
            const lastPage = Math.max(1, data.total_pages);
            returnUrl.searchParams.set("page", String(lastPage));
            window.location.href = `${returnUrl.pathname}?${returnUrl.searchParams.toString()}`;
            return;
        }

        // 삭제 자체는 성공했지만 후속 상태 확인에 실패한 경우에는
        // 사용자가 작업하던 목록으로 일단 복귀한다.
        window.location.href = getReturnUrl();
    } catch (error) {
        alert("게시글을 삭제하지 못했습니다.");
    }
}

async function loadPost() {
    if (!Number.isInteger(id) || id < 1) {
        showLoadError("게시글을 찾을 수 없습니다.");
        return;
    }

    try {
        const response = await fetch(`/api/posts/${encodeURIComponent(id)}`);
        if (response.status === 404) {
            showLoadError("게시글을 찾을 수 없습니다.");
            return;
        }
        if (!response.ok) {
            showLoadError("게시글을 불러오지 못했습니다.");
            return;
        }
        renderPost(await response.json());
    } catch (error) {
        showLoadError("게시글을 불러오지 못했습니다.");
    }
}

loadPost();
