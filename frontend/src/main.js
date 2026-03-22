import "./style.css";
import { t, applyDocumentLang, bindLangSwitch } from "./i18n.js";

const $ = (sel, root = document) => root.querySelector(sel);

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function apiUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${p}` : p;
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

let lastResume = null;
let lastMessages = null;

function applyStaticStrings() {
  applyDocumentLang();
  const skip = $("#i18n-skip");
  if (skip) skip.textContent = t("skip");
  const nav = $("#i18n-nav");
  if (nav) nav.setAttribute("aria-label", t("navLabel"));
  const lg = document.querySelector(".lang-switch");
  if (lg) lg.setAttribute("aria-label", t("langGroup"));

  const map = [
    ["nav-about", "navAbout"],
    ["nav-education", "navEducation"],
    ["nav-experience", "navExperience"],
    ["nav-projects", "navProjects"],
    ["nav-publications", "navPublications"],
    ["nav-campus", "navCampus"],
    ["nav-skills", "navSkills"],
    ["nav-contact", "navContact"],
    ["nav-guestbook", "navGuestbook"],
    ["i18n-hero-kicker", "heroKicker"],
    ["i18n-btn-contact", "heroContact"],
    ["i18n-btn-projects", "heroProjects"],
    ["st-education", "sectionEducation"],
    ["st-experience", "sectionExperience"],
    ["st-projects", "sectionProjects"],
    ["st-publications", "sectionPublications"],
    ["st-campus", "sectionCampus"],
    ["st-skills", "sectionSkills"],
    ["st-skills-sub", "skillsSubtitle"],
    ["st-contact", "sectionContact"],
    ["st-guestbook", "sectionGuestbook"],
    ["guestbook-lead", "guestbookLead"],
    ["lbl-name", "labelName"],
    ["lbl-content", "labelContent"],
    ["i18n-btn-send", "btnSend"],
  ];
  for (const [id, key] of map) {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  }
  const inpName = $("#inp-name");
  const inpContent = $("#inp-content");
  if (inpName) inpName.placeholder = t("phName");
  if (inpContent) inpContent.placeholder = t("phContent");
}

function refreshAfterLangChange() {
  applyStaticStrings();
  if (lastResume) renderResume(lastResume);
  if (lastMessages !== null) renderMessages(lastMessages);
}

async function fetchResume() {
  const res = await fetch(apiUrl("/api/resume"));
  if (!res.ok) throw new Error(t("errLoadResume"));
  return res.json();
}

async function fetchMessages() {
  const res = await fetch(apiUrl("/api/message"));
  if (!res.ok) throw new Error(t("errLoadMsg"));
  return res.json();
}

function renderResume(data) {
  lastResume = data;
  $("#nav-name").textContent = data.name;
  $("#hero-title").textContent = data.name;
  $("#hero-tagline").textContent = data.tagline || "";
  $("#hero-location").textContent = data.location;
  $("#footer-name").textContent = data.name;
  $("#year").textContent = String(new Date().getFullYear());
  $("#language-block").textContent = data.language || "";

  const contactEl = $("#contact-cards");
  const email = data.email;
  const phone = data.phone;
  let cards = `
    <a class="contact-card" href="mailto:${encodeURIComponent(email)}">
      <span class="contact-label">${escapeHtml(t("contactEmail"))}</span>
      <span class="contact-value">${escapeHtml(email)}</span>
    </a>`;
  if (phone) {
    cards += `
    <a class="contact-card" href="tel:${String(phone).replace(/\s/g, "")}">
      <span class="contact-label">${escapeHtml(t("contactPhone"))}</span>
      <span class="contact-value">${escapeHtml(phone)}</span>
    </a>`;
  }
  contactEl.innerHTML = cards;

  const eduEl = $("#education-list");
  eduEl.innerHTML = data.education
    .map((e) => {
      const courses = (e.courses || []).length
        ? `<ul class="course-list">${e.courses.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}</ul>`
        : "";
      const courseBlock = courses
        ? `<p class="course-label">${escapeHtml(t("courseLabel"))}</p>${courses}`
        : "";
      return `
      <li>
        <h3>${escapeHtml(e.school)}</h3>
        <p class="meta">${escapeHtml(e.degree)}</p>
        <p class="place-line">${escapeHtml(e.place)} · ${escapeHtml(e.time)}</p>
        ${courseBlock}
      </li>`;
    })
    .join("");

  const expEl = $("#experience-list");
  expEl.innerHTML = data.experience
    .map((x) => {
      const items = x.description.map((d) => `<li>${escapeHtml(d)}</li>`).join("");
      return `
      <li>
        <span class="time">${escapeHtml(x.time)}</span>
        <h3>${escapeHtml(x.company)}</h3>
        <p class="role">${escapeHtml(x.role)}</p>
        <ul>${items}</ul>
      </li>`;
    })
    .join("");

  const projEl = $("#projects-list");
  projEl.innerHTML = data.projects
    .map((p) => {
      const bullets = p.description.map((d) => `<li>${escapeHtml(d)}</li>`).join("");
      const meta = [p.role, p.period].filter(Boolean).join(" · ");
      const metaHtml = meta ? `<p class="project-meta">${escapeHtml(meta)}</p>` : "";
      const link = p.link
        ? `<a class="project-link" href="${escapeHtml(p.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("projectLink"))}</a>`
        : "";
      return `
      <li>
        <h3>${escapeHtml(p.name)}</h3>
        ${metaHtml}
        <ul>${bullets}</ul>
        ${link}
      </li>`;
    })
    .join("");

  const pubEl = $("#publications-list");
  if (!data.publications || data.publications.length === 0) {
    pubEl.innerHTML = `<li class="muted-item">${escapeHtml(t("pubEmpty"))}</li>`;
  } else {
    pubEl.innerHTML = data.publications
      .map((x) => `<li>${escapeHtml(x)}</li>`)
      .join("");
  }

  const campusEl = $("#campus-list");
  if (!data.campus || data.campus.length === 0) {
    campusEl.innerHTML = "";
  } else {
    campusEl.innerHTML = data.campus
      .map((c) => {
        const items = c.description.map((d) => `<li>${escapeHtml(d)}</li>`).join("");
        return `
        <li>
          <span class="time">${escapeHtml(c.time)}</span>
          <h3>${escapeHtml(c.org)}</h3>
          <p class="role">${escapeHtml(c.role)}</p>
          <ul>${items}</ul>
        </li>`;
      })
      .join("");
  }

  const skillsEl = $("#skills-list");
  skillsEl.innerHTML = data.skills.map((s) => `<span>${escapeHtml(s)}</span>`).join("");
}

