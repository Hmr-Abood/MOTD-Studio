if (new URLSearchParams(window.location.search).get("embed") === "1") {
    document.documentElement.classList.add("tester-embed");
}

import { renderMinecraftText } from "./colors.js";

const form = document.getElementById("server-lookup-form");
const addressInput = document.getElementById("server-address");
const lookupButton = document.getElementById("server-lookup-button");
const statusText = document.getElementById("tester-status");
const result = document.getElementById("server-result");
const openEditorLink = document.getElementById("open-motd-editor");
let scannedMotd = null;

function setText(id, value, fallback = "—") {
    document.getElementById(id).textContent = value || fallback;
}

function renderResult(data) {
    result.hidden = false;
    setText("result-hostname", data.hostname || addressInput.value);
    setText("result-address", data.ip ? data.ip + (data.port ? ":" + data.port : "") : addressInput.value);
    setText("result-version", data.version);
    setText("result-software", data.software);
    setText("result-player-count", data.players ? data.players.online + " / " + data.players.max : "—");

    const state = document.getElementById("server-state");
    state.textContent = data.online ? "Online" : "Offline";
    state.classList.toggle("is-online", data.online);
    state.classList.toggle("is-offline", !data.online);

    const icon = document.getElementById("result-icon");
    const fallback = document.getElementById("result-icon-fallback");
    if (data.icon) {
        icon.src = data.icon;
        icon.hidden = false;
        fallback.hidden = true;
    } else {
        icon.removeAttribute("src");
        icon.hidden = true;
        fallback.hidden = false;
    }

    const motd = document.getElementById("result-motd");
    motd.replaceChildren();
    const rawLines = data.motd && Array.isArray(data.motd.raw) ? data.motd.raw : [];
    const cleanLines = data.motd && Array.isArray(data.motd.clean) ? data.motd.clean : [];
    const lines = rawLines.length ? rawLines : cleanLines;
    scannedMotd = lines.length ? {
        line1: String(lines[0] || "").replace(/§/g, "&").slice(0, 100),
        line2: String(lines[1] || "").replace(/§/g, "&").slice(0, 100)
    } : null;
    (lines.length ? lines : ["No MOTD returned by this server."]).forEach(line => {
        const paragraph = document.createElement("p");
        renderMinecraftText(paragraph, String(line).replace(/§/g, "&"));
        motd.appendChild(paragraph);
    });
}

async function checkServer() {
    const address = addressInput.value.trim();
    if (!address) return;

    lookupButton.disabled = true;
    lookupButton.textContent = "Checking...";
    statusText.textContent = "Contacting the server status provider...";
    result.hidden = true;

    try {
        const response = await fetch("/api/server-status?address=" + encodeURIComponent(address), {
            headers: { "Accept": "application/json" }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to check this server.");
        renderResult(data);
        statusText.textContent = data.online
            ? "Server is online. The status provider caches results for up to 5 minutes."
            : "The address was checked, but the server appears to be offline or unreachable.";
    } catch (error) {
        statusText.textContent = error.message || "Something went wrong. Please try again.";
    } finally {
        lookupButton.disabled = false;
        lookupButton.textContent = "Check Server";
    }
}

form.addEventListener("submit", event => {
    event.preventDefault();
    checkServer();
});

document.getElementById("test-again-button").addEventListener("click", checkServer);

openEditorLink.addEventListener("click", event => {
    if (!scannedMotd) {
        event.preventDefault();
        statusText.textContent = "This server did not return a MOTD to import.";
        return;
    }

    event.preventDefault();

    const payload = JSON.stringify({
        line1: scannedMotd.line1,
        line2: scannedMotd.line2
    });

    try {
        // Same-tab session storage survives navigation and avoids URL/local autosave conflicts.
        sessionStorage.setItem("motd-import-from-server", payload);
        window.top.location.href = "/";
    } catch (error) {
        statusText.textContent = "Could not transfer the scanned MOTD. Please allow site storage and try again.";
    }
});

const params = new URLSearchParams(window.location.search);
const initialAddress = params.get("address");
if (initialAddress && initialAddress.length <= 260) {
    addressInput.value = initialAddress;
    checkServer();
}
