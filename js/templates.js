import { applyTemplate } from "./editor.js";
import { renderMinecraftText } from "./colors.js";

export async function initializeTemplates() {
    const grid = document.getElementById("template-grid");
    const search = document.getElementById("template-search");
    const filters = document.getElementById("template-filters");
    let templates = [];
    let activeFilter = "All";

    try {
        const response = await fetch("./presets/templates.json");
        if (!response.ok) throw new Error("Could not load templates.");
        templates = await response.json();
    } catch (error) {
        grid.textContent = "Templates could not be loaded. Refresh the page to try again.";
        return;
    }

    function render() {
        const query = search.value.trim().toLowerCase();
        const visible = templates.filter(template => {
            const matchesFilter = activeFilter === "All" || template.category === activeFilter;
            const matchesSearch = `${template.name} ${template.description} ${template.category}`.toLowerCase().includes(query);
            return matchesFilter && matchesSearch;
        });

        grid.replaceChildren();

        if (!visible.length) {
            const empty = document.createElement("p");
            empty.className = "templates-empty";
            empty.textContent = "No templates found.";
            grid.appendChild(empty);
            return;
        }

        visible.forEach(template => {
            const card = document.createElement("article");
            card.className = "template-card";

            const top = document.createElement("div");
            top.className = "template-card-top";

            const title = document.createElement("h3");
            title.textContent = template.name;

            const category = document.createElement("span");
            category.className = "template-category";
            category.textContent = template.category;

            top.append(title, category);

            const mockup = document.createElement("div");
            mockup.className = "template-mockup";
            const first = document.createElement("div");
            const second = document.createElement("div");
            renderMinecraftText(first, template.line1);
            renderMinecraftText(second, template.line2);
            mockup.append(first, second);

            const description = document.createElement("p");
            description.className = "template-description";
            description.textContent = template.description;

            const button = document.createElement("button");
            button.type = "button";
            button.className = "template-apply";
            button.textContent = "Use Template";
            button.addEventListener("click", () => {
                applyTemplate(template.line1, template.line2);
                document.getElementById("editor").scrollIntoView({ behavior: "smooth", block: "start" });
                button.textContent = "Applied";
                window.setTimeout(() => { button.textContent = "Use Template"; }, 1400);
            });

            card.append(top, mockup, description, button);
            grid.appendChild(card);
        });
    }

    search.addEventListener("input", render);

    filters.querySelectorAll("[data-filter]").forEach(button => {
        button.addEventListener("click", () => {
            activeFilter = button.dataset.filter;
            filters.querySelectorAll("[data-filter]").forEach(item => {
                item.classList.toggle("active", item === button);
            });
            render();
        });
    });

    render();
}