function renderMessages(list) {
  lastMessages = list;
  const el = $("#messages-list");
  if (!list || list.length === 0) {
    el.innerHTML = `<li class="content" style="border-style:dashed;opacity:.7">${escapeHtml(t("msgEmpty"))}</li>`;
    return;
  }
  el.innerHTML = list
    .slice()
    .reverse()
    .map(
      (m) => `
      <li>
        <div class="author">${escapeHtml(m.name)}</div>
        <p class="content">${escapeHtml(m.content)}</p>
      </li>`
    )
    .join("");
}

function showError(msg) {
  const main = $("#main");
  const old = main.querySelector(".error-banner");
  old?.remove();
  const banner = document.createElement("div");
  banner.className = "error-banner";
  banner.setAttribute("role", "alert");
  banner.textContent = msg;
  main.insertBefore(banner, main.firstChild);
}

applyStaticStrings();
bindLangSwitch(refreshAfterLangChange);
$("#nav-name").textContent = t("loading");

$("#message-form").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const form = ev.target;
  const status = $("#form-status");
  const fd = new FormData(form);
  const name = String(fd.get("name") || "").trim();
  const content = String(fd.get("content") || "").trim();
  status.textContent = "";
  try {
    const res = await fetch(apiUrl("/api/message"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, content }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const detail = body.detail;
      const msg =
        Array.isArray(detail) && detail[0]?.msg
          ? detail[0].msg
          : typeof detail === "string"
            ? detail
            : t("errSubmit");
      throw new Error(msg);
    }
    status.textContent = t("sentOk");
    form.reset();
    if ($("#inp-name")) $("#inp-name").placeholder = t("phName");
    if ($("#inp-content")) $("#inp-content").placeholder = t("phContent");
    const messages = await fetchMessages();
    renderMessages(messages);
  } catch (e) {
    status.textContent = e.message || t("errNetwork");
  }
});

(async function init() {
  try {
    const data = await fetchResume();
    renderResume(data);
    const messages = await fetchMessages();
    renderMessages(messages);
  } catch (e) {
    showError(e.message || t("errGeneric"));
  }
})();
