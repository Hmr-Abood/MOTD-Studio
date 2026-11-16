import { insertCode } from "./editor.js";

export function initializeHexPicker() {
    const colorInput = document.getElementById("hex-color");
    const hexInput = document.getElementById("hex-value");
    const applyButton = document.getElementById("apply-hex");
    const swatch = document.getElementById("hex-preview-swatch");
    const previewLabel = document.getElementById("hex-preview-label");
    const error = document.getElementById("hex-error");

    function updateColor(value) {
        const normalized = value.trim().startsWith("#")
            ? value.trim()
            : `#${value.trim()}`;

        if (!/^#[0-9a-fA-F]{6}$/.test(normalized)) {
            return false;
        }

        const color = normalized.toUpperCase();

        colorInput.value = color;
        hexInput.value = color;
        swatch.style.backgroundColor = color;
        previewLabel.textContent = `Preview: ${color}`;
        error.textContent = "";

        return true;
    }

    colorInput.addEventListener("input", () => {
        updateColor(colorInput.value);
    });

    hexInput.addEventListener("input", () => {
        const value = hexInput.value.trim();

        if (/^#?[0-9a-fA-F]{6}$/.test(value)) {
            updateColor(value);
        } else {
            error.textContent = "Enter a valid 6-digit hex color.";
        }
    });

    hexInput.addEventListener("change", () => {
        if (!updateColor(hexInput.value)) {
            hexInput.value = colorInput.value.toUpperCase();
            error.textContent = "";
        }
    });

    applyButton.addEventListener("click", () => {
        if (!updateColor(hexInput.value)) {
            error.textContent = "Enter a valid color, such as #55FFFF.";
            return;
        }

        // Minecraft hex format: &#RRGGBB
        insertCode(`&#${colorInput.value.slice(1)}`);
    });

    updateColor(colorInput.value);
}
