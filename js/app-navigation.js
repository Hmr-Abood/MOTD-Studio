const main = document.querySelector(".main");
const editorLink = document.querySelector('[data-app-view="editor"]');
const testerLink = document.querySelector('[data-app-view="server-tester"]');
const testerView = document.getElementById("server-tester-view");

function setView(view, updateUrl = true) {
    const showTester = view === "server-tester";
    main.classList.toggle("is-tool-view", showTester);
    testerView.hidden = !showTester;
    document.querySelectorAll("[data-app-view]").forEach(link => {
        const active = link.dataset.appView === (showTester ? "server-tester" : "editor");
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
    });

    document.title = showTester ? "Server Tester | MOTD Studio" : "MOTD Studio";
    if (updateUrl) {
        const url = showTester ? "/?view=server-tester" : "/";
        history.pushState({ view: showTester ? "server-tester" : "editor" }, "", url);
    }
}

editorLink.addEventListener("click", event => {
    event.preventDefault();
    setView("editor");
});

testerLink.addEventListener("click", event => {
    event.preventDefault();
    setView("server-tester");
});

window.addEventListener("popstate", () => {
    setView(new URLSearchParams(location.search).get("view"), false);
});

setView(new URLSearchParams(location.search).get("view"), false);
