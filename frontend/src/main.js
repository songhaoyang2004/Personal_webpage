import "./style.css";
import { t, applyDocumentLang, bindLangSwitch, getLang } from "./i18n.js";

const $ = (sel, root = document) => root.querySelector(sel);

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

/** 与 vite.config.js 中 BACKEND 一致：本机简历 API（用于无代理的静态访问时回退） */
const LOCAL_RESUME_ORIGIN = "http://127.0.0.1:18080";

function apiUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${p}` : p;
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

/** @param {string} titleKey i18n key for link title */
function formatEduOutboundLink(text, url, className, titleKey) {
  const u = (url || "").trim();
  if (!u) return escapeHtml(text);
  const title = escapeHtml(t(titleKey));
  return `<a class="${className}" href="${escapeHtml(u)}" target="_blank" rel="noopener noreferrer" title="${title}">${escapeHtml(text)}</a>`;
}

/** @param {string | { name: string; url: string }} s */
function formatSkillTag(s) {
  if (typeof s === "string") {
    return `<span class="skill-tag" tabindex="0">${escapeHtml(s)}</span>`;
  }
  const name = s.name ?? "";
  const url = (s.url || "").trim();
  if (!url) {
    return `<span class="skill-tag" tabindex="0">${escapeHtml(name)}</span>`;
  }
  const title = escapeHtml(t("skillLinkTitle"));
  return `<a class="skill-tag skill-tag-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" title="${title}">${escapeHtml(name)}</a>`;
}

/** @param {string | { name: string; url?: string }} c */
function formatCourseLi(c) {
  if (typeof c === "string") {
    return `<li>${escapeHtml(c)}</li>`;
  }
  const name = c.name ?? "";
  const url = (c.url || "").trim();
  if (url) {
    const title = escapeHtml(t("courseLinkTitle"));
    return `<li><a class="course-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" title="${title}">${escapeHtml(name)}</a></li>`;
  }
  return `<li>${escapeHtml(name)}</li>`;
}

let lastResume = null;

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
  ];
  for (const [id, key] of map) {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  }
  const backTop = $("#back-top");
  if (backTop) {
    backTop.setAttribute("aria-label", t("backToTop"));
    backTop.title = t("backToTop");
  }
}

function _isLocalBrowserHost() {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
}

/** 公网 IPv4 访问时，若 80 口只有静态页、简历 API 在同机 8000（见 deploy 里 gunicorn 端口），可自动回退 */
function _isIPv4Host(hostname) {
  return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
}

async function fetchResume() {
  const lang = getLang();
  const q = lang === "en" ? "?lang=en" : "?lang=zh";
  const path = `/api/resume${q}`;
  const urls = [];
  if (API_BASE) {
    urls.push(`${API_BASE}${path}`);
  } else {
    urls.push(apiUrl(path));
    if (_isLocalBrowserHost()) {
      urls.push(`${LOCAL_RESUME_ORIGIN}${path}`);
    } else if (typeof window !== "undefined" && _isIPv4Host(window.location.hostname)) {
      const p = window.location.protocol;
      const h = window.location.hostname;
      urls.push(`${p}//${h}:8000${path}`);
    }
  }
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) return res.json();
    } catch {
      /* 继续尝试下一地址（如无代理的静态页会先失败） */
    }
  }
  throw new Error(t("errLoadResume"));
}

