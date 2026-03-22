const STORAGE_KEY = "personal-site-lang";

/** @type {Record<string, Record<string, string>>} */
const STRINGS = {
  zh: {
    docTitle: "宋昊洋 | 个人主页",
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
    navGuestbook: "留言",
    langGroup: "语言切换",
    langZh: "中文",
    langEn: "English",
    heroKicker: "你好，我是",
    heroContact: "联系我",
    heroProjects: "查看项目",
    sectionEducation: "教育背景",
    sectionExperience: "实习经验",
    sectionProjects: "项目经历",
    sectionPublications: "论文",
    sectionCampus: "校园经历",
    sectionSkills: "技能与语言",
    skillsSubtitle: "编程与技术",
    sectionContact: "联系方式",
    sectionGuestbook: "留言板",
    guestbookLead:
      "欢迎留言（数据保存在服务器内存中，重启后可能清空）",
    labelName: "称呼",
    labelContent: "内容",
    phName: "怎么称呼你",
    phContent: "想说点什么…",
    btnSend: "发送留言",
    contactEmail: "邮箱",
    contactPhone: "电话",
    courseLabel: "相关课程",
    projectLink: "打开链接",
    pubEmpty: "暂无收录",
    msgEmpty: "暂无留言，来做第一个吧。",
    errLoadResume: "无法加载简历数据",
    errLoadMsg: "无法加载留言",
    errGeneric:
      "加载失败。本地请运行 backend 与 npm run dev；分离部署请配置 VITE_API_URL。",
    errNetwork: "网络错误",
    errSubmit: "提交失败",
    sentOk: "已发送",
  },
  en: {
    docTitle: "Song Haoyang | Personal site",
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
    navGuestbook: "Guestbook",
    langGroup: "Language",
    langZh: "中文",
    langEn: "English",
    heroKicker: "Hi, I'm",
    heroContact: "Contact me",
    heroProjects: "View projects",
    sectionEducation: "Education",
    sectionExperience: "Internships",
    sectionProjects: "Projects",
    sectionPublications: "Publications",
    sectionCampus: "Campus",
    sectionSkills: "Skills & languages",
    skillsSubtitle: "Programming & tools",
    sectionContact: "Contact",
    sectionGuestbook: "Guestbook",
    guestbookLead:
      "Leave a message (stored in server memory; may clear after restart).",
    labelName: "Name",
    labelContent: "Message",
    phName: "How should we call you?",
    phContent: "Say something…",
    btnSend: "Send",
    contactEmail: "Email",
    contactPhone: "Phone",
    courseLabel: "Relevant coursework",
    projectLink: "Open link",
    pubEmpty: "None listed.",
    msgEmpty: "No messages yet — be the first.",
    errLoadResume: "Could not load profile data.",
    errLoadMsg: "Could not load messages.",
    errGeneric:
      "Load failed. Run backend + npm run dev locally, or set VITE_API_URL for split deploy.",
    errNetwork: "Network error",
    errSubmit: "Submit failed",
    sentOk: "Sent",
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
 * @param {() => void} onChange 切换语言后刷新界面
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

  function onPick(lang) {
    setLang(lang);
    applyDocumentLang();
    onChange?.();
    syncPressed();
  }

  zhBtn?.addEventListener("click", () => onPick("zh"));
  enBtn?.addEventListener("click", () => onPick("en"));
  syncPressed();
}
