const accountLabel = document.getElementById("current-account");
const logoutButton = document.getElementById("logout-button");

async function loadCurrentAccount() {
    try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
            window.location.replace("/");
            return;
        }
        const user = await response.json();
        accountLabel.textContent = user.username;
    } catch (_) {
        window.location.replace("/");
    }
}

logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;
    try {
        await fetch("/api/auth/logout", { method: "POST" });
    } finally {
        window.location.replace("/");
    }
});

loadCurrentAccount();
