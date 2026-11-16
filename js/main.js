
import { initializeEditor } from "./editor.js";
import { initializeClipboard } from "./clipboard.js";
import { initializeHexPicker } from "./hex-picker.js";

document.addEventListener("DOMContentLoaded", () => {
    initializeEditor();
    initializeClipboard();
    initializeHexPicker();
});
