
import { renderMinecraftText } from "./colors.js";

const line1Input = document.getElementById("line1");
const line2Input = document.getElementById("line2");

const previewLine1 = document.getElementById("preview-line-1");
const previewLine2 = document.getElementById("preview-line-2");

export function updatePreview() {
    renderMinecraftText(previewLine1, line1Input.value);
    renderMinecraftText(previewLine2, line2Input.value);
}

export function getMOTD() {
    return `${line1Input.value}\n${line2Input.value}`;
}
