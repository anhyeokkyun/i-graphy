/* 비로그인 사용자가 개별 공유 링크로 게시글을 읽기만 하는 화면. */
const token = window.location.pathname.split("/").filter(Boolean).pop();
const postElement = document.getElementById("shared-post");

function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    const pad = (number) => String(number).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

async function loadSharedPost() {
    try {
        const response = await fetch(`/api/public/posts/${encodeURIComponent(token)}`);
        if (!response.ok) throw new Error("이 공유 링크는 만료되었거나 취소되었습니다.");
        const post = await response.json();
        const title = document.createElement("h1");
        title.className = "post-title";
        title.textContent = post.title;
        const meta = document.createElement("div");
        meta.className = "post-meta";
        meta.textContent = "작성 " + formatDate(post.created_at) + " · 수정 " + formatDate(post.updated_at);
        const separator = document.createElement("hr");
        separator.className = "post-separator";
        const body = document.createElement("div");
        body.className = "post-body";
        body.textContent = post.content;
        const notice = document.createElement("p");
        notice.className = "share-public-message";
        notice.textContent = "읽기 전용 공유 게시글 · 만료 시각: " + formatDate(post.expires_at);
        postElement.replaceChildren(title, meta, separator, body, notice);
    } catch (error) {
        const message = document.createElement("p");
        message.className = "share-public-message";
        message.textContent = error.message || "공유 게시글을 불러오지 못했습니다.";
        postElement.replaceChildren(message);
    }
}

loadSharedPost();