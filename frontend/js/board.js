/*
 * 게시판의 URL 상태와 API 조회를 담당한다.
 * 검색 조건과 페이지를 URL에 남겨두기 때문에 새로고침이나 직접 URL 접근으로도
 * 같은 목록 상태를 재현할 수 있다.
 */

const params = new URLSearchParams(window.location.search);
const searchType = params.get("search_type") || "title_content";
const search = (params.get("search") || "").trim();
const page = Number(params.get("page") || "1");

const listElement = document.getElementById("board-list");
const paginationElement = document.getElementById("pagination");
const searchForm = document.getElementById("search-form");
const searchTypeElement = document.getElementById("search-type");
const searchInput = document.getElementById("search-input");

searchTypeElement.value = ["title", "content", "title_content"].includes(searchType)
    ? searchType
    : "title_content";
searchInput.value = search;

function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    const pad = (number) => String(number).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
        `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function buildBoardUrl(nextPage, nextSearch = search, nextSearchType = searchType) {
    const url = new URL("/board", window.location.origin);
    url.searchParams.set("page", String(nextPage));

    // 검색어가 비어 있어도 선택한 검색 조건은 유지한다.
    // 서버에서는 빈 검색어를 전체 게시글 조회로 처리한다.
    url.searchParams.set("search_type", nextSearchType);
    if (nextSearch) url.searchParams.set("search", nextSearch);
    return `${url.pathname}?${url.searchParams.toString()}`;
}

function renderError() {
    listElement.textContent = "게시글을 불러오지 못했습니다.";
    paginationElement.replaceChildren();
}

function renderEmpty(message) {
    const element = document.createElement("p");
    element.className = "empty-message";
    element.textContent = message;
    listElement.replaceChildren(element);
}

function renderPosts(posts) {
    const fragment = document.createDocumentFragment();

    for (const post of posts) {
        const row = document.createElement("a");
        row.className = "board-row";
        row.href = `/post?id=${encodeURIComponent(post.id)}&from=${encodeURIComponent(window.location.pathname + window.location.search)}`;

        const title = document.createElement("span");
        title.className = "board-title";
        title.textContent = post.title;

        const date = document.createElement("time");
        date.className = "board-date";
        date.dateTime = post.created_at;
        date.textContent = formatDate(post.created_at);

        row.append(title, date);
        fragment.append(row);
    }
    listElement.replaceChildren(fragment);
}

function renderPagination(currentPage, totalPages) {
    paginationElement.replaceChildren();
    if (totalPages <= 0) return;

    const groupStart = Math.floor((currentPage - 1) / 10) * 10 + 1;
    const groupEnd = Math.min(groupStart + 9, totalPages);
    const fragment = document.createDocumentFragment();

    if (groupStart > 1) {
        const previous = document.createElement("a");
        previous.href = buildBoardUrl(groupStart - 1);
        previous.textContent = "이전";
        fragment.append(previous);
    }

    for (let number = groupStart; number <= groupEnd; number += 1) {
        const link = document.createElement("a");
        link.href = buildBoardUrl(number);
        link.textContent = String(number);
        if (number === currentPage) link.className = "current";
        fragment.append(link);
    }

    if (groupEnd < totalPages) {
        const next = document.createElement("a");
        next.href = buildBoardUrl(groupEnd + 1);
        next.textContent = "다음";
        fragment.append(next);
    }

    paginationElement.append(fragment);
}

searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const nextType = searchTypeElement.value;
    const nextSearch = searchInput.value.trim();
    window.location.href = buildBoardUrl(1, nextSearch, nextType);
});

async function loadPosts() {
    if (!Number.isInteger(page) || page < 1) {
        // API가 정의한 422 규칙과 동일하게 처리할 수 있도록 실제 요청을 보낸다.
        // 서버가 반환하는 기본 오류 응답을 프런트에서 별도 변환하지 않는다.
    }

    const url = new URL("/api/posts", window.location.origin);
    url.searchParams.set("page", String(page));
    url.searchParams.set("search_type", searchType);
    if (search) url.searchParams.set("search", search);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            renderError();
            return;
        }

        const data = await response.json();
        if (data.posts.length === 0) {
            renderEmpty(data.total_count === 0 ? "등록된 게시글이 없습니다." : "검색 결과가 없습니다.");
        } else {
            renderPosts(data.posts);
        }
        renderPagination(data.page, data.total_pages);
    } catch (error) {
        renderError();
    }
}

loadPosts();
