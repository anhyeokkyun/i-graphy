/* 새 게시글 작성 화면. 입력 검증은 서버(Pydantic)가 담당한다. */

const form = document.getElementById("post-form");
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const cancelButton = document.getElementById("cancel-button");

cancelButton.addEventListener("click", () => {
    const hasInput = titleInput.value !== "" || contentInput.value !== "";
    if (hasInput && !confirm("작성 중인 내용이 있습니다. 취소하시겠습니까?")) return;
    window.location.href = "/board?page=1";
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
        const response = await fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: titleInput.value, content: contentInput.value }),
        });

        if (!response.ok) {
            alert("게시글을 등록하지 못했습니다.");
            return;
        }

        window.location.href = "/board?page=1";
    } catch (error) {
        alert("게시글을 등록하지 못했습니다.");
    }
});
