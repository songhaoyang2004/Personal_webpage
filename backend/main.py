import os
from typing import List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="个人主页 API",
    description="简历与留言 API（部署于 Railway）",
    version="2.0.0",
)

_extra_origins = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "").split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_extra_origins,
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost(:\d+)?|http://127\.0\.0\.1(:\d+)?",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Education(BaseModel):
    school: str
    degree: str
    place: str
    time: str
    courses: List[str] = []


class Experience(BaseModel):
    company: str
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
    tagline: str = ""
    education: List[Education]
    experience: List[Experience]
    projects: List[Project]
    skills: List[str]
    language: str
    publications: List[str] = []
    campus: List[CampusItem] = []


resume_data = Resume(
    name="宋昊洋",
    email="songhaoyang2004@qq.com",
    phone=None,
    location="苏州市工业园区",
    tagline="大四在读",
    education=[
        Education(
            school="卡耐基梅隆大学（Carnegie Mellon University）",
            degree="信息系统管理硕士（MISM）",
            place="美国 宾夕法尼亚州 匹兹堡",
            time="2026.08 – 2027.12（预计）",
            courses=[
                "数据库管理",
                "分布式系统",
                "云计算",
                "数据分析",
                "机器学习",
                "IT项目管理",
            ],
        ),
        Education(
            school="西交利物浦大学（XJTLU）",
            degree="信息与计算科学 本科",
            place="中国 江苏 苏州",
            time="2022.09 – 2026.06",
            courses=[
                "线性代数",
                "多元微积分",
                "离散数学与统计",
                "数据结构",
                "计算机系统",
                "Java",
                "人工智能",
                "软件工程",
                "计算机图形学",
            ],
        ),
    ],
    experience=[
        Experience(
            company="天娱数科",
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
        "Python",
        "Java",
        "MATLAB",
        "C++",
        "SQL",
        "Spring Boot",
        "Streamlit",
        "HTML",
        "CSS",
        "AJAX",
        "PyMuPDF",
        "GIS 工具",
        "LLM API（Gemini、LLaMA）",
        "Cursor",
        "Codex",
    ],
    language="雅思（IELTS）7.0 分，具备良好的英语听说读写能力，可进行学术交流与技术文档阅读",
    publications=[
        "Ma, D., & Song, H.（2023）《基于不同模型的猫狗图像分类性能对比分析》，发表于国际机器学习与自动化会议（CONF-MLA 2023）",
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


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/resume")
def get_resume():
    return resume_data


@app.get("/api/projects")
def get_projects():
    return resume_data.projects


@app.get("/api/skills")
def get_skills():
    return {"skills": resume_data.skills}


@app.get("/api/contact")
def get_contact():
    out = {"email": resume_data.email}
    if resume_data.phone:
        out["phone"] = resume_data.phone
    return out


class Message(BaseModel):
    name: str
    content: str


messages: List[Message] = []


@app.post("/api/message")
def leave_message(msg: Message):
    messages.append(msg)
    return {"message": "留言成功"}


@app.get("/api/message")
def get_messages():
    return messages
