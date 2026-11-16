import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./supabase-config.js";
import { renderMinecraftText } from "./colors.js";

const grid = document.getElementById("template-grid");
const search = document.getElementById("template-search");
const categoryFilter = document.getElementById("filter-category");
const languageFilter = document.getElementById("filter-language");
const styleFilter = document.getElementById("filter-style");
const count = document.getElementById("template-count");
const authForm = document.getElementById("community-auth-form");
const authStatus = document.getElementById("auth-status");
const accountState = document.getElementById("account-state");
const signInButton = document.getElementById("sign-in-button");
const signUpButton = document.getElementById("sign-up-button");
const signOutButton = document.getElementById("sign-out-button");
const forgotPasswordButton = document.getElementById("forgot-password-button");
const passwordResetForm = document.getElementById("password-reset-form");
const saveNewPasswordButton = document.getElementById("save-new-password-button");
const submitButton = document.getElementById("submit-template-button");
const createForm = document.getElementById("create-template-form");
const createStatus = document.getElementById("create-status");

let builtIn = [];
let community = [];
let currentUser = null;
let isAdmin = false;
let supabase = null;

function setMessage(element, message, isError = false) {
    element.textContent = message;
    element.classList.toggle("message-error", isError);
}

function createCard(template) {
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
    description.textContent = template.description || "";

    const metadata = document.createElement("div");
    metadata.className = "template-metadata";
    [template.language || "English", template.style || "Clean"].forEach(value => {
        const tag = document.createElement("span");
        tag.textContent = value;
        metadata.appendChild(tag);
    });

    const actions = document.createElement("div");
    actions.className = "template-card-actions";
    const apply = document.createElement("button");
    apply.type = "button";
    apply.className = "template-apply";
    apply.textContent = "Use template";
    apply.addEventListener("click", () => {
        localStorage.setItem("motd-line-1", template.line1);
        localStorage.setItem("motd-line-2", template.line2);
        window.location.href = "index.html#editor";
    });
    actions.appendChild(apply);

    if (template.status && template.status !== "approved") {
        const status = document.createElement("span");
        status.className = "template-review-status";
        status.textContent = template.status === "pending" ? "Pending review" : "Rejected";
        actions.appendChild(status);
    }
    if (template.id && isAdmin) {
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "template-delete";
        remove.textContent = "Delete";
        remove.setAttribute("aria-label", `Delete template: ${template.name}`);
        remove.addEventListener("click", async () => {
            if (!window.confirm(`Permanently delete "${template.name}"? This cannot be undone.`)) return;
            remove.disabled = true;
            const { error } = await supabase.from("motd_templates").delete().eq("id", template.id);
            if (error) {
                remove.disabled = false;
                setMessage(authStatus, "Could not delete this template. Check your moderator permissions.", true);
            } else {
                community = community.filter(item => item.id !== template.id);
                setMessage(authStatus, "Template deleted.");
                render();
            }
        });
        actions.appendChild(remove);
    } else if (template.id && template.status === "pending" && currentUser?.id === template.author_id) {
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "template-delete";
        remove.textContent = "Withdraw";
        remove.addEventListener("click", async () => {
            if (!window.confirm("Withdraw this pending submission?")) return;
            const { error } = await supabase.from("motd_templates").delete().eq("id", template.id);
            if (error) setMessage(createStatus, "Could not withdraw this submission.", true);
            else {
                community = community.filter(item => item.id !== template.id);
                render();
            }
        });
        actions.appendChild(remove);
    }
    if (isAdmin && template.id && template.status === "pending") {
        const approve = document.createElement("button");
        approve.type = "button";
        approve.className = "template-review-button";
        approve.textContent = "Approve";
        approve.addEventListener("click", () => reviewTemplate(template.id, "approved"));
        const reject = document.createElement("button");
        reject.type = "button";
        reject.className = "template-review-button reject";
        reject.textContent = "Reject";
        reject.addEventListener("click", () => reviewTemplate(template.id, "rejected"));
        actions.append(approve, reject);
    }

    card.append(header, preview, description, metadata, actions);
    return card;
}

