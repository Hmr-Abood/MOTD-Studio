
import { initializeEditor } from "./editor.js";
import { initializeClipboard } from "./clipboard.js";
import { initializeHexPicker } from "./hex-picker.js";
import { initializeGradientGenerator } from "./gradient-generator.js";
import { initializePreviewBackgrounds } from "./preview-backgrounds.js";

document.addEventListener("DOMContentLoaded", () => {
    initializeEditor();
    initializeClipboard();
    initializeHexPicker();
    initializeGradientGenerator();
    initializePreviewBackgrounds();
});
