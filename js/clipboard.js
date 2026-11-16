
import { getMOTD } from "./preview.js";

export async function copyMOTD() {
    const status = document.getElementById("copy-status");
    const button = document.getElementById("copy-button");

    try {
        await navigator.clipboard.writeText(getMOTD());

        status.textContent = "MOTD copied successfully!";
        button.textContent = "Copied!";
    } catch (error) {
        status.textContent = "Unable to copy. Check browser permissions.";
        button.textContent = "Copy MOTD";
    }

    setTimeout(() => {
        button.textContent = "Copy MOTD";
        status.textContent = "";
    }, 2000);
}

export function initializeClipboard() {
    document.getElementById("copy-button").addEventListener("click", copyMOTD);
}
