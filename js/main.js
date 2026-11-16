
import { initializeEditor } from "./editor.js";
import { initializeClipboard } from "./clipboard.js";

document.addEventListener("DOMContentLoaded", () => {
    initializeEditor();
    initializeClipboard();
});
