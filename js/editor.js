
import { updatePreview } from "./preview.js";

const line1 = document.getElementById("line1");
const line2 = document.getElementById("line2");

const DEFAULT_LINE_1 = "&aWelcome to my server!";
const DEFAULT_LINE_2 = "&bSurvival &8• &eEvents &8• &dCommunity";

let activeInput = line1;

function getActiveInput() {
    return activeInput;
}

export function insertCode(code) {
    const input = getActiveInput();

    const start = input.selectionStart;
    const end = input.selectionEnd;

    input.setRangeText(code, start, end, "end");
    input.focus();

    updatePreview();
    saveEditorState();
}

function saveEditorState() {
    localStorage.setItem("motd-line-1", line1.value);
    localStorage.setItem("motd-line-2", line2.value);
}

function loadEditorState() {
    const savedLine1 = localStorage.getItem("motd-line-1");
    const savedLine2 = localStorage.getItem("motd-line-2");

    if (savedLine1 !== null) line1.value = savedLine1;
    if (savedLine2 !== null) line2.value = savedLine2;

    const sharedValue = new URLSearchParams(window.location.search).get("motd");
    if (sharedValue) {
        try {
            const base64 = sharedValue.replace(/-/g, "+").replace(/_/g, "/");
            const padded = base64 + "=".repeat((4 - base64.length % 4) % 4);
            const binary = atob(padded);
            const utf8 = Array.from(binary, character => "%" + character.charCodeAt(0).toString(16).padStart(2, "0")).join("");
            const decoded = JSON.parse(decodeURIComponent(utf8));
            if (decoded && typeof decoded.line1 === "string" && typeof decoded.line2 === "string"
                && decoded.line1.length <= 100 && decoded.line2.length <= 100) {
                line1.value = decoded.line1;
                line2.value = decoded.line2;
                saveEditorState();
                window.history.replaceState({}, "", window.location.pathname + window.location.hash);
            }
        } catch (error) {
            console.warn("Ignoring invalid shared MOTD link.");
        }
    }

    const importedMotd = localStorage.getItem("motd-import-from-server");
    if (importedMotd) {
        localStorage.removeItem("motd-import-from-server");
        try {
            const decoded = JSON.parse(importedMotd);
            if (decoded && typeof decoded.line1 === "string" && typeof decoded.line2 === "string"
                && decoded.line1.length <= 100 && decoded.line2.length <= 100) {
                line1.value = decoded.line1;
                line2.value = decoded.line2;
                saveEditorState();
            }
        } catch (error) {
            console.warn("Ignoring invalid imported server MOTD.");
        }
    }
}

export function applyTemplate(firstLine, secondLine) {
    line1.value = firstLine;
    line2.value = secondLine;
    activeInput = line1;
    saveEditorState();
    updatePreview();
    line1.focus();
}

function importServerMotd(detail) {
    if (!detail || typeof detail.line1 !== "string" || typeof detail.line2 !== "string"
        || detail.line1.length > 100 || detail.line2.length > 100) return;

    line1.value = detail.line1;
    line2.value = detail.line2;
    activeInput = line1;
    saveEditorState();
    updatePreview();
}

export function initializeEditor() {
    loadEditorState();
    window.addEventListener("motd-studio:import-server-motd", event => {
        importServerMotd(event.detail);
    });

    line1.addEventListener("focus", () => {
        activeInput = line1;
    });

    line2.addEventListener("focus", () => {
        activeInput = line2;
    });

    line1.addEventListener("input", () => {
        updatePreview();
        saveEditorState();
    });

    line2.addEventListener("input", () => {
        updatePreview();
        saveEditorState();
    });

    document.querySelectorAll("[data-code]").forEach(button => {
        button.addEventListener("click", () => {
            insertCode(button.dataset.code);
        });
    });

    document.getElementById("share-button")?.addEventListener("click", async () => {
        const status = document.getElementById("copy-status");
        const payload = JSON.stringify({ line1: line1.value, line2: line2.value });
        const encoded = btoa(unescape(encodeURIComponent(payload)))
            .replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
        const shareUrl = new URL(window.location.href);
        shareUrl.search = "";
        shareUrl.hash = "";
        shareUrl.searchParams.set("motd", encoded);
        try {
            await navigator.clipboard.writeText(shareUrl.toString());
            status.textContent = "Share link copied!";
        } catch (error) {
            status.textContent = shareUrl.toString();
        }
    });

    document.getElementById("reset-button").addEventListener("click", () => {
        line1.value = DEFAULT_LINE_1;
        line2.value = DEFAULT_LINE_2;

        saveEditorState();
        updatePreview();
    });

    updatePreview();
}
