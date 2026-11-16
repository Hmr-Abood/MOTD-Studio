
const LEGACY_COLORS = {
    "0": "#000000",
    "1": "#0000AA",
    "2": "#00AA00",
    "3": "#00AAAA",
    "4": "#AA0000",
    "5": "#AA00AA",
    "6": "#FFAA00",
    "7": "#AAAAAA",
    "8": "#555555",
    "9": "#5555FF",
    "a": "#55FF55",
    "b": "#55FFFF",
    "c": "#FF5555",
    "d": "#FF55FF",
    "e": "#FFFF55",
    "f": "#FFFFFF"
};

export function renderMinecraftText(container, text) {
    container.replaceChildren();

    let color = null;
    let bold = false;
    let italic = false;
    let underline = false;
    let strikethrough = false;
    let obfuscated = false;

    let buffer = "";

    function flush() {
        if (!buffer) return;

        const span = document.createElement("span");
        span.textContent = buffer;
        if (obfuscated) {
            span.classList.add("minecraft-obfuscated");
            span.dataset.originalText = buffer;
        }

        if (color) span.style.color = color;
        if (bold) span.style.fontWeight = "bold";
        if (italic) span.style.fontStyle = "italic";

        const decorations = [];
        if (underline) decorations.push("underline");
        if (strikethrough) decorations.push("line-through");

        if (decorations.length) {
            span.style.textDecoration = decorations.join(" ");
        }

        container.appendChild(span);
        buffer = "";
    }

    function resetFormatting() {
        color = null;
        bold = false;
        italic = false;
        underline = false;
        strikethrough = false;
        obfuscated = false;
    }

    for (let i = 0; i < text.length; i++) {
        // Hex format: &#RRGGBB
        const hexMatch = text.slice(i).match(/^&#([0-9a-fA-F]{6})/);

        if (hexMatch) {
            flush();
            color = `#${hexMatch[1]}`;
            bold = false;
            italic = false;
            underline = false;
            strikethrough = false;
            obfuscated = false;
            i += hexMatch[0].length - 1;
            continue;
        }

        // Legacy format: &a, &l, &r, etc.
        if (text[i] === "&" && i + 1 < text.length) {
            const code = text[i + 1].toLowerCase();

            if (LEGACY_COLORS[code]) {
                flush();
                color = LEGACY_COLORS[code];
                bold = false;
                italic = false;
                underline = false;
                strikethrough = false;
                obfuscated = false;
                i++;
                continue;
            }

            if (["k", "l", "m", "n", "o", "r"].includes(code)) {
                flush();

                switch (code) {
                    case "l":
                        bold = true;
                        break;
                    case "o":
                        italic = true;
                        break;
                    case "n":
                        underline = true;
                        break;
                    case "m":
                        strikethrough = true;
                        break;
                    case "r":
                        resetFormatting();
                        break;
                    case "k":
                        obfuscated = true;
                        break;
                }

                i++;
                continue;
            }
        }

        buffer += text[i];
    }

    flush();
}


// Minecraft's obfuscated (&k) text rapidly cycles through substitute glyphs.
const OBFUSCATED_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}<>?/";
if (typeof window !== "undefined" && !window.__motdObfuscationTimer) {
    window.__motdObfuscationTimer = window.setInterval(() => {
        document.querySelectorAll(".minecraft-obfuscated").forEach(span => {
            const original = span.dataset.originalText || "";
            span.textContent = Array.from(original, character => {
                if (/\\s/.test(character)) return character;
                return OBFUSCATED_GLYPHS[Math.floor(Math.random() * OBFUSCATED_GLYPHS.length)];
            }).join("");
        });
    }, 75);
}
