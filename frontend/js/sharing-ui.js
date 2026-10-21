/* 공유 만료 시각 설정과 공유 취소를 공통 모달로 처리한다. */
(function () {
    function pad(value) { return String(value).padStart(2, "0"); }

    function toLocalInputValue(date) {
        return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) +
            "T" + pad(date.getHours()) + ":" + pad(date.getMinutes());
    }

    function formatDate(value) {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) +
            " " + pad(date.getHours()) + ":" + pad(date.getMinutes());
    }

    async function requestStatus(endpoint) {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error("공유 상태를 불러오지 못했습니다.");
        return response.json();
    }

    async function updateButton(button, endpoint) {
        try {
            const state = await requestStatus(endpoint);
            button.textContent = state.active ? "Sharing" : "Share";
            button.classList.toggle("button-sharing", state.active);
            button.setAttribute("aria-pressed", String(state.active));
        } catch (_) {
            button.textContent = "Share";
            button.classList.remove("button-sharing");
            button.setAttribute("aria-pressed", "false");
        }
    }

    async function openShareDialog(options) {
        const endpoint = options.kind === "board"
            ? "/api/sharing/board"
            : "/api/sharing/posts/" + encodeURIComponent(options.postId);
        let state;
        try {
            state = await requestStatus(endpoint);
        } catch (error) {
            alert(error.message || "공유 상태를 불러오지 못했습니다.");
            return;
        }

        const backdrop = document.createElement("div");
        backdrop.className = "share-modal-backdrop";
        const dialog = document.createElement("section");
        dialog.className = "share-modal";
        dialog.setAttribute("role", "dialog");
        dialog.setAttribute("aria-modal", "true");
        dialog.setAttribute("aria-labelledby", "share-modal-title");

        const heading = document.createElement("h2");
        heading.id = "share-modal-title";
        heading.textContent = options.kind === "board" ? "Share board" : "Share post";

        const description = document.createElement("p");
        description.className = "share-modal-description";
        description.textContent = state.active
            ? "이 링크는 표시된 만료 시각까지 읽기 전용으로 열립니다."
            : "공유 링크의 만료 시각을 선택하세요.";

        const details = document.createElement("div");
        details.className = "share-modal-details";

        if (state.active) {
            const expiry = document.createElement("p");
            expiry.textContent = "만료 시각: " + formatDate(state.expires_at);
            details.append(expiry);

            const linkLabel = document.createElement("label");
            linkLabel.textContent = "공유 링크";
            linkLabel.htmlFor = "share-link-value";
            const linkInput = document.createElement("input");
            linkInput.id = "share-link-value";
            linkInput.type = "url";
            linkInput.readOnly = true;
            linkInput.value = new URL(state.url, window.location.origin).href;
            linkInput.addEventListener("focus", () => linkInput.select());
            details.append(linkLabel, linkInput);

            const copyButton = document.createElement("button");
            copyButton.type = "button";
            copyButton.className = "button";
            copyButton.textContent = "Copy link";
            copyButton.addEventListener("click", async () => {
                try {
                    await navigator.clipboard.writeText(linkInput.value);
                    copyButton.textContent = "Copied";
                } catch (_) {
                    linkInput.focus();
                    linkInput.select();
                    try {
                        document.execCommand("copy");
                        copyButton.textContent = "Copied";
                    } catch (_) {
                        alert("링크를 선택했으니 직접 복사해 주세요.");
                    }
                }
            });
            details.append(copyButton);
        } else {
            const label = document.createElement("label");
            label.htmlFor = "share-expiry";
            label.textContent = "만료 시각 (연·월·일·시·분)";
            const expiryInput = document.createElement("input");
            expiryInput.id = "share-expiry";
            expiryInput.type = "datetime-local";
            expiryInput.required = true;
            const now = new Date();
            expiryInput.min = toLocalInputValue(now);
            const defaultExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            expiryInput.value = toLocalInputValue(defaultExpiry);
            details.append(label, expiryInput);

            const saveButton = document.createElement("button");
            saveButton.type = "button";
            saveButton.className = "button button-primary";
            saveButton.textContent = "Share";
            saveButton.addEventListener("click", async () => {
                if (!expiryInput.value) {
                    alert("만료 시각을 선택하세요.");
                    return;
                }
                const expiry = new Date(expiryInput.value);
                if (Number.isNaN(expiry.getTime()) || expiry <= new Date()) {
                    alert("만료 시각은 현재보다 미래여야 합니다.");
                    return;
                }
                saveButton.disabled = true;
                try {
                    const response = await fetch(endpoint, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ expires_at: expiry.toISOString() }),
                    });
                    const result = await response.json().catch(() => ({}));
                    if (!response.ok) {
                        throw new Error(result.detail || "공유를 시작하지 못했습니다.");
                    }
                    backdrop.remove();
                    await updateButton(options.button, endpoint);
                    if (options.onChange) options.onChange(true);
                    openShareDialog(options);
                } catch (error) {
                    alert(error.message || "공유를 시작하지 못했습니다.");
                    saveButton.disabled = false;
                }
            });
            details.append(saveButton);
        }

        const footer = document.createElement("div");
        footer.className = "share-modal-actions";
        if (state.active) {
            const cancelSharingButton = document.createElement("button");
            cancelSharingButton.type = "button";
            cancelSharingButton.className = "button button-danger";
            cancelSharingButton.textContent = "Cancel sharing";
            cancelSharingButton.addEventListener("click", async () => {
                if (!confirm("공유를 취소할까요? 기존 공유 링크는 즉시 사용할 수 없게 됩니다.")) return;
                cancelSharingButton.disabled = true;
                try {
                    const response = await fetch(endpoint, { method: "DELETE" });
                    if (!response.ok) throw new Error("공유를 취소하지 못했습니다.");
                    backdrop.remove();
                    await updateButton(options.button, endpoint);
                    if (options.onChange) options.onChange(false);
                } catch (error) {
                    alert(error.message || "공유를 취소하지 못했습니다.");
                    cancelSharingButton.disabled = false;
                }
            });
            footer.append(cancelSharingButton);
        }

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "button";
        closeButton.textContent = "Close";
        closeButton.addEventListener("click", () => backdrop.remove());
        footer.append(closeButton);

        backdrop.addEventListener("click", (event) => {
            if (event.target === backdrop) backdrop.remove();
        });
        dialog.append(heading, description, details, footer);
        backdrop.append(dialog);
        document.body.append(backdrop);
        const focusTarget = dialog.querySelector("input") || closeButton;
        focusTarget.focus();
    }

    window.iGraphySharing = {
        updateButton,
        openShareDialog,
    };
})();
