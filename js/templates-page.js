import { renderMinecraftText } from "./colors.js";

const STORAGE_KEY = "motd-studio-custom-templates";
const grid = document.getElementById("template-grid");
const search = document.getElementById("template-search");
const categoryFilter = document.getElementById("filter-category");
const languageFilter = document.getElementById("filter-language");
const styleFilter = document.getElementById("filter-style");
const count = document.getElementById("template-count");
let builtIn = [];
let custom = [];

function readCustomTemplates() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(saved) ? saved.filter(item =>
            item && typeof item.name === "string" &&
            typeof item.line1 === "string" && typeof item.line2 === "string"
        ) : [];
    } catch {
        return [];
    }
}

function createCard(template, isCustom = false) {
    const card = document.createElement("article");
    card.className = "template-card";
    const header = document.createElement("div");
    header.className = "template-card-header";
    const title = document.createElement("h3");
    title.textContent = template.name;
    const type = document.createElement("span");
    type.className = "template-tag";
    type.textContent = template.category;
    header.append(title, type);

    const preview = document.createElement("div");
    preview.className = "template-mockup";
    const first = document.createElement("div");
    const second = document.createElement("div");
    renderMinecraftText(first, template.line1);
    renderMinecraftText(second, template.line2);
    preview.append(first, second);

    const description = document.createElement("p");
    description.className = "template-description";
    description.textContent = template.description;

    const metadata = document.createElement("div");
    metadata.className = "template-metadata";
    [template.language || "English", template.style || "Clean"].forEach(value => {
        const tag = document.createElement("span");
        tag.textContent = value;
        metadata.appendChild(tag);
    });

    const apply = document.createElement("button");
    apply.type = "button";
    apply.className = "template-apply";
    apply.textContent = "Use template";
    apply.addEventListener("click", () => {
        localStorage.setItem("motd-line-1", template.line1);
        localStorage.setItem("motd-line-2", template.line2);
        window.location.href = "index.html#editor";
    });
    card.append(header, preview, description, metadata, apply);

    if (isCustom) {
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "template-delete";
        remove.textContent = "Delete";
        remove.addEventListener("click", () => {
            custom = custom.filter(item => item.id !== template.id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
            render();
        });
        card.appendChild(remove);
    }
    return card;
}

function render() {
    const query = search.value.trim().toLocaleLowerCase();
    const category = categoryFilter.value;
    const language = languageFilter.value;
    const style = styleFilter.value;
    const all = [...builtIn, ...custom];
    const visible = all.filter(template => {
        const searchable = [template.name, template.description, template.category, template.language, template.style].join(" ").toLocaleLowerCase();
        return (category === "All" || template.category === category) &&
            (language === "All" || (template.language || "English") === language) &&
            (style === "All" || (template.style || "Clean") === style) &&
            searchable.includes(query);
    });
    count.textContent = all.length;
    grid.replaceChildren();
    if (!visible.length) {
        const empty = document.createElement("p");
        empty.className = "templates-empty";
        empty.textContent = "No templates match these filters. Try changing your filters or create your own below.";
        grid.appendChild(empty);
        return;
    }
    visible.forEach(template => grid.appendChild(createCard(template, custom.some(item => item.id === template.id))));
}

[search, categoryFilter, languageFilter, styleFilter].forEach(control => control.addEventListener("input", render));

document.getElementById("create-template-form").addEventListener("submit", event => {
    event.preventDefault();
    const template = {
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: document.getElementById("custom-name").value.trim(),
        language: document.getElementById("custom-language").value,
        category: document.getElementById("custom-category").value,
        style: document.getElementById("custom-style").value,
        description: document.getElementById("custom-description").value.trim(),
        line1: document.getElementById("custom-line-1").value,
        line2: document.getElementById("custom-line-2").value
    };
    if (!template.name || !template.language || !template.category || !template.style ||
        !template.description || !template.line1.trim() || !template.line2.trim()) return;
    custom.push(template);
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
        event.currentTarget.reset();
        document.getElementById("create-status").textContent = "Template saved in this browser.";
        render();
        document.getElementById("template-grid").scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
        custom.pop();
        document.getElementById("create-status").textContent = "Could not save. Your browser storage may be full.";
    }
});

async function initialize() {
    custom = readCustomTemplates();
    try {
        const response = await fetch("./presets/templates.json");
        if (!response.ok) throw new Error("Template list unavailable");
        builtIn = await response.json();
    } catch {
        builtIn = [];
        document.getElementById("create-status").textContent = "Built-in templates could not load. You can still create your own.";
    }
    render();
}
initialize();
