const form = document.getElementById("auth-form");
const loginTab = document.getElementById("login-tab");
const registerTab = document.getElementById("register-tab");
const title = document.getElementById("auth-title");
const description = document.getElementById("auth-description");
const passwordInput = document.getElementById("password");
const submitButton = document.getElementById("auth-submit");
const message = document.getElementById("auth-message");
const switchLabel = document.getElementById("auth-switch-label");
const switchButton = document.getElementById("auth-switch");
let mode = "login";

function setMode(nextMode) {
    mode = nextMode;
    const registering = mode === "register";
    loginTab.classList.toggle("is-active", !registering);
    registerTab.classList.toggle("is-active", registering);
    loginTab.setAttribute("aria-selected", String(!registering));
    registerTab.setAttribute("aria-selected", String(registering));
    title.textContent = registering ? "Create account" : "Log in";
    description.textContent = registering ? "원하는 계정명과 암호를 지정하세요." : "계정명과 암호를 입력하세요.";
    passwordInput.autocomplete = registering ? "new-password" : "current-password";
    submitButton.textContent = registering ? "Create account" : "Log in";
    switchLabel.textContent = registering ? "이미 계정이 있으신가요?" : "처음 방문하셨나요?";
    switchButton.textContent = registering ? "로그인" : "계정 생성";
    message.hidden = true;
    message.textContent = "";
}

loginTab.addEventListener("click", () => setMode("login"));
registerTab.addEventListener("click", () => setMode("register"));
switchButton.addEventListener("click", () => setMode(mode === "login" ? "register" : "login"));

async function checkSession() {
    try {
        const response = await fetch("/api/auth/me");
        if (response.ok) window.location.replace("/board?page=1");
    } catch (_) {}
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.hidden = true;
    submitButton.disabled = true;
    try {
        const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: document.getElementById("username").value,
                password: passwordInput.value
            })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            message.textContent = data.detail || "요청을 처리하지 못했습니다.";
            message.hidden = false;
            return;
        }
        window.location.replace("/board?page=1");
    } catch (_) {
        message.textContent = "서버에 연결하지 못했습니다. 잠시 후 다시 시도하세요.";
        message.hidden = false;
    } finally {
        submitButton.disabled = false;
    }
});

checkSession();
