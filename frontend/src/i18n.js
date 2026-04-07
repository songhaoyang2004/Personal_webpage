const STORAGE_KEY = "personal-site-lang";

/** @type {Record<string, Record<string, string>>} */
const STRINGS = {
  zh: {
    docTitle: "昊洋 | 个人主页",
    loading: "加载中…",
    skip: "跳到主要内容",
    navLabel: "页面导航",
    navAbout: "关于",
    navEducation: "教育",
    navExperience: "实习",
    navProjects: "项目",
    navPublications: "论文",
    navCampus: "校园",
    navSkills: "技能",
    navContact: "联系",
    langGroup: "语言切换",
    langZh: "中文",
    langEn: "English",
    heroKicker: "你好，我是",
    heroContact: "联系我",
    heroProjects: "查看项目",
    portraitAlt: "{name}的个人照片",
    courseLinkTitle: "在新标签页打开课程介绍",
    companyLinkTitle: "在新标签页打开机构或公司简介",
    eduLinkTitle: "在新标签页打开学校或专业介绍",
    skillLinkTitle: "在新标签页打开技术介绍或官网",
    mapLinkTitle: "在 Google 地图中打开",
    sectionEducation: "教育背景",
    sectionExperience: "实习经验",
    sectionProjects: "项目经历",
    sectionPublications: "论文",
    sectionCampus: "校园经历",
    sectionSkills: "技能与语言",
    skillsSubtitle: "编程与技术",
    sectionContact: "联系方式",
    contactEmail: "邮箱",
    contactPhone: "电话",
    courseLabel: "相关课程",
    projectLink: "打开链接",
    pubEmpty: "暂无收录",
    errLoadResume: "无法加载简历数据",
    errGeneric:
      "加载失败。本地请运行 backend 与 npm run dev；分离部署请配置 VITE_API_URL。",
    errNetwork: "网络错误",
    copyEmail: "复制邮箱",
    copied: "已复制",
    backToTop: "回到顶部",
  },
  en: {
    docTitle: "Haoyang | Personal site",
    loading: "Loading…",
    skip: "Skip to main content",
    navLabel: "Page navigation",
    navAbout: "About",
    navEducation: "Education",
    navExperience: "Experience",
    navProjects: "Projects",
    navPublications: "Publications",
    navCampus: "Campus",
    navSkills: "Skills",
    navContact: "Contact",
    langGroup: "Language",
    langZh: "中文",
    langEn: "English",
    heroKicker: "Hi, I'm",
    heroContact: "Contact me",
    heroProjects: "View projects",
    portraitAlt: "Portrait of {name}",
    courseLinkTitle: "Open course overview in a new tab",
    companyLinkTitle: "Open organization or company site in a new tab",
    eduLinkTitle: "Open school or programme page in a new tab",
    skillLinkTitle: "Open documentation or official site in a new tab",
    mapLinkTitle: "Open in Google Maps",
    sectionEducation: "Education",
    sectionExperience: "Internships",
    sectionProjects: "Projects",
    sectionPublications: "Publications",
    sectionCampus: "Campus",
    sectionSkills: "Skills & languages",
    skillsSubtitle: "Programming & tools",
    sectionContact: "Contact",
    contactEmail: "Email",
    contactPhone: "Phone",
    courseLabel: "Relevant coursework",
    projectLink: "Open link",
    pubEmpty: "None listed.",
    errLoadResume: "Could not load profile data.",
    errGeneric:
      "Load failed. Run backend + npm run dev locally, or set VITE_API_URL for split deploy.",
    errNetwork: "Network error",
    copyEmail: "Copy email",
    copied: "Copied",
    backToTop: "Back to top",
  },
};

export function getLang() {
  const v = localStorage.getItem(STORAGE_KEY);
  return v === "en" ? "en" : "zh";
}

export function setLang(lang) {
  localStorage.setItem(STORAGE_KEY, lang === "en" ? "en" : "zh");
}

/** @param {string} key */
export function t(key) {
  const l = getLang();
  const pack = STRINGS[l] || STRINGS.zh;
  return pack[key] ?? STRINGS.zh[key] ?? key;
}

export function applyDocumentLang() {
  const l = getLang();
  document.documentElement.lang = l === "en" ? "en" : "zh-CN";
  document.title = t("docTitle");
}

/**
 * @param {(() => void | Promise<void>) | undefined} onChange 切换语言后刷新界面（可异步拉取简历）
 */
export function bindLangSwitch(onChange) {
  const group = document.querySelector(".lang-switch");
  if (!group) return;

  const zhBtn = group.querySelector('[data-lang="zh"]');
  const enBtn = group.querySelector('[data-lang="en"]');

  function syncPressed() {
    const l = getLang();
    if (zhBtn) {
      zhBtn.setAttribute("aria-pressed", l === "zh" ? "true" : "false");
    }
    if (enBtn) {
      enBtn.setAttribute("aria-pressed", l === "en" ? "true" : "false");
    }
  }

  async function onPick(lang) {
    setLang(lang);
    applyDocumentLang();
    await onChange?.();
    syncPressed();
  }

  zhBtn?.addEventListener("click", () => void onPick("zh"));
  enBtn?.addEventListener("click", () => void onPick("en"));
  syncPressed();
}
