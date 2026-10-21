/*
 * 게시글 수정 화면.
 * `from`을 통해 원래 게시판 상태를 보존한다.
 * 초기 조회 실패와 저장 시 대상이 사라진 경우 모두 이전 목록으로 돌아간다.
 */

const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));
const from = params.get("from");
const fallbackBoard = "/board?page=1";
const form = document.getElementById("post-form");
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const cancelButton = document.getElementById("cancel-button");
let originalTitle = "";
let originalContent = "";

function getReturnUrl() {
    if (!from || !from.startsWith("/board")) return fallbackBoard;
    return from;
}

function fail(message) {
    alert(message);
    window.location.href = getReturnUrl();
}

async function loadPost() {
    if (!Number.isInteger(id) || id < 1) {
        fail("게시글을 찾을 수 없습니다.");
        return;
    }

    try {
        const response = await fetch(`/api/posts/${encodeURIComponent(id)}`);
        if (response.status === 404) {
            fail("게시글을 찾을 수 없습니다.");
            return;
        }
        if (!response.ok) {
            fail("게시글을 불러오지 못했습니다.");
            return;
        }

        const post = await response.json();
        originalTitle = post.title;
        originalContent = post.content;
        titleInput.value = post.title;
        contentInput.value = post.content;
        form.hidden = false;
    } catch (error) {
        fail("게시글을 불러오지 못했습니다.");
    }
}

cancelButton.addEventListener("click", () => {
    const changed = titleInput.value !== originalTitle || contentInput.value !== originalContent;
    if (changed && !confirm("수정 중인 내용이 있습니다. 취소하시겠습니까?")) return;
    window.location.href = `/post?id=${encodeURIComponent(id)}&from=${encodeURIComponent(getReturnUrl())}`;
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
        const response = await fetch(`/api/posts/${encodeURIComponent(id)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: titleInput.value, content: contentInput.value }),
        });

        if (response.status === 404) {
            fail("게시글을 찾을 수 없습니다.");
            return;
        }
        if (!response.ok) {
            alert("게시글을 저장하지 못했습니다.");
            return;
        }

        window.location.href = `/post?id=${encodeURIComponent(id)}&from=${encodeURIComponent(getReturnUrl())}`;
    } catch (error) {
        alert("게시글을 저장하지 못했습니다.");
    }
});

loadPost();
