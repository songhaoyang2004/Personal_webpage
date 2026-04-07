import os
from typing import List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from resume_en_data import RESUME_EN_DICT

app = FastAPI(
    title="个人主页 API",
    description="简历 API",
    version="2.5.1",
)

_extra_origins = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "").split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_extra_origins,
    # 公网 IP 访问（http://x.x.x.x）时 Origin 不在 localhost；补上 IPv4，便于同机不同端口的前后端
    allow_origin_regex=(
        r"https://.*\.vercel\.app|"
        r"http://localhost(:\d+)?|"
        r"http://127\.0\.0\.1(:\d+)?|"
        r"http://(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::\d+)?"
    ),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CourseItem(BaseModel):
    """课程名 + 介绍页（百科或院系大纲等）外链。"""

    name: str
    url: str


class SkillItem(BaseModel):
    """技能标签 + 官方或文档外链。"""

    name: str
    url: str


class Education(BaseModel):
    school: str
    school_url: Optional[str] = None
    degree: str
    degree_url: Optional[str] = None
    place: str
    time: str
    courses: List[CourseItem] = []


class Experience(BaseModel):
    company: str
    company_url: Optional[str] = None
    role: str
    time: str
    description: List[str]


class Project(BaseModel):
    name: str
    role: Optional[str] = None
    period: Optional[str] = None
    description: List[str]
    link: Optional[str] = None


class CampusItem(BaseModel):
    org: str
    role: str
    time: str
    description: List[str]