async function reviewTemplate(id, status) {
    const { error } = await supabase.from("motd_templates").update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: currentUser.id
    }).eq("id", id);
    if (error) {
        setMessage(authStatus, "Review action failed. Check your admin permissions.", true);
        return;
    }
    await loadCommunityTemplates();
}

function render() {
    const query = search.value.trim().toLocaleLowerCase();
    const category = categoryFilter.value;
    const language = languageFilter.value;
    const style = styleFilter.value;
    const all = [...builtIn, ...community];
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
        empty.textContent = "No templates match these filters.";
        grid.appendChild(empty);
        return;
    }
    visible.forEach(template => grid.appendChild(createCard(template)));
}

async function loadCommunityTemplates() {
    if (!supabase) return;
    const { data, error } = await supabase
        .from("motd_templates")
        .select("id,name,description,line1,line2,language,category,style,status,author_id,created_at")
        .order("created_at", { ascending: false })
        .limit(250);
    if (error) {
        setMessage(authStatus, "Community library could not load. Check your Supabase setup.", true);
        community = [];
    } else {
        community = data || [];
    }
    render();
}

async function refreshSession() {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    currentUser = data.session?.user || null;
    isAdmin = false;
    if (currentUser) {
        const { data: adminResult } = await supabase.rpc("is_motd_admin");
        isAdmin = adminResult === true;
    }
    const signedIn = Boolean(currentUser);
    signInButton.hidden = signedIn;
    signUpButton.hidden = signedIn;
    signOutButton.hidden = !signedIn;
    forgotPasswordButton.hidden = signedIn;
    document.getElementById("community-email").disabled = signedIn;
    document.getElementById("community-password").disabled = signedIn;
    accountState.textContent = signedIn
        ? `Signed in as ${currentUser.email}${isAdmin ? " · Administrator" : ""}`
        : "Not signed in.";
    submitButton.disabled = !signedIn;
    createStatus.textContent = signedIn
        ? "Your template will be reviewed before public listing."
        : "Sign in above to submit a template.";
    await loadCommunityTemplates();
}

