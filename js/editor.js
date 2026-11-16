
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
}

export function applyTemplate(firstLine, secondLine) {
    line1.value = firstLine;
    line2.value = secondLine;
    activeInput = line1;
    saveEditorState();
    updatePreview();
    line1.focus();
}

export function initializeEditor() {
    loadEditorState();

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

    document.getElementById("reset-button").addEventListener("click", () => {
        line1.value = DEFAULT_LINE_1;
        line2.value = DEFAULT_LINE_2;

        saveEditorState();
        updatePreview();
    });

    updatePreview();
}
