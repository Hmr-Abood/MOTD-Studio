const STORAGE_KEY = "motd-studio-preview-background";
const preview = document.querySelector(".minecraft-window");

export function initializePreviewBackgrounds() {
    const presets = document.getElementById("background-presets");
    const upload = document.getElementById("background-upload");
    const clear = document.getElementById("clear-background");
    const status = document.getElementById("background-status");

    function selectPreset(name) {
        preview.dataset.previewBackground = name;
        delete preview.dataset.customBackground;
        preview.style.backgroundImage = "";
        presets.querySelectorAll("[data-background]").forEach(button => {
            const selected = button.dataset.background === name;
            button.classList.toggle("active", selected);
            button.setAttribute("aria-pressed", String(selected));
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ type: "preset", value: name }));
        status.textContent = name === "default" ? "Default background selected." : `${name.replace("-", " ")} background selected.`;
    }

    function clearCustomImage() {
        preview.style.backgroundImage = "";
        delete preview.dataset.customBackground;
        upload.value = "";
        selectPreset("default");
    }

    presets.addEventListener("click", event => {
        const button = event.target.closest("[data-background]");
        if (!button) return;
        selectPreset(button.dataset.background);
    });

    upload.addEventListener("change", () => {
        const file = upload.files?.[0];
        if (!file) return;
        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
            status.textContent = "Choose a PNG, JPG, or WebP image.";
            upload.value = "";
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            status.textContent = "Image must be 5 MB or smaller.";
            upload.value = "";
            return;
        }

        const reader = new FileReader();
        reader.addEventListener("load", () => {
            const image = reader.result;
            preview.style.backgroundImage = `linear-gradient(#0005, #0005), url("${image}")`;
            preview.dataset.customBackground = "true";
            delete preview.dataset.previewBackground;
            presets.querySelectorAll("[data-background]").forEach(button => {
                const selected = button.dataset.background === "default";
                button.classList.toggle("active", selected);
                button.setAttribute("aria-pressed", String(selected));
            });
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ type: "custom", value: image }));
                status.textContent = "Custom background saved in this browser.";
            } catch {
                status.textContent = "Image applied, but it is too large to save locally.";
            }
        });
        reader.addEventListener("error", () => {
            status.textContent = "Could not read that image.";
        });
        reader.readAsDataURL(file);
    });

    clear.addEventListener("click", clearCustomImage);

    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
        if (saved?.type === "preset" && presets.querySelector(`[data-background="${saved.value}"]`)) {
            selectPreset(saved.value);
        } else if (saved?.type === "custom" && typeof saved.value === "string" && saved.value.startsWith("data:image/")) {
            preview.style.backgroundImage = `linear-gradient(#0005, #0005), url("${saved.value}")`;
            preview.dataset.customBackground = "true";
            presets.querySelectorAll("[data-background]").forEach(button => {
                button.classList.toggle("active", false);
                button.setAttribute("aria-pressed", "false");
            });
            status.textContent = "Restored your custom background.";
        } else {
            selectPreset("default");
        }
    } catch {
        selectPreset("default");
    }
}