async function initialize() {
    const response = await fetch("./presets/templates.json");
    if (response.ok) builtIn = await response.json();

    [search, categoryFilter, languageFilter, styleFilter].forEach(control => control.addEventListener("input", render));

    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY ||
        SUPABASE_URL.includes("YOUR_SUPABASE") ||
        SUPABASE_PUBLISHABLE_KEY.includes("YOUR_SUPABASE")) {
        setMessage(authStatus, "Community publishing is not connected yet. Add your Supabase project URL and publishable key to js/supabase-config.js.", true);
        submitButton.disabled = true;
        render();
        return;
    }

    supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

    authForm.addEventListener("submit", async event => {
        event.preventDefault();
        const email = document.getElementById("community-email").value.trim();
        const password = document.getElementById("community-password").value;
        signInButton.disabled = true;
        setMessage(authStatus, "Signing in...");
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        signInButton.disabled = false;
        if (error) setMessage(authStatus, error.message, true);
        else {
            setMessage(authStatus, "Signed in.");
            await refreshSession();
        }
    });

    signUpButton.addEventListener("click", async () => {
        const email = document.getElementById("community-email").value.trim();
        const password = document.getElementById("community-password").value;
        if (!email || password.length < 8) {
            setMessage(authStatus, "Enter a valid email and a password with at least 8 characters.", true);
            return;
        }
        signUpButton.disabled = true;
        setMessage(authStatus, "Creating account...");
        const { data, error } = await supabase.auth.signUp({ email, password });
        signUpButton.disabled = false;
        if (error) setMessage(authStatus, error.message, true);
        else if (!data.session) setMessage(authStatus, "Check your email to confirm your account, then sign in.");
        else {
            setMessage(authStatus, "Account created.");
            await refreshSession();
        }
    });

    forgotPasswordButton.addEventListener("click", async () => {
        const email = document.getElementById("community-email").value.trim();
        if (!email) {
            setMessage(authStatus, "Enter your account email first.", true);
            document.getElementById("community-email").focus();
            return;
        }
        forgotPasswordButton.disabled = true;
        setMessage(authStatus, "Sending password reset email...");
        try {
            const redirectTo = new URL("templates.html?reset=true", window.location.href).toString();
            const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
            if (error) {
                console.error("Password reset request failed:", error);
                setMessage(authStatus, error.message || "Could not send the reset email. Please try again.", true);
            } else {
                setMessage(authStatus, "If an account exists for that email, a password reset link has been sent.");
            }
        } catch (error) {
            console.error("Password reset request failed:", error);
            setMessage(authStatus, error.message || "Could not connect to the password reset service. Please try again.", true);
        } finally {
            forgotPasswordButton.disabled = false;
        }
    });

    passwordResetForm.addEventListener("submit", async event => {
        event.preventDefault();
        const password = document.getElementById("new-password").value;
        const confirmation = document.getElementById("confirm-new-password").value;
        if (password.length < 8) {
            setMessage(authStatus, "Your new password must contain at least 8 characters.", true);
            return;
        }
        if (password !== confirmation) {
            setMessage(authStatus, "The passwords do not match.", true);
            return;
        }
        saveNewPasswordButton.disabled = true;
        setMessage(authStatus, "Updating password...");
        const { error } = await supabase.auth.updateUser({ password });
        saveNewPasswordButton.disabled = false;
        if (error) {
            setMessage(authStatus, "Could not update your password. Open the latest reset email and try again.", true);
        } else {
            passwordResetForm.hidden = true;
            passwordResetForm.reset();
            setMessage(authStatus, "Password updated. You can now use your new password.");
            await refreshSession();
        }
    });

    signOutButton.addEventListener("click", async () => {
        const { error } = await supabase.auth.signOut();
        if (error) setMessage(authStatus, error.message, true);
        else {
            setMessage(authStatus, "Signed out.");
            await refreshSession();
        }
    });

    createForm.addEventListener("submit", async event => {
        event.preventDefault();
        if (!currentUser) {
            setMessage(createStatus, "Sign in before submitting a template.", true);
            return;
        }
        const template = {
            name: document.getElementById("custom-name").value.trim(),
            language: document.getElementById("custom-language").value,
            category: document.getElementById("custom-category").value,
            style: document.getElementById("custom-style").value,
            description: document.getElementById("custom-description").value.trim(),
            line1: document.getElementById("custom-line-1").value,
            line2: document.getElementById("custom-line-2").value,
            author_id: currentUser.id
        };
        if (!template.name || !template.language || !template.category || !template.style ||
            !template.description || !template.line1.trim() || !template.line2.trim()) return;
        submitButton.disabled = true;
        setMessage(createStatus, "Submitting for review...");
        const { error } = await supabase.from("motd_templates").insert(template);
        submitButton.disabled = false;
        if (error) {
            setMessage(createStatus, error.message.includes("submission limit")
                ? "You have reached the submission limit. Try again later."
                : "Submission failed. Check your fields and try again.", true);
            return;
        }
        createForm.reset();
        setMessage(createStatus, "Submitted. Your MOTD is now waiting for review.");
        await loadCommunityTemplates();
    });

    supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
            passwordResetForm.hidden = false;
            document.getElementById("new-password").focus();
            setMessage(authStatus, "Choose a new password for your account.");
        }
        window.setTimeout(refreshSession, 0);
    });
    await refreshSession();
}

initialize().catch(error => {
    setMessage(authStatus, "Could not initialize the template library. Check your connection and configuration.", true);
    console.error(error);
});
