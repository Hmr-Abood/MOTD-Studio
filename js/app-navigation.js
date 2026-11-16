const main = document.querySelector(".main");
const testerView = document.getElementById("server-tester-view");
const testerFrame = testerView.querySelector("iframe");

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
        history.pushState({ view: showTester ? "server-tester" : "editor" }, "", showTester ? "/?view=server-tester" : "/");
    }
}

document.addEventListener("click", event => {
    const link = event.target.closest?.("[data-app-view]");
    if (!link) return;
    event.preventDefault();
    setView(link.dataset.appView);
}, true);

window.addEventListener("popstate", () => {
    setView(new URLSearchParams(location.search).get("view"), false);
});

setView(new URLSearchParams(location.search).get("view"), false);
