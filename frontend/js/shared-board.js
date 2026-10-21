/* 비로그인 사용자가 공유 링크로 게시판 전체를 읽기만 하는 화면. */
const token = window.location.pathname.split("/").filter(Boolean).pop();
const titleElement = document.getElementById("shared-board-title");
const messageElement = document.getElementById("shared-board-message");
const postsElement = document.getElementById("shared-board-posts");

function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    const pad = (number) => String(number).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

async function loadSharedBoard() {
    try {
        const response = await fetch(`/api/public/board/${encodeURIComponent(token)}`);
        if (!response.ok) throw new Error("이 공유 링크는 만료되었거나 취소되었습니다.");
        const data = await response.json();
        titleElement.textContent = data.username + " · Shared Board";
        messageElement.textContent = "읽기 전용 · 만료 시각: " + formatDate(data.expires_at);

        if (!data.posts.length) {
            const empty = document.createElement("p");
            empty.className = "empty-message";
            empty.textContent = "공유할 게시글이 없습니다.";
            postsElement.replaceChildren(empty);
            return;
        }

        const fragment = document.createDocumentFragment();
        for (const post of data.posts) {
            const article = document.createElement("article");
            article.className = "shared-post-card";
            const heading = document.createElement("h2");
            heading.className = "shared-post-heading";
            heading.textContent = post.title;
            const date = document.createElement("p");
            date.className = "post-meta";
            date.textContent = "작성 " + formatDate(post.created_at) + " · 수정 " + formatDate(post.updated_at);
            const body = document.createElement("div");
            body.className = "post-body";
            body.textContent = post.content;
            article.append(heading, date, body);
            fragment.append(article);
        }
        postsElement.replaceChildren(fragment);
    } catch (error) {
        titleElement.textContent = "공유 게시판을 열 수 없습니다.";
        messageElement.textContent = error.message || "공유 링크를 확인해 주세요.";
        postsElement.replaceChildren();
    }
}

loadSharedBoard();