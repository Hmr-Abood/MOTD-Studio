import { insertCode } from "./editor.js";
import { renderMinecraftText } from "./colors.js";

function hexToRgb(hex) {
    const value = hex.replace("#", "");
    return {
        r: parseInt(value.slice(0, 2), 16),
        g: parseInt(value.slice(2, 4), 16),
        b: parseInt(value.slice(4, 6), 16)
    };
}

function rgbToHex({ r, g, b }) {
    return [r, g, b]
        .map(value => Math.round(value).toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();
}

function createGradientText(text, startHex, endHex) {
    const characters = Array.from(text);
    if (!characters.length) return "";

    const start = hexToRgb(startHex);
    const end = hexToRgb(endHex);
    const denominator = Math.max(characters.length - 1, 1);

    return characters.map((character, index) => {
        const amount = index / denominator;
        const color = {
            r: start.r + (end.r - start.r) * amount,
            g: start.g + (end.g - start.g) * amount,
            b: start.b + (end.b - start.b) * amount
        };

        return `&#${rgbToHex(color)}${character}`;
    }).join("");
}

export function initializeGradientGenerator() {
    const textInput = document.getElementById("gradient-text");
    const startInput = document.getElementById("gradient-start");
    const endInput = document.getElementById("gradient-end");
    const preview = document.getElementById("gradient-preview");
    const insertButton = document.getElementById("insert-gradient");
    const status = document.getElementById("gradient-status");

    function updatePreview() {
        const generated = createGradientText(
            textInput.value,
            startInput.value,
            endInput.value
        );

        renderMinecraftText(preview, generated || "Enter text to preview");
        return generated;
    }

    [textInput, startInput, endInput].forEach(input => {
        input.addEventListener("input", () => {
            status.textContent = "";
            updatePreview();
        });
    });

    insertButton.addEventListener("click", () => {
        const generated = updatePreview();

        if (!textInput.value.trim()) {
            status.textContent = "Enter some text first.";
            return;
        }

        insertCode(generated);
        status.textContent = "Gradient inserted into the selected MOTD line.";
    });

    updatePreview();
}