class Resume(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    location: str
    location_url: Optional[str] = None
    tagline: str = ""
    education: List[Education]
    experience: List[Experience]
    projects: List[Project]
    skills: List[SkillItem]
    language: str
    publications: List[str] = []
    campus: List[CampusItem] = []


resume_data = Resume(
    name="昊洋",
    email="songhaoyang2004@qq.com",
    phone=None,
    location="苏州市工业园区",
    location_url="https://www.google.com/maps/search/?api=1&query=%E8%8B%8F%E5%B7%9E%E5%B7%A5%E4%B8%9A%E5%9B%AD%E5%8C%BA",
    tagline="码龄三年",
    education=[
        Education(
            school="卡耐基梅隆大学（Carnegie Mellon University）",
            school_url="https://www.cmu.edu/",
            degree="信息系统管理硕士（MISM）",
            degree_url="https://www.heinz.cmu.edu/programs/information-systems-management-master/",
            place="美国 宾夕法尼亚州 匹兹堡",
            time="2026.08 – 2027.12（预计）",
            courses=[
                CourseItem(name="数据库管理", url="https://zh.wikipedia.org/wiki/数据库"),
                CourseItem(name="分布式系统", url="https://zh.wikipedia.org/wiki/分布式计算"),
                CourseItem(name="云计算", url="https://zh.wikipedia.org/wiki/云计算"),
                CourseItem(name="数据分析", url="https://zh.wikipedia.org/wiki/数据分析"),
                CourseItem(name="机器学习", url="https://zh.wikipedia.org/wiki/机器学习"),
                CourseItem(name="IT项目管理", url="https://zh.wikipedia.org/wiki/项目管理"),
            ],
        ),
        Education(
            school="西交利物浦大学（XJTLU）",
            school_url="https://www.xjtlu.edu.cn/",
            degree="信息与计算科学 本科",
            degree_url="https://www.xjtlu.edu.cn/zh/study/undergraduate/information-and-computing-science",
            place="中国 江苏 苏州",
            time="2022.09 – 2026.06",
            courses=[
                CourseItem(name="线性代数", url="https://zh.wikipedia.org/wiki/线性代数"),
                CourseItem(name="多元微积分", url="https://zh.wikipedia.org/wiki/多元微积分"),
                CourseItem(name="离散数学与统计", url="https://zh.wikipedia.org/wiki/离散数学"),
                CourseItem(name="数据结构", url="https://zh.wikipedia.org/wiki/数据结构"),
                CourseItem(name="计算机系统", url="https://zh.wikipedia.org/wiki/计算机系统结构"),
                CourseItem(name="Java", url="https://zh.wikipedia.org/wiki/Java"),
                CourseItem(name="人工智能", url="https://zh.wikipedia.org/wiki/人工智能"),
                CourseItem(name="软件工程", url="https://zh.wikipedia.org/wiki/软件工程"),
                CourseItem(name="计算机图形学", url="https://zh.wikipedia.org/wiki/计算机图形学"),
            ],
        ),
    ],
    experience=[
        Experience(
            company="天娱数科",
            company_url="https://www.tianyushuke.com/",
            role="游戏后端开发 / Unity 实习生",
            time="2025/06 – 2025/09",
            description=[
                "基于 Unity 开发类只狼 ARPG 游戏后端逻辑",
                "实现并调试有限状态机控制角色行为",
                "使用 Python 与 MediaPipe 构建动作捕捉与生成系统",
                "利用自然语言处理构建文本驱动动作库",
                "使用 Unreal Engine 5 设计数字人模型与动画系统",
            ],
        ),
        Experience(
            company="南京水利科学研究院水工水力学研究所",
            company_url="https://www.nhri.cn/",
            role="数据分析实习生",
            time="2024/06 – 2024/09",
            description=[
                "参与金鸡湖数字孪生系统维护与数据优化",
                "进行水质监测并记录关键指标",
                "使用 GIS 工具进行空间数据分析",
                "使用 Python 和 MATLAB 进行数据分析与预测",
                "编写数据清洗脚本，提高数据准确性",
            ],
        ),
    ],
    projects=[
        Project(
            name="视频动作识别与关键词匹配服务（FastAPI）",
            role="独立开发",
            period="2026/04 – 至今",
            description=[
                "基于 FastAPI 提供视频上传、骨骼关键点提取、异步任务与 Swagger 文档（/docs）",
                "使用 MediaPipe 提取 33 点人体姿态序列，环境不支持时自动降级为演示用提取器",
                "实现「每类模板向量」的余弦相似度分类，并支持用视频训练更新类别模板",
                "结合 jieba、TF-IDF 与余弦相似度完成类别名称与关键词检索匹配",
                "使用 SQLite 与本地文件存储上传资源、关键点与特征，配套静态演示页",
            ],
            link="http://116.62.55.74:8000/",
        ),
        Project(
            name="ChatPDF：基于大模型的 PDF 智能问答系统",
            role="系统管理员",
            period="2024/06 – 2024/07",
            description=[
                "开发基于 Gemini 和 LLaMA 的 PDF 智能问答工具",
                "使用 Python 和 Streamlit 完成前后端开发",
                "通过 PyMuPDF 实现 PDF 文本提取",
                "对比不同模型在学术与通用场景下的表现",
            ],
            link="https://chatpdf2surf.streamlit.app",
        ),
        Project(
            name="会议室管理系统（全栈开发）",
            role="核心开发者",
            period="2025/04 – 2025/05",
            description=[
                "负责系统整体设计与开发，实现用户注册登录、会议室管理、预约系统、邮箱验证及权限控制",
                "使用 HTML、CSS、JavaScript 构建前端界面，通过 AJAX 实现前后端异步通信",
                "基于 Spring Boot 和 MVC 架构设计后端逻辑，提高系统可维护性与扩展性",
                "实现用户验证、会议室查询及预约冲突检测等核心功能",
                "设计 MySQL 数据库结构，提高数据一致性与访问效率",
            ],
        ),
    ],
    skills=[
        SkillItem(name="Python", url="https://www.python.org/"),
        SkillItem(name="Java", url="https://dev.java/"),
        SkillItem(name="MATLAB", url="https://www.mathworks.com/products/matlab.html"),
        SkillItem(name="C++", url="https://isocpp.org/"),
        SkillItem(name="SQL", url="https://zh.wikipedia.org/wiki/SQL"),
        SkillItem(name="Spring Boot", url="https://spring.io/projects/spring-boot"),
        SkillItem(name="Streamlit", url="https://streamlit.io/"),
        SkillItem(name="FastAPI", url="https://fastapi.tiangolo.com/"),
        SkillItem(name="HTML", url="https://developer.mozilla.org/zh-CN/docs/Web/HTML"),
        SkillItem(name="CSS", url="https://developer.mozilla.org/zh-CN/docs/Web/CSS"),
        SkillItem(name="AJAX", url="https://developer.mozilla.org/zh-CN/docs/Glossary/AJAX"),
        SkillItem(name="PyMuPDF", url="https://pymupdf.readthedocs.io/"),
        SkillItem(name="GIS 工具", url="https://zh.wikipedia.org/wiki/地理信息系统"),
        SkillItem(name="LLM API（Gemini、LLaMA）", url="https://zh.wikipedia.org/wiki/大型语言模型"),
        SkillItem(name="Cursor", url="https://cursor.com/"),
        SkillItem(name="Codex", url="https://openai.com/codex/"),
    ],
    language="雅思（IELTS）7.0 分，具备良好的英语听说读写能力，可进行学术交流与技术文档阅读",
    publications=[
        "Ma, D., & haoyang.s（2023）《基于不同模型的猫狗图像分类性能对比分析》，发表于国际机器学习与自动化会议（CONF-MLA 2023）",
    ],
    campus=[
        CampusItem(
            org="西交利物浦大学（XJTLU）信息与计算科学专业",
            role="班长",
            time="2023.09 – 至今",
            description=[
                "搭建学生与教师之间的沟通桥梁，组织定期师生交流会议",
                "策划并执行多项班级活动（如团建、出游等），提升班级凝聚力",
                "主动帮助同学解决学习问题，营造良好学习氛围",
                "荣获校级「领导力挑战赛」一等奖",
            ],
        ),
    ],
)

resume_data_en = Resume.model_validate(RESUME_EN_DICT)


def _pick_resume(lang: Optional[str]) -> Resume:
    l = (lang or "zh").strip().lower()
    if l.startswith("en"):
        return resume_data_en
    return resume_data


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/resume")
def get_resume(lang: str = "zh"):
    return _pick_resume(lang)


@app.get("/api/projects")
def get_projects(lang: str = "zh"):
    return _pick_resume(lang).projects


@app.get("/api/skills")
def get_skills(lang: str = "zh"):
    return {"skills": _pick_resume(lang).skills}


@app.get("/api/contact")
def get_contact(lang: str = "zh"):
    r = _pick_resume(lang)
    out = {"email": r.email}
    if r.phone:
        out["phone"] = r.phone
    return out