function renderResume(data) {
  lastResume = data;
  $("#nav-name").textContent = data.name;
  $("#hero-title").textContent = data.name;
  $("#hero-tagline").textContent = data.tagline || "";
  const locEl = $("#hero-location");
  if (locEl) {
    const loc = data.location || "";
    const mapUrl = (data.location_url || "").trim();
    if (mapUrl) {
      const mapTitle = escapeHtml(t("mapLinkTitle"));
      locEl.innerHTML = `<a class="hero-location-link" href="${escapeHtml(mapUrl)}" target="_blank" rel="noopener noreferrer" title="${mapTitle}">${escapeHtml(loc)}</a>`;
    } else {
      locEl.textContent = loc;
    }
  }
  $("#footer-name").textContent = data.name;
  $("#year").textContent = String(new Date().getFullYear());
  $("#language-block").textContent = data.language || "";

  const heroPhoto = $("#hero-photo");
  if (heroPhoto) {
    heroPhoto.alt = t("portraitAlt").replaceAll("{name}", data.name || "");
  }

  const contactEl = $("#contact-cards");
  const email = data.email;
  const phone = data.phone;
  let cards = `
    <div class="contact-row">
      <a class="contact-card contact-card-grow" href="mailto:${encodeURIComponent(email)}">
        <span class="contact-label">${escapeHtml(t("contactEmail"))}</span>
        <span class="contact-value">${escapeHtml(email)}</span>
      </a>
      <button type="button" class="btn btn-ghost btn-copy-email" data-copy="${escapeHtml(email)}" aria-label="${escapeHtml(t("copyEmail"))}">
        ${escapeHtml(t("copyEmail"))}
      </button>
    </div>`;
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
        ? `<ul class="course-list">${e.courses.map((c) => formatCourseLi(c)).join("")}</ul>`
        : "";
      const courseBlock = courses
        ? `<p class="course-label">${escapeHtml(t("courseLabel"))}</p>${courses}`
        : "";
      const schoolHtml = formatEduOutboundLink(
        e.school,
        e.school_url,
        "edu-outbound-link edu-school-link",
        "eduLinkTitle"
      );
      const degreeHtml = formatEduOutboundLink(
        e.degree,
        e.degree_url,
        "edu-outbound-link edu-degree-link",
        "eduLinkTitle"
      );
      return `
      <li class="card-interactive">
        <h3>${schoolHtml}</h3>
        <p class="meta">${degreeHtml}</p>
        <p class="place-line">${escapeHtml(e.place)} · ${escapeHtml(e.time)}</p>
        ${courseBlock}
      </li>`;
    })
    .join("");

  const expEl = $("#experience-list");
  expEl.innerHTML = data.experience
    .map((x) => {
      const items = x.description.map((d) => `<li>${escapeHtml(d)}</li>`).join("");
      const cu = (x.company_url || "").trim();
      const companyTitle = escapeHtml(t("companyLinkTitle"));
      const companyHeading = cu
        ? `<h3><a class="company-intro-link" href="${escapeHtml(cu)}" target="_blank" rel="noopener noreferrer" title="${companyTitle}">${escapeHtml(x.company)}</a></h3>`
        : `<h3>${escapeHtml(x.company)}</h3>`;
      return `
      <li class="card-interactive">
        <span class="time">${escapeHtml(x.time)}</span>
        ${companyHeading}
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
      <li class="card-interactive project-card">
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
      .map((x) => `<li class="card-interactive">${escapeHtml(x)}</li>`)
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
        <li class="card-interactive">
          <span class="time">${escapeHtml(c.time)}</span>
          <h3>${escapeHtml(c.org)}</h3>
          <p class="role">${escapeHtml(c.role)}</p>
          <ul>${items}</ul>
        </li>`;
      })
      .join("");
  }

  const skillsEl = $("#skills-list");
  skillsEl.innerHTML = (data.skills || []).map((s) => formatSkillTag(s)).join("");
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

async function refreshAfterLangChange() {
  applyStaticStrings();
  $("#nav-name").textContent = t("loading");
  try {
    const data = await fetchResume();
    renderResume(data);
    setupNavScrollSpy();
  } catch (e) {
    showError(e.message || t("errGeneric"));
  }
}

function setupContactCopyDelegation() {
  $("#contact-cards")?.addEventListener("click", async (ev) => {
    const btn = ev.target.closest(".btn-copy-email");
    if (!btn || !$("#contact-cards")?.contains(btn)) return;
    const text = btn.getAttribute("data-copy") || "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      const prev = btn.textContent;
      btn.textContent = t("copied");
      setTimeout(() => {
        btn.textContent = prev;
      }, 1600);
    } catch {
      btn.textContent = t("errNetwork");
      setTimeout(() => {
        btn.textContent = t("copyEmail");
      }, 1600);
    }
  });
}

function setupBackToTop() {
  const btn = $("#back-top");
  if (!btn) return;
  const toggle = () => {
    if (window.scrollY > 480) btn.hidden = false;
    else btn.hidden = true;
  };
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

let navScrollObserver = null;

function setupNavScrollSpy() {
  const nav = $("#i18n-nav");
  if (!nav) return;
  if (navScrollObserver) {
    navScrollObserver.disconnect();
    navScrollObserver = null;
  }
  const links = [...nav.querySelectorAll("a[href^='#']")];
  const ids = links.map((a) => a.getAttribute("href")?.slice(1)).filter(Boolean);
  const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
  if (!sections.length) return;

  navScrollObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible?.target?.id) return;
      const id = visible.target.id;
      links.forEach((a) => {
        const on = a.getAttribute("href") === `#${id}`;
        a.classList.toggle("nav-active", on);
        if (on) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-40% 0px -45% 0px", threshold: [0, 0.1, 0.25, 0.5, 1] }
  );
  sections.forEach((s) => navScrollObserver.observe(s));
}

applyStaticStrings();
bindLangSwitch(refreshAfterLangChange);
$("#nav-name").textContent = t("loading");
setupContactCopyDelegation();
setupBackToTop();

(async function init() {
  try {
    const data = await fetchResume();
    renderResume(data);
    setupNavScrollSpy();
  } catch (e) {
    showError(e.message || t("errGeneric"));
  }
})();
