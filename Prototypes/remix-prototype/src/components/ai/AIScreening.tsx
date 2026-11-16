import {
  Settings,
  FileText,
  Calendar,
  AlertCircle,
  Search,
  CheckCircle2,
  Plus,
  Loader2,
  X,
  List,
  MapPin,
  User,
  ChevronRight,
  ChevronDown,
  UserPlus,
  ArrowRightLeft,
  Share2,
  Clock,
  PanelRightClose,
  FolderOpen,
  Check,
  Pin,
  Edit2,
  Trash2,
  Sparkles,
  Database,
  Upload,
  Info,
  ArrowRight,
  Link,
  Tag,
  Activity,
  ArrowUp,
  History,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import ArtifactsPanel from "./ArtifactsPanel";
import ShareModal from "./ShareModal";

// Add missing type
type SessionArtifacts = {
  uploaded: { id: string; name: string; type: 'pdf' | 'docx' | 'xlsx' }[];
  generated: { id: string; name: string; type: 'pdf' | 'docx' | 'xlsx' }[];
};

const SESSIONS = [
  {
    id: "session-s-3",
    title: "2型糖尿病 III 期 - 病历筛查",
    desc: "患者：郝彬",
    project: "2型糖尿病 III 期",
    artifacts: {
      uploaded: [
        { id: "u-diab-1", name: "糖尿病III期方案设计草案_V4.0.pdf", type: "pdf" as const },
        { id: "u-diab-2", name: "郝彬_门诊电子病历摘要.pdf", type: "pdf" as const },
      ],
      generated: [
        { id: "g-diab-1", name: "临床试验匹配判定卡.pdf", type: "pdf" as const },
      ],
    },
  },
  {
    id: "session-s-1",
    title: "盐酸安罗替尼 - 病历筛查",
    desc: "患者：李四",
    project: "盐酸安罗替尼胶囊",
    artifacts: {
      uploaded: [
        { id: "u1", name: "试验方案_V2.0.pdf", type: "pdf" as const },
        { id: "u2", name: "李四_门诊病历.pdf", type: "pdf" as const },
      ],
      generated: [
        { id: "g1", name: "筛查匹配报告.pdf", type: "pdf" as const },
      ],
    },
  },
  {
    id: "session-s-2",
    title: "冠心宁片中保 - 病历筛查",
    desc: "患者：王五",
    project: "冠心宁片中保临床方案",
    artifacts: {
      uploaded: [
        { id: "u3", name: "冠心宁片临床方案.docx", type: "docx" as const },
        { id: "u4", name: "王五_住院病历摘要.pdf", type: "pdf" as const },
      ],
      generated: [
        { id: "g2", name: "筛查匹配报告.pdf", type: "pdf" as const },
      ],
    },
  },
  {
    id: "session-s-4",
    title: "替尔泊肽注射液 - 病历筛查",
    desc: "患者：张力",
    project: "替尔泊肽注射液三期临床研究",
    artifacts: {
      uploaded: [
        { id: "u5", name: "替尔泊肽注射液方案.pdf", type: "pdf" as const },
        { id: "u6", name: "张力_门诊病历.pdf", type: "pdf" as const },
      ],
      generated: [
        { id: "g3", name: "智能匹配报告.docx", type: "docx" as const },
      ],
    },
  },
  {
    id: "session-s-5",
    title: "阿达木单抗 - 既往病史筛查",
    desc: "患者：赵亮",
    project: "阿达木单抗临床观察",
    artifacts: {
      uploaded: [
        { id: "u7", name: "阿达木单抗方案.pdf", type: "pdf" as const },
      ],
      generated: [
        { id: "g4", name: "病史关联性核查结果.xlsx", type: "xlsx" as const },
      ],
    },
  },
  {
    id: "session-s-unassigned",
    title: "阿普唑仑片 - 病历筛查",
    desc: "患者：张三",
    project: "2型糖尿病临床入排精准核查项目",
    artifacts: {
      uploaded: [],
      generated: [],
    },
  },
];

function ExtractionTimer({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 1500);
    return () => clearTimeout(t);
  }, [onComplete]);
  return null;
}

const getProjectFilesForField = (project: string, field: 'protocol' | 'record') => {
  const isAnluo = project === "盐酸安罗替尼胶囊";
  const isGuan = project === "冠心宁片中保临床方案";
  
  if (field === 'protocol') {
    if (isAnluo) return [{ name: "盐酸安罗替尼临床试验方案.pdf", size: "4.1MB", type: "临床方案" }];
    if (isGuan) return [{ name: "冠心宁片中保临床方案.pdf", size: "1.8MB", type: "临床方案" }];
    return [
      { name: "盐酸安罗替尼临床试验方案.pdf", size: "4.1MB", type: "临床方案" },
      { name: "冠心宁片中保临床方案.pdf", size: "1.8MB", type: "临床方案" }
    ];
  } else {
    if (isAnluo) return [
      { name: "李四_门诊病历.pdf", size: "1.2MB", type: "门诊病历" },
      { name: "李静病例.pdf", size: "1.5MB", type: "住院病历" }
    ];
    if (isGuan) return [
      { name: "王五_住院病历摘要.pdf", size: "940KB", type: "住院病历" },
      { name: "演示病历-1.pdf", size: "241KB", type: "演示病历" }
    ];
    return [
      { name: "李四_门诊病历.pdf", size: "1.2MB", type: "门诊病历" },
      { name: "王五_住院病历摘要.pdf", size: "940KB", type: "住院病历" },
      { name: "李静病例.pdf", size: "1.5MB", type: "住院病历" },
      { name: "演示病历-1.pdf", size: "241KB", type: "演示病历" }
    ];
  }
};

export default function AIScreening({ selectedProject = "全部" }: { selectedProject?: string }) {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogSearchQuery, setDialogSearchQuery] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingSessionTitle, setEditingSessionTitle] = useState("");

  const [checkState, setCheckState] = useState<
    "idle" | "thinking" | "checking" | "completed"
  >("idle");
  const [checkStep, setCheckStep] = useState(0);
  const [thinkingHintIndex, setThinkingHintIndex] = useState(0);

  const thinkingHints = [
    "正在烧脑处理中...",
    "正在拼命调动亿万神经元...",
    "CPU已冒烟，算力燃烧中...",
    "数据疯狂对齐中，请稍候..."
  ];

  useEffect(() => {
    let interval: any;
    if (checkState === "thinking" || checkState === "checking") {
      interval = setInterval(() => {
        setThinkingHintIndex((prev) => (prev + 1) % thinkingHints.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [checkState]);

  const [selectedMatchProject, setSelectedMatchProject] = useState("冠心宁");
  const [showProcessLog, setShowProcessLog] = useState(true);
  const [showReport, setShowReport] = useState(false);

  const [screeningChatMessages, setScreeningChatMessages] = useState<{ sender: "ai" | "user", text: string }[]>([]);
  const [screeningChatInput, setScreeningChatInput] = useState("");

  const screeningChatEndRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (screeningChatEndRef.current) {
      screeningChatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [screeningChatMessages, checkState, checkStep]);

  const [isAiTyping, setIsAiTyping] = useState(false);

  const handleSendScreeningChatMessage = () => {
    if (!screeningChatInput.trim()) return;
    const userMsg = { sender: "user" as const, text: screeningChatInput };
    setScreeningChatMessages(prev => [...prev, userMsg]);
    const query = screeningChatInput.trim();
    setScreeningChatInput("");
    setIsAiTyping(true);

    // If no checkState yet, it's a general inquiry or starting a new check
    // We don't necessarily force checkState="thinking" if they are just chatting, 
    // but the condition in the UI will now show the chat container anyway.

    setTimeout(() => {
      let reply = "";
      if (query.includes("冠心宁") || query.includes("心绞痛")) {
        reply = "针对郝彬患者的冠心宁片临床方案筛选，匹配度评定为 98%。主要优势在于：患者年龄72岁完全符合18-75周岁的基准；临床心电图ST段呈压低特征（V4-V6压低0.15mV）完美符合诊断标准；既往无重度心衰或6个月内急性心梗史，未触发任何排除条件。建议尽快联系推荐人启动入组流程。";
      } else if (query.includes("替尔泊肽") || query.includes("SURMOUNT-5") || query.includes("肥胖")) {
        reply = "替尔泊肽用于肥胖伴合并症方案（SURMOUNT-5）对郝彬的匹配度为 64%。患者主要因为近期的糖化血红蛋白指标超标（超过6.5%），触发了排除指标。虽然其BMI符合入选，但由于存在明确的排除指标，因此不推荐该项目。";
      } else if (query.includes("痛风") || query.includes("尿酸")) {
        reply = "痛风患者评估方案（恒瑞医药）对郝彬的匹配度为 85%。该患者既往存在痛风合并症史，符合基本研究方向，但目前病历中缺乏近1个月内的血尿酸定量化验单。需要补充化验结果方能最终确认其入排符合性，状态标记为“待查”。";
      } else {
        reply = "您好！关于郝彬的病历筛查结果：冠心宁片方案匹配度最高（98%），替尔泊肽方案因糖化血红蛋白超标而触发排除（64%），痛风项目因缺乏近1个月尿酸报告而处于待查状态（85%）。如果您有其他问题或需要上传新病历，随时可以告诉我！";
      }
      setScreeningChatMessages(prev => [...prev, { sender: "ai" as const, text: reply }]);
      setIsAiTyping(false);
      // Reset input state to match initial state
      setScreeningChatInput("");
    }, 1500);
  };

  // New Patient Database & Wizard States
  const [patients, setPatients] = useState([
    { id: "P20260716090524", name: "J**", fullName: "金新华", gender: "男", age: 46, dob: "1980-03", disease: "2型糖尿病", phone: "138****0123", source: "机构转介", idCard: "310101198003151234", referrer: "陈主任", fileName: "金新华_内分泌科门诊病历.pdf", fileSize: "1.8MB", status: "不符合", project: "TQB2868 注射液与盐酸安罗替尼胶囊联合化疗..." },
    { id: "P20260715182210", name: "Z**", fullName: "张爱国", gender: "男", age: 52, dob: "1974-06", disease: "高血压合并2型糖尿病", phone: "139****5678", source: "机构转介", idCard: "310101197406124567", referrer: "李医生", fileName: "张爱国_住院病历摘要.docx", fileSize: "2.1MB", status: "符合", project: "冠心宁片中保临床方案" },
    { id: "P20260709082819", name: "G**", fullName: "顾敏", gender: "女", age: 61, dob: "1965-04", disease: "胰腺恶性肿瘤", phone: "138****9207", source: "机构转介", idCard: "310101196504128912", referrer: "李主任", fileName: "顾敏_胰腺肿瘤门诊病历.pdf", fileSize: "1.4MB", status: "不符合", project: "盐酸安罗替尼胶囊多中心研究" },
    { id: "P20260709082716", name: "L**", fullName: "林国强", gender: "男", age: 58, dob: "1968-09", disease: "非小细胞肺癌", phone: "139****1122", source: "机构转介", idCard: "310101196809153456", referrer: "陈医生", fileName: "林国强_非小细胞肺癌报告.docx", fileSize: "840KB", status: "符合", project: "盐酸安罗替尼胶囊多中心研究" },
    { id: "P20260709082449", name: "W**", fullName: "王德华", gender: "男", age: 45, dob: "1981-11", disease: "心绞痛", phone: "135****4433", source: "机构转介", idCard: "310101198111204567", referrer: "王医生", fileName: "王德华_出院小结.docx", fileSize: "1.6MB", status: "符合", project: "冠心宁片中保临床方案" },
  ]);

  // Filters for the table
  const [filterId, setFilterId] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterSource, setFilterSource] = useState("全部");

  const [mainView, setMainView] = useState<"newTask" | "patients">("newTask");
  const [sidebarTab, setSidebarTab] = useState<"newTask" | "screening" | "patients">("screening");
  const [hasCreatedTask, setHasCreatedTask] = useState(false);

  // Build Patient / Screening Modal States
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [buildStep, setBuildStep] = useState<"upload" | "extracting" | "form" | "project_select">("upload");
  const [uploadedRecordFile, setUploadedRecordFile] = useState<{ name: string; size: string } | null>(null);
  
  // Custom Project Scheme/Protocol State for selected project view
  const [isSchemeRemoved, setIsSchemeRemoved] = useState(false);
  const [customSchemeFile, setCustomSchemeFile] = useState<{ name: string; size: string } | null>(null);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  // Form inputs for registered patient
  const [formName, setFormName] = useState("");
  const [formShortName, setFormShortName] = useState("");
  const [formDob, setFormDob] = useState("");
  const [formAge, setFormAge] = useState("");
  const [formGender, setFormGender] = useState("男");
  const [formDisease, setFormDisease] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formIdCard, setFormIdCard] = useState("");
  const [formSource, setFormSource] = useState("机构转介");
  const [formReferrer, setFormReferrer] = useState("");

  // Resize logic & Artifacts state
  const [rightPanelWidth, setRightPanelWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);
  const [isArtifactsOpen, setIsArtifactsOpen] = useState(false);
  const [isArtifactsExpanded, setIsArtifactsExpanded] = useState(false);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 300 && newWidth < window.innerWidth * 0.7) {
        setRightPanelWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = 'col-resize';
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isResizing]);

  useEffect(() => {
    const handleToggle = () => setIsArtifactsOpen(prev => !prev);
    const handleOpen = () => setIsArtifactsOpen(true);
    const handleClose = () => setIsArtifactsOpen(false);
    window.addEventListener('totrial_toggle_artifacts', handleToggle);
    window.addEventListener('totrial_open_artifacts', handleOpen);
    window.addEventListener('totrial_artifacts_closed', handleClose);
    return () => {
      window.removeEventListener('totrial_toggle_artifacts', handleToggle);
      window.removeEventListener('totrial_open_artifacts', handleOpen);
      window.removeEventListener('totrial_artifacts_closed', handleClose);
    };
  }, []);

  // 新增：高保真大对话框启动与文件载入状态
  const [activeModel, setActiveModel] = useState<string>("TotrialDriver3.0");
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: string; type: "record" | "scheme" }>>([]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [startupInput, setStartupInput] = useState("");
  const startupFileInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // Conversational Screening States & Methods
  // ==========================================
  const [convStep, setConvStep] = useState<number>(-1); // -1: inactive, 0, 1, 2... active steps
  const [convProject, setConvProject] = useState<string>("");
  const [convRole, setConvRole] = useState<string>("");
  const [convAnswers, setConvAnswers] = useState<Record<string, any>>({});
  const [convShortCircuit, setConvShortCircuit] = useState<boolean>(false);
  const [convShowFinalCard, setConvShowFinalCard] = useState<boolean>(false);
  const [convSignature, setConvSignature] = useState<string>("");
  const [convSigned, setConvSigned] = useState<boolean>(false);
  const [convExported, setConvExported] = useState<boolean>(false);
  const [convModel, setConvModel] = useState<string>("TotrilDriver 3.0");

  const [convMessages, setConvMessages] = useState<{
    id: string;
    sender: "ai" | "user";
    text: string;
    time: string;
    buttons?: { label: string; value: any; danger?: boolean; primary?: boolean }[];
    inputType?: "text" | "number";
    inputPlaceholder?: string;
    showProgress?: boolean;
    isBentoReport?: boolean;
  }[]>([]);

  // 1. Get current rules alignment progress list
  const getCriteriaList = (proj: string, ans: Record<string, any>) => {
    const isDiab = proj.includes("糖尿病") || proj.includes("session-s-3");
    const isAnluo = proj.includes("安罗替尼") || proj.includes("session-s-1");
    
    if (isDiab) {
      return [
        { key: "diagnosis", name: "I-01 临床诊断", desc: "确诊为 2 型糖尿病", status: "pass", detail: "已自动匹配并对齐" },
        { 
          key: "age", 
          name: "I-02 年龄范围", 
          desc: "年龄介于 18 至 75 周岁之间", 
          status: ans.age === undefined ? "pending" : (Number(ans.age) >= 18 && Number(ans.age) <= 75 ? "pass" : "fail"),
          detail: ans.age === undefined ? "等待问答核查" : `${ans.age} 岁 (符合)`
        },
        { 
          key: "hba1c", 
          name: "I-03 糖化血红蛋白", 
          desc: "HbA1c 介于 7.0% 至 10.0% 之间", 
          status: ans.hba1c === undefined ? "pending" : (Number(ans.hba1c) >= 7.0 && Number(ans.hba1c) <= 10.0 ? "pass" : "fail"),
          detail: ans.hba1c === undefined ? "等待评估" : `${ans.hba1c}%`
        },
        { 
          key: "bmi", 
          name: "I-04 超重/肥胖体格", 
          desc: "体重指数 BMI 介于 23.0 至 40.0 之间", 
          status: ans.bmi === undefined ? "pending" : (Number(ans.bmi) >= 23.0 && Number(ans.bmi) <= 40.0 ? "pass" : (Number(ans.bmi) > 40.0 ? "warning" : "fail")),
          detail: ans.bmi === undefined ? "等待录入" : `BMI ${ans.bmi}`
        },
        { 
          key: "glp1", 
          name: "E-01 药物排查限制", 
          desc: "过去 3 个月内无 GLP-1 类似物史", 
          status: ans.glp1 === undefined ? "pending" : (ans.glp1 === "no" ? "pass" : "fail"),
          detail: ans.glp1 === undefined ? "等待排查" : (ans.glp1 === "no" ? "无使用史" : "近期有使用史")
        },
        { 
          key: "renal", 
          name: "E-02 脏器功能红线", 
          desc: "无重度肾损伤 (eGFR < 30)", 
          status: ans.renal === undefined ? "pending" : (ans.renal === "no" ? "pass" : "fail"),
          detail: ans.renal === undefined ? "等待化验" : (ans.renal === "no" ? "肾脏功能正常" : "合并重度肾不全")
        },
        { 
          key: "pregnancy", 
          name: "E-03 妊娠生育保护", 
          desc: "非妊娠/哺乳期且同意避孕", 
          status: ans.pregnancy === undefined ? "pending" : (ans.pregnancy === "no" ? "pass" : "fail"),
          detail: ans.pregnancy === undefined ? "等待确认" : (ans.pregnancy === "no" ? "无妊娠风险" : "触发排除指标")
        },
        { key: "stomach", name: "E-04 胃轻瘫无病史", desc: "无严重糖尿病胃瘫等", status: "pass", detail: "病历提示未见异常" },
        { key: "liver", name: "E-05 肝功能耐受性", desc: "转氨酶ALT/AST正常范围", status: "pass", detail: "ALT 28 U/L (正常)" },
        { key: "consent", name: "I-05 GCP知情同意", desc: "自愿签署知情同意书", status: "pass", detail: "知情意向明确" }
      ];
    } else if (isAnluo) {
      return [
        { 
          key: "diagnosis", 
          name: "I-01 病理学诊断", 
          desc: "组织学/细胞学确诊非小细胞肺癌 (NSCLC)", 
          status: ans.diagnosis === undefined ? "pending" : (ans.diagnosis === "yes" ? "pass" : "fail"),
          detail: ans.diagnosis === undefined ? "等待诊断确认" : (ans.diagnosis === "yes" ? "确诊 NSCLC (符合)" : "诊断不符 (排除)")
        },
        { key: "lesion", name: "I-02 可测量靶病灶", desc: "至少含一个 RECIST 1.1 可测量靶病灶", status: "pass", detail: "CT提示有靶病灶" },
        { 
          key: "bleeding", 
          name: "E-01 出血排除限制", 
          desc: "无空洞型肺癌或近期活动大咯血史", 
          status: ans.bleeding === undefined ? "pending" : (ans.bleeding === "no" ? "pass" : "fail"),
          detail: ans.bleeding === undefined ? "等待咯血排查" : (ans.bleeding === "no" ? "未见大出血风险" : "有咯血史 (高危)")
        },
        { 
          key: "ecog", 
          name: "E-02 体能状态评分", 
          desc: "ECOG 评分在 0-1 分之间", 
          status: ans.ecog === undefined ? "pending" : (ans.ecog === "good" ? "pass" : "fail"),
          detail: ans.ecog === undefined ? "等待日常评分" : (ans.ecog === "good" ? "ECOG 0-1 (良好)" : "ECOG ≥ 2 (不符)")
        }
      ];
    } else {
      // 冠心宁
      return [
        { 
          key: "age", 
          name: "I-01 年龄范围", 
          desc: "年龄在 18 至 75 周岁之间", 
          status: ans.age === undefined ? "pending" : (Number(ans.age) >= 18 && Number(ans.age) <= 75 ? "pass" : "fail"),
          detail: ans.age === undefined ? "等待核对" : `${ans.age} 岁`
        },
        { 
          key: "diagnosis", 
          name: "I-02 稳定性心绞痛", 
          desc: "稳定性心绞痛 3 个月以上伴心电图 ST 缺血证据", 
          status: ans.diagnosis === undefined ? "pending" : (ans.diagnosis === "yes" ? "pass" : "fail"),
          detail: ans.diagnosis === undefined ? "等待心电图确认" : (ans.diagnosis === "yes" ? "心肌缺血符合" : "缺血证据不足")
        },
        { 
          key: "cardiac", 
          name: "E-01 重度心衰史", 
          desc: "无 NYHA III-IV 级重度心力衰竭病史", 
          status: ans.cardiac === undefined ? "pending" : (ans.cardiac === "no" ? "pass" : "fail"),
          detail: ans.cardiac === undefined ? "等待心功能评级" : (ans.cardiac === "no" ? "心功能 NYHA II级" : "心力衰竭重度")
        },
        { 
          key: "liver", 
          name: "E-02 脏器耐受性上限", 
          desc: "肝脏转氨酶正常上限 2 倍以内", 
          status: ans.liver === undefined ? "pending" : (ans.liver === "no" ? "pass" : "fail"),
          detail: ans.liver === undefined ? "等待生化单" : (ans.liver === "no" ? "肝脏功能正常" : "转氨酶异常偏高")
        }
      ];
    }
  };

  // 2. Fetch specific question configurations dynamically
  const getQuestionForStep = (proj: string, step: number, answers: Record<string, any>, role: string) => {
    const isDoctor = role === "doctor";
    const isDiab = proj.includes("糖尿病") || proj.includes("session-s-3");
    const isAnluo = proj.includes("安罗替尼") || proj.includes("session-s-1");

    if (isDiab) {
      if (step === 1) {
        return {
          text: `好的，已切换至【${isDoctor ? "研究者临床视角" : "患者通俗视角"}】进行对标核对。\n\n首先，**请问患者当前的实际年龄是多少岁？**\n（试验入选标准 I-02：年龄需在 18 - 75 周岁之间）`,
          buttons: [
            { label: "62 岁 (示例郝彬)", value: 62, primary: true },
            { label: "17 岁 (触发硬排除)", value: 17, danger: true }
          ],
          inputType: "number" as const,
          inputPlaceholder: "输入患者实际年龄"
        };
      }
      if (step === 2) {
        return {
          text: `好的，年龄已记录。下面进入核心代谢实验室化验核对：\n\n**患者最近 1 个月的糖化血红蛋白 (HbA1c) 测定值是多少？**\n（方案入组标准 I-03：HbA1c 必须在 7.0% 至 10.0% 之间。高于 10.0% 或低于 7.0% 会触发排除）`,
          buttons: [
            { label: "7.5% (符合范围)", value: 7.5, primary: true },
            { label: "11.2% (糖毒排除)", value: 11.2, danger: true }
          ],
          inputType: "number" as const,
          inputPlaceholder: "输入糖化血红蛋白百分比"
        };
      }
      if (step === 3) {
        return {
          text: `糖化血红蛋白已比对。下面进行关键合并用药史排除性排查：\n\n**患者在过去 3 个月内，是否接受过任何 GLP-1 受体激动剂（如司美格鲁肽、度拉糖肽、利拉鲁肽等）的长期治疗？**\n（排除条件 E-01：近期使用该类药物会导致对标数据干扰，属于一票否决排除项）`,
          buttons: [
            { label: "❌ 否（未曾使用，符合）", value: "no", primary: true },
            { label: "⚠️ 是（曾使用，立刻触发短路）", value: "yes", danger: true }
          ]
        };
      }
      if (step === 4) {
        return {
          text: `收到。下面进行体型肥胖指数对齐核对：\n\n**患者当前的体重指数 (BMI) 是多少？**\n（方案入选推荐区间为 23.0 - 40.0 kg/m²。超过 40.0 会触发超重提示，但非硬性直接否决）`,
          buttons: [
            { label: "28.5 (符合范围)", value: 28.5, primary: true },
            { label: "42.0 (标红警告但可继续)", value: 42.0, danger: true }
          ],
          inputType: "number" as const,
          inputPlaceholder: "输入 BMI 值"
        };
      }
      if (step === 5) {
        return {
          text: `收到，BMI 记录成功。下面进入安全性脏器排查：\n\n**患者是否合并重度肾功能不全（如 eGFR < 30 mL/min/1.73m² 或严重肾功能衰竭）？**\n（排除条件 E-02：重度肾损害者属于安全红线排除项）`,
          buttons: [
            { label: "否 (肾功能良好，符合)", value: "no", primary: true },
            { label: "是 (重度肾损害，排除)", value: "yes", danger: true }
          ]
        };
      }
      if (step === 6) {
        return {
          text: `肾功能正常。最后一步，核对受试者妊娠与受孕计划：\n\n**受试者是否处于妊娠期、哺乳期，或在临床试验期间无法采取有效的物理避孕措施？**`,
          buttons: [
            { label: "否 / 不适用 (符合)", value: "no", primary: true },
            { label: "是 (触发妊娠安全排除)", value: "yes", danger: true }
          ]
        };
      }
    } else if (isAnluo) {
      if (step === 1) {
        return {
          text: `好的。首先进行病理学确诊事实核查：\n\n**受试者是否经组织学或细胞学确诊为非小细胞肺癌 (NSCLC)？**`,
          buttons: [
            { label: "是 (确诊符合)", value: "yes", primary: true },
            { label: "否 (排除诊断)", value: "no", danger: true }
          ]
        };
      }
      if (step === 2) {
        return {
          text: `收到。下面排查致命性大出血临床风险：\n\n**患者是否存在中央型肺癌，或在最近 3 个月内有活动性严重出血、大咯血 (单次咯血 > 50ml) 史？**\n（排除条件 E-01：为防范肺大血管严重出血，此项属于高危排除限制）`,
          buttons: [
            { label: "❌ 否 (无大出血病史，符合)", value: "no", primary: true },
            { label: "⚠️ 是 (有高危出血，硬排除)", value: "yes", danger: true }
          ]
        };
      }
      if (step === 3) {
        return {
          text: `出血安全性通过。最后一步，评估受试者体能状态评分：\n\n**患者当前的 ECOG 体能状态评分是多少？**\n（方案要求：评分在 0-1 分之间，即生活自理、可行走及轻工作。若 ≥ 2分则一票否决排除）`,
          buttons: [
            { label: "0-1 分 (体能优良，符合)", value: "good", primary: true },
            { label: "2 分及以上 (体能差，排除)", value: "bad", danger: true }
          ]
        };
      }
    } else {
      // 冠心宁
      if (step === 1) {
        return {
          text: `首先，**请问患者的实际年龄是多少岁？**（方案入组标准 I-01：年龄在 18 至 75 周岁之间）`,
          buttons: [
            { label: "62 岁 (符合区间)", value: 62, primary: true },
            { label: "80 岁 (触发超龄硬排除)", value: 80, danger: true }
          ],
          inputType: "number" as const,
          inputPlaceholder: "输入患者实际年龄"
        };
      }
      if (step === 2) {
        return {
          text: `好的，年龄符合。下面对齐心肌缺血诊断指标：\n\n**患者是否确诊稳定性心绞痛 3 个月以上，且静息心电图证实有心肌缺血（如 ST段水平/下斜型压低 ≥ 0.1mV）？**`,
          buttons: [
            { label: "是 (确诊符合指标)", value: "yes", primary: true },
            { label: "否 (缺血依据不足，排除)", value: "no", danger: true }
          ]
        };
      }
      if (step === 3) {
        return {
          text: `诊断指标通过。下面排查重症心脏并发症（一票否决项）：\n\n**患者是否合并重度心力衰竭 (NYHA III-IV 级) 或在最近 6 个月内发生过急性心肌梗死？**`,
          buttons: [
            { label: "否 (无重度并发症，符合)", value: "no", primary: true },
            { label: "是 (合并高危病史，硬排除)", value: "yes", danger: true }
          ]
        };
      }
      if (step === 4) {
        return {
          text: `高危并发症排查通过。最后，核对肝功能脏器耐受性红线：\n\n**患者近一个月的谷丙/谷草转氨酶 (ALT/AST) 测定值是否超过正常值上限的 2 倍？**`,
          buttons: [
            { label: "否 (转氨酶低于限值，符合)", value: "no", primary: true },
            { label: "是 (超过 2 倍，触发排除)", value: "yes", danger: true }
          ]
        };
      }
    }
    return { text: "对标核对已全部完成", buttons: [] };
  };

  // 3. Initiate active dialogue screening matching session
  const startConversationalScreening = (proj: string) => {
    setConvProject(proj);
    setConvStep(0);
    setConvAnswers({});
    setConvShortCircuit(false);
    setConvShowFinalCard(false);
    setConvSigned(false);
    setConvSignature("");
    setConvExported(false);

    let welcomeText = "";
    let buttons: any[] = [];
    const isDiab = proj.includes("糖尿病") || proj.includes("session-s-3");
    const isAnluo = proj.includes("安罗替尼") || proj.includes("session-s-1");

    if (isDiab) {
      welcomeText = "您好！我是您的 WorkBuddy 临床试验智能筛查专家。下面我将一步步引导您完成【2型糖尿病 III 期】临床研究方案的患者筛查核对。\n\n我们将遵循『排除优先+权重短路』原则对齐 12 项入排硬性限制。如果受试者偏离核心指标，系统会自动触发短路中断以提升您的工作效率。\n\n首先，**请问您的身份是？**（这决定了我的专业词库和信息展示偏好）";
      buttons = [
        { label: "👨‍⚕️ 医护人员 / 研究者 (专业视图)", value: "doctor", primary: true },
        { label: "👤 患者本人 / 亲属 (通俗视图)", value: "patient" }
      ];
    } else if (isAnluo) {
      welcomeText = "您好！我是您的 WorkBuddy 智能对标助手。下面我将协助您针对【盐酸安罗替尼胶囊多中心临床试验】进行对标核查。我们将排查组织学诊断、咯血史以及 ECOG 评分。\n\n请问您的身份是？";
      buttons = [
        { label: "👨‍⚕️ 医护人员 / 临床协调员", value: "doctor", primary: true },
        { label: "👤 受试者家属", value: "patient" }
      ];
    } else {
      welcomeText = "您好！我是您的 WorkBuddy 对话对标专家。下面我们将核对【《冠心宁片中保临床方案》】的患者心绞痛诊断与肝肾耐受性安全指标。\n\n首先，请问您的身份是？";
      buttons = [
        { label: "👨‍⚕️ GCP 研究者 / 临床医护", value: "doctor", primary: true },
        { label: "👤 患者本人", value: "patient" }
      ];
    }

    setConvMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        sender: "ai",
        text: welcomeText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        buttons: buttons
      }
    ]);
  };

  // 4. Handle choice click or typed inputs
  const handleConvAnswer = (val: any) => {
    let currentKey = "";
    let isShortCircuitAnswer = false;
    const isDiab = convProject.includes("糖尿病") || convProject.includes("session-s-3");
    const isAnluo = convProject.includes("安罗替尼") || convProject.includes("session-s-1");

    if (isDiab) {
      if (convStep === 0) currentKey = "role";
      else if (convStep === 1) {
        currentKey = "age";
        if (Number(val) < 18 || Number(val) > 75) isShortCircuitAnswer = true;
      }
      else if (convStep === 2) {
        currentKey = "hba1c";
        if (Number(val) < 7.0 || Number(val) > 10.0) isShortCircuitAnswer = true;
      }
      else if (convStep === 3) {
        currentKey = "glp1";
        if (val === "yes") isShortCircuitAnswer = true;
      }
      else if (convStep === 4) {
        currentKey = "bmi";
      }
      else if (convStep === 5) {
        currentKey = "renal";
        if (val === "yes") isShortCircuitAnswer = true;
      }
      else if (convStep === 6) {
        currentKey = "pregnancy";
        if (val === "yes") isShortCircuitAnswer = true;
      }
    } else if (isAnluo) {
      if (convStep === 0) currentKey = "role";
      else if (convStep === 1) {
        currentKey = "diagnosis";
        if (val === "no") isShortCircuitAnswer = true;
      }
      else if (convStep === 2) {
        currentKey = "bleeding";
        if (val === "yes") isShortCircuitAnswer = true;
      }
      else if (convStep === 3) {
        currentKey = "ecog";
        if (val === "bad") isShortCircuitAnswer = true;
      }
    } else {
      if (convStep === 0) currentKey = "role";
      else if (convStep === 1) {
        currentKey = "age";
        if (Number(val) < 18 || Number(val) > 75) isShortCircuitAnswer = true;
      }
      else if (convStep === 2) {
        currentKey = "diagnosis";
        if (val === "no") isShortCircuitAnswer = true;
      }
      else if (convStep === 3) {
        currentKey = "cardiac";
        if (val === "yes") isShortCircuitAnswer = true;
      }
      else if (convStep === 4) {
        currentKey = "liver";
        if (val === "yes") isShortCircuitAnswer = true;
      }
    }

    const newAnswers = { ...convAnswers, [currentKey]: val };
    setConvAnswers(newAnswers);

    let bubbleText = String(val);
    if (val === "doctor") bubbleText = "医护人员 / 研究者";
    else if (val === "patient") bubbleText = "患者本人 / 家属";
    else if (val === "yes") bubbleText = "是";
    else if (val === "no") bubbleText = "否";
    else if (val === "good") bubbleText = "0-1 分 (自理能力优良)";
    else if (val === "bad") bubbleText = "2 分及以上 (体能受限)";
    else if (currentKey === "age") bubbleText = `受试者实际年龄: ${val} 岁`;
    else if (currentKey === "hba1c") bubbleText = `最近测糖化血红蛋白: ${val}%`;
    else if (currentKey === "bmi") bubbleText = `测定 BMI 指数: ${val}`;

    const userMsg = {
      id: `msg-user-${Date.now()}`,
      sender: "user" as const,
      text: bubbleText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConvMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      if (isShortCircuitAnswer) {
        setConvShortCircuit(true);
        const scMsg = {
          id: `msg-sc-${Date.now()}`,
          sender: "ai" as const,
          text: `⚠️ **触发硬性临床排除条件短路机制！**\n\n检测到输入项不符合方案要求。在GCP规范下，该情况会导致患者无法合规通过。\n\n为了帮您节省临床判定及核对的时间成本，您可以立即选择「强制终止并生成合规不推荐判定卡」，或选择「无视警告继续核对」补全剩余要素归档备忘：`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          buttons: [
            { label: "🔴 立即终止，生成判定卡", value: "finish_sc", danger: true },
            { label: "🟢 继续核对剩余指标", value: "continue", primary: true }
          ]
        };
        setConvMessages(prev => [...prev, scMsg]);
        return;
      }

      const maxSteps = isDiab ? 6 : (isAnluo ? 3 : 4);
      
      if (val === "finish_sc" || convStep >= maxSteps) {
        setConvStep(99);
        setConvShowFinalCard(true);
        const finalMsg = {
          id: `msg-final-${Date.now()}`,
          sender: "ai" as const,
          text: `📊 **对标核对流程已全部执行完成！**\n\n我已根据刚才所有的对话对标要素、以及后台关联的脱敏原始病历档案，全自动计算出了临床匹配契合度。您的专属**【GCP 智能对标判定卡】**和筛查研报已在下方同步生成，请您查阅。`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isBentoReport: true
        };
        setConvMessages(prev => [...prev, finalMsg]);
      } else {
        const nextStep = val === "continue" ? convStep : convStep + 1;
        setConvStep(nextStep);
        
        let welcomeRole = currentKey === "role" ? val : convRole;
        if (currentKey === "role") setConvRole(val);

        const nextQ = getQuestionForStep(convProject, nextStep, newAnswers, welcomeRole);
        setConvMessages(prev => [...prev, {
          id: `msg-ai-q-${Date.now()}`,
          sender: "ai" as const,
          text: nextQ.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          buttons: nextQ.buttons,
          inputType: nextQ.inputType,
          inputPlaceholder: nextQ.inputPlaceholder
        }]);
      }
    }, 600);
  };

  // 5. Watch active session id changes
  useEffect(() => {
    if (activeSessionId) {
      const sess = sessions.find(s => s.id === activeSessionId);
      if (sess) {
        const projName = sess.project || "2型糖尿病 III 期";
        setConvProject(projName);
        
        // If they click on our preloaded completed tasks, show completed card instantly
        if (activeSessionId === "session-s-1" || activeSessionId === "session-s-2") {
          setConvStep(99);
          setConvShowFinalCard(true);
          if (activeSessionId === "session-s-1") {
            setConvAnswers({ diagnosis: "yes", bleeding: "no", ecog: "good" });
          } else if (activeSessionId === "session-s-2") {
            setConvAnswers({ age: 62, diagnosis: "yes", cardiac: "no", liver: "no" });
          }
          setConvMessages([
            {
              id: `msg-hist-${Date.now()}`,
              sender: "ai",
              text: `📊 **此历史匹配筛查判定任务已在系统中归档。**\n\n您可在此查阅历史对标结论。如果患者病理指标发生了新的变化，您随时可以点击下方【🔄 重新对话评估】启动多维度动态问答筛查。`,
              time: "已归档",
              isBentoReport: true
            }
          ]);
        } else if (activeSessionId === "session-s-3") {
          // Completed diabetes session
          setConvStep(99);
          setConvShowFinalCard(true);
          setConvAnswers({ age: 62, hba1c: 7.5, glp1: "no", bmi: 28.5, renal: "no", pregnancy: "no" });
          setConvMessages([
            {
              id: `msg-hist-diab-${Date.now()}`,
              sender: "ai",
              text: `📊 **示例项目「2型糖尿病 III 期」病历筛查结论已同步生成：**\n\n该受试者完全契合所有临床设计限值，安全耐受度良好。以下为本周期对标生成判定卡：`,
              time: "已归档",
              isBentoReport: true
            }
          ]);
        } else {
          // Starts a new conversational screening
          startConversationalScreening(projName);
        }
      }
    } else {
      setConvStep(-1);
    }
  }, [activeSessionId]);


  // Project Selection inside modal
  const [modalMatchMode, setModalMatchMode] = useState<"single" | "full">("single");
  const [modalProjectSource, setModalProjectSource] = useState<"upload" | "library">("upload");
  const [modalSelectedLibraryProject, setModalSelectedLibraryProject] = useState("");
  const [agreeToRecruitment, setAgreeToRecruitment] = useState(false);

  // Secondary modals
  const [selectedProfilePatient, setSelectedProfilePatient] = useState<any>(null);
  const [selectedTracePatient, setSelectedTracePatient] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadContext, setActiveUploadContext] = useState<
    "protocol" | "record" | null
  >(null);

  const [setupState, setSetupState] = useState({
    protocol: false,
    record: false,
  });

  const [matchMode, setMatchMode] = useState<'single' | 'full'>('single');
  const [projectSource, setProjectSource] = useState<'upload' | 'library'>('upload');
  const [selectedLibraryProject, setSelectedLibraryProject] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [libSearchQuery, setLibSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const libraryProjects = [
    { id: "p1", name: "冠心宁片中保临床方案" },
    { id: "p2", name: "盐酸安罗替尼胶囊多中心临床试验" },
    { id: "p3", name: "替尔泊肽注射液三期临床研究" },
  ];

  const filteredProjects = libraryProjects.filter(p => 
    p.name.toLowerCase().includes(libSearchQuery.toLowerCase())
  );

  const [reportView, setReportView] = useState<'overview' | 'detail'>('overview');

  let isSetupReady = false;
  if (setupState.record) {
    if (matchMode === 'full') {
      isSetupReady = true;
    } else if (matchMode === 'single') {
      if (projectSource === 'upload' && setupState.protocol) {
        isSetupReady = true;
      } else if (projectSource === 'library' && selectedLibraryProject) {
        isSetupReady = true;
      }
    }
  }

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState(SESSIONS);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState<string | null>(null);
  const [archiveTargetProject, setArchiveTargetProject] = useState<string>("");
  const [shareModalInfo, setShareModalInfo] = useState<{ url: string; title: string } | null>(null);
  const [showProjectFileSelector, setShowProjectFileSelector] = useState<{ activeField: 'protocol' | 'record' } | null>(null);

  const handleRenameSession = (id: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title: trimmed } : s)));
    setEditingSessionId(null);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("确定要删除该历史任务吗？")) {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSessionId === id) {
        setActiveSessionId(null);
        setCheckState("idle");
        setCheckStep(0);
      }
    }
  };

  const getProjectOptions = () => {
    try {
      const stored = localStorage.getItem("totrial_projects");
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        return parsed.filter(p => p !== "全部");
      }
    } catch (e) {
      console.error(e);
    }
    return ["冠心宁片中保临床方案", "盐酸安罗替尼胶囊"];
  };

  // Synchronize active session if it doesn't belong to the newly selected project
  useEffect(() => {
    const activeSess = sessions.find((s) => s.id === activeSessionId);
    if (selectedProject !== "全部" && activeSess && activeSess.project !== selectedProject) {
      setActiveSessionId(null);
      setCheckState("idle");
    }
  }, [selectedProject, sessions]);

  useEffect(() => {
    const handleProjectRenamed = () => {
      const actionStr = localStorage.getItem("totrial_rename_project_action");
      if (actionStr) {
        try {
          const { oldName, newName } = JSON.parse(actionStr);
          setSessions((prev) =>
            prev.map((s) => (s.project === oldName ? { ...s, project: newName } : s))
          );
        } catch (e) {
          console.error(e);
        }
      }
    };

    const handleProjectDeleted = () => {
      const actionStr = localStorage.getItem("totrial_delete_project_action");
      if (actionStr) {
        try {
          const { projName } = JSON.parse(actionStr);
          setSessions((prev) =>
            prev.map((s) => (s.project === projName ? { ...s, project: "未分配" } : s))
          );
        } catch (e) {
          console.error(e);
        }
      }
    };

    window.addEventListener("totrial_project_renamed", handleProjectRenamed);
    window.addEventListener("totrial_project_deleted", handleProjectDeleted);
    return () => {
      window.removeEventListener("totrial_project_renamed", handleProjectRenamed);
      window.removeEventListener("totrial_project_deleted", handleProjectDeleted);
    };
  }, []);

  const triggerUpload = (context: "protocol" | "record") => {
    setActiveUploadContext(context);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && activeUploadContext) {
      setSetupState((s) => ({ ...s, [activeUploadContext]: true }));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setActiveUploadContext(null);
  };

  const handleStartupFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const newFiles = files.map((f: File) => {
        const name = f.name;
        const size = (f.size / (1024 * 1024)).toFixed(1) + "MB";
        const type: "record" | "scheme" = (name.includes("病历") || name.includes("住院") || name.includes("门诊") || name.includes("摘要") || name.includes("检查") || name.includes("郝") || name.includes("患者")) ? "record" : "scheme";
        return { name, size, type };
      });
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
    if (startupFileInputRef.current) {
      startupFileInputRef.current.value = "";
    }
  };

  const handleStartupSend = () => {
    if (uploadedFiles.length === 0 && !startupInput.trim()) {
      alert("请先上传患者病历和试验方案，或输入匹配要求，我们即可开始匹配校验。");
      return;
    }

    // 智能匹配目标方案与受试者
    let matchProject = "2型糖尿病 III 期";
    let pName = "郝彬";
    let pDisease = "2型糖尿病";
    
    const hasAnluo = uploadedFiles.some(f => f.name.includes("安罗") || f.name.includes("肺癌")) || startupInput.includes("安罗") || startupInput.includes("肺癌") || startupInput.includes("林国强");
    const hasGuan = uploadedFiles.some(f => f.name.includes("冠心宁") || f.name.includes("心绞痛") || f.name.includes("心血管")) || startupInput.includes("冠心宁") || startupInput.includes("心绞痛") || startupInput.includes("心血管");
    
    if (hasAnluo) {
      matchProject = "盐酸安罗替尼胶囊";
      pName = "林国强";
      pDisease = "非小细胞肺癌";
    } else if (hasGuan) {
      matchProject = "冠心宁片中保临床方案";
      pName = "郝彬";
      pDisease = "稳定性心绞痛";
    } else {
      matchProject = "2型糖尿病临床入排精准核查项目";
      pName = "郝彬";
      pDisease = "2型糖尿病";
    }

    // 组装高保真受试者数据
    const patientObj = {
      fullName: pName,
      name: pName === "郝彬" ? "HB" : (pName === "林国强" ? "LGQ" : "WDH"),
      gender: pName === "顾敏" ? "女" : "男",
      age: pName === "郝彬" ? 62 : (pName === "林国强" ? 58 : 45),
      dob: pName === "郝彬" ? "1964-08" : (pName === "林国强" ? "1968-09" : "1981-11"),
      disease: pDisease,
      phone: pName === "郝彬" ? "138****9207" : "139****1122",
      idCard: pName === "郝彬" ? "110101196408234567" : "310101196809153456",
      source: "机构转介",
      referrer: "张医生",
      fileName: uploadedFiles.find(f => f.type === "record")?.name || `${pName}_住院病历.pdf`,
      fileSize: uploadedFiles.find(f => f.type === "record")?.size || "1.8MB",
    };

    setModalMatchMode(matchProject.includes("全库") ? "full" : "single");
    setModalSelectedLibraryProject(matchProject);
    setUploadedRecordFile({ 
      name: patientObj.fileName, 
      size: patientObj.fileSize 
    });

    if (startupInput.trim()) {
      setScreeningChatMessages([
        { sender: "user" as const, text: startupInput.trim() }
      ]);
    } else {
      setScreeningChatMessages([]);
    }

    handleWizardSubmitAndStartMatch(patientObj);
    
    // 重置状态
    setStartupInput("");
    setUploadedFiles([]);
  };

  const renderProjectChecklist = (projectKey: string) => {
    // Standardize key
    const normalizedKey = projectKey.includes("冠心宁") ? "冠心宁" : (projectKey.includes("替尔泊肽") ? "替尔泊肽" : (projectKey.includes("安罗替尼") ? "安罗替尼" : "冠心宁"));

    if (normalizedKey === "冠心宁") {
      return (
        <div className="divide-y divide-gray-100 bg-white">
          <div className="px-3 py-2.5 grid grid-cols-12 items-center text-[11.5px] hover:bg-slate-50/50">
            <div className="col-span-3 font-medium text-gray-800">1. 入选：年龄基准</div>
            <div className="col-span-6 text-gray-500">年龄 18-75 周岁（签署知情同意书当天）</div>
            <div className="col-span-2 text-center text-gray-700">72 岁</div>
            <div className="col-span-1 text-right text-green-600 font-bold">符合</div>
          </div>
          <div className="px-3 py-2.5 grid grid-cols-12 items-center text-[11.5px] hover:bg-slate-50/50">
            <div className="col-span-3 font-medium text-gray-800">2. 入选：确诊标准</div>
            <div className="col-span-6 text-gray-500">符合稳定性心绞痛诊断标准，且具有典型心电图ST段压低事实</div>
            <div className="col-span-2 text-center text-gray-700">ST-T段压低 0.15mV</div>
            <div className="col-span-1 text-right text-green-600 font-bold">符合</div>
          </div>
          <div className="px-3 py-2.5 grid grid-cols-12 items-center text-[11.5px] hover:bg-slate-50/50">
            <div className="col-span-3 font-medium text-gray-800">3. 排除：心衰排查</div>
            <div className="col-span-6 text-gray-500">排除重度心功能不全（NYHA分级 &gt;= III 级）</div>
            <div className="col-span-2 text-center text-gray-700">NYHA II级 (LVEF 55%)</div>
            <div className="col-span-1 text-right text-green-600 font-bold">符合</div>
          </div>
          <div className="px-3 py-2.5 grid grid-cols-12 items-center text-[11.5px] hover:bg-slate-50/50">
            <div className="col-span-3 font-medium text-gray-800">4. 排除：急性事件</div>
            <div className="col-span-6 text-gray-500">近 6 个月内无心肌梗死、不稳定性心绞痛或PCI手术史</div>
            <div className="col-span-2 text-center text-gray-700">近 6 个月无急性事件</div>
            <div className="col-span-1 text-right text-green-600 font-bold">符合</div>
          </div>
        </div>
      );
    }

    if (normalizedKey === "替尔泊肽") {
      return (
        <div className="divide-y divide-gray-100 bg-white">
          <div className="px-3 py-2.5 grid grid-cols-12 items-center text-[11.5px] hover:bg-slate-50/50">
            <div className="col-span-3 font-medium text-gray-800">1. 入选：超重/肥胖</div>
            <div className="col-span-6 text-gray-500">BMI &gt;= 27.0 kg/m² 且伴有心血管合并症事实</div>
            <div className="col-span-2 text-center text-gray-700">BMI 28.7</div>
            <div className="col-span-1 text-right text-green-600 font-bold">符合</div>
          </div>
          <div className="px-3 py-2.5 grid grid-cols-12 items-center text-[11.5px] hover:bg-slate-50/50">
            <div className="col-span-3 font-medium text-gray-800">2. 排除：糖尿病控制</div>
            <div className="col-span-6 text-gray-500">排除糖化血红蛋白 HbA1c &gt; 6.5% 的失控状态患者</div>
            <div className="col-span-2 text-center text-gray-700">HbA1c 7.1%</div>
            <div className="col-span-1 text-right text-red-600 font-bold">排除</div>
          </div>
          <div className="px-3 py-2.5 grid grid-cols-12 items-center text-[11.5px] hover:bg-slate-50/50">
            <div className="col-span-3 font-medium text-gray-800">3. 排除：胃肠动力</div>
            <div className="col-span-6 text-gray-500">既往有重度胃瘫、胃潴留或严重胃肠动力障碍病史</div>
            <div className="col-span-2 text-center text-gray-700">重度胃潴留病史</div>
            <div className="col-span-1 text-right text-red-600 font-bold">排除</div>
          </div>
        </div>
      );
    }

    // Default or 安罗替尼
    return (
      <div className="divide-y divide-gray-100 bg-white">
        <div className="px-3 py-2.5 grid grid-cols-12 items-center text-[11.5px] hover:bg-slate-50/50">
          <div className="col-span-3 font-medium text-gray-800">1. 入选：适应症</div>
          <div className="col-span-6 text-gray-500">经组织学或细胞学确诊的非小细胞肺癌（NSCLC）患者</div>
          <div className="col-span-2 text-center text-gray-700">无任何肿瘤诊断</div>
          <div className="col-span-1 text-right text-red-600 font-bold">排除</div>
        </div>
        <div className="px-3 py-2.5 grid grid-cols-12 items-center text-[11.5px] hover:bg-slate-50/50">
          <div className="col-span-3 font-medium text-gray-800">2. 排除：心血管并发症</div>
          <div className="col-span-6 text-gray-500">未受控制的冠心病、不稳定性心绞痛或严重心律失常</div>
          <div className="col-span-2 text-center text-gray-700">心功能II级伴心肌缺血</div>
          <div className="col-span-1 text-right text-red-600 font-bold">排除</div>
        </div>
      </div>
    );
  };

  const renderStartupDialogueWorkspace = () => {
    return (
      <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto hide-scrollbar relative items-center justify-between p-8 min-h-[550px] w-full">
        {/* Background decorative neon glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full bg-blue-100/30 blur-3xl pointer-events-none" />

        {/* Top/Center Hero Area */}
        <div className="w-full max-w-4xl text-center space-y-8 mt-12 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#083190] to-blue-600 flex items-center justify-center text-white shadow-[0_8px_20px_rgba(8,49,144,0.15)]">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
              AI Screening 临床智能筛查
            </h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              上传脱敏病历与试验方案，一键实现临床入排指标精准核查。
            </p>
          </div>

          {/* Preset quick simulation files to experience clinical pairing instantly */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4 w-full">
            <div className="text-xs font-semibold text-slate-400 text-left flex items-center">
              <Database className="w-3.5 h-3.5 mr-1" />
              内置临床匹配预设（支持一键体验）
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setUploadedFiles([
                    { name: "郝彬_住院病历.pdf", size: "1.8MB", type: "record" },
                    { name: "2型糖尿病III期临床方案协议.pdf", size: "3.5MB", type: "scheme" }
                  ]);
                }}
                className="flex items-center justify-between text-left p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 text-xs text-slate-600 font-medium transition-all group shadow-sm"
              >
                <div className="flex items-center space-x-3 truncate">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 text-[#083190] flex items-center justify-center text-xs font-bold">糖</span>
                  <span className="truncate text-slate-700 font-semibold group-hover:text-[#083190]">【糖尿病】 郝彬_住院病历 + III期方案</span>
                </div>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-100/50 px-2.5 py-1 rounded-full flex-shrink-0">一键体验</span>
              </button>

              <button
                onClick={() => {
                  setUploadedFiles([
                    { name: "林国强_非小细胞肺癌胸部CT报告.docx", size: "840KB", type: "record" },
                    { name: "盐酸安罗替尼临床试验方案.pdf", size: "4.1MB", type: "scheme" }
                  ]);
                }}
                className="flex items-center justify-between text-left p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 text-xs text-slate-600 font-medium transition-all group shadow-sm"
              >
                <div className="flex items-center space-x-3 truncate">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">肺</span>
                  <span className="truncate text-slate-700 font-semibold group-hover:text-indigo-700">【肺癌】 林国强_胸部CT + 安罗替尼方案</span>
                </div>
                <span className="text-[10px] text-indigo-600 font-bold bg-indigo-100/50 px-2.5 py-1 rounded-full flex-shrink-0">一键体验</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom dialog box region - Strictly bottom aligned as required */}
        <div className="w-full max-w-4xl mt-8 mb-4 relative z-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
          {/* Hidden native input for startup files */}
          <input
            type="file"
            ref={startupFileInputRef}
            onChange={handleStartupFileChange}
            className="hidden"
            multiple
            accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.png"
          />

          {/* High fidelity interactive dialog container */}
          <div className="bg-white border border-slate-200 focus-within:border-[#083190] focus-within:ring-4 focus-within:ring-blue-100/60 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.04)] transition-all p-4 flex flex-col space-y-3 relative text-left">
            
            {/* 1. Prompt bar inside or above the text area */}
           
             

            {/* 2. Visual rendering of uploaded files with clear remove actions */}
            {uploadedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1 border-b border-slate-100 pb-2">
                {uploadedFiles.map((file, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold animate-in zoom-in-95 duration-200 ${
                      file.type === "record" 
                        ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                        : "bg-purple-50 border-purple-100 text-purple-800"
                    }`}
                  >
                    <span>{file.type === "record" ? "📂" : "🔬"}</span>
                    <span className="max-w-[180px] truncate">{file.name}</span>
                    <span className="text-[10px] opacity-60 font-mono">({file.size})</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
                      }}
                      className="w-4 h-4 rounded-full hover:bg-black/10 flex items-center justify-center text-[10px] font-bold transition-all ml-1"
                      title="移除文件"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 3. Text area with required custom behavior */}
            <div className="relative">
              <textarea
                rows={2}
                value={startupInput}
                onChange={(e) => setStartupInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleStartupSend();
                  }
                }}
                placeholder="描述初筛需求或上传文件，快速开展受试者预筛选"
                className="w-full resize-none bg-transparent outline-none text-slate-800 placeholder-slate-400 text-xs leading-relaxed py-1"
              />
            </div>

            {/* 4. Controls toolbar - Left: Upload, Right: Model selector & Send */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 relative">
              {/* Left side: Upload entry - Triggers local system file manager */}
              <button
                onClick={() => startupFileInputRef.current?.click()}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-800 transition-all text-xs font-bold shadow-sm"
              >
                <Plus className="w-4 h-4 text-[#083190]" />
                <span>上传</span>
              </button>

              {/* Right side controls: Model select dropdown & Send action */}
              <div className="flex items-center space-x-2">
                {/* Model Dropdown Wrapper */}
                <div className="relative">
                  <button
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all text-xs font-bold"
                  >
                   
                    <span>{activeModel}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isModelDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Beautiful absolutely positioned model selection panel */}
                  {isModelDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsModelDropdownOpen(false)} 
                      />
                      <div className="absolute right-0 bottom-full mb-2 w-52 bg-white border border-slate-100 rounded-xl shadow-xl z-50 p-1 animate-in slide-in-from-bottom-2 duration-150">
                        <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 border-b border-slate-50 mb-1">
                          选择 AI 临床筛查大模型
                        </div>
                        {[
                          { name: "TotrialDriver3.0", desc: "高精度临床基准模型" },
                          { name: "Qwen-3.7-Max", desc: "中文医疗深度增强" },
                          { name: "DeepSeek-V4-Pro", desc: "逻辑链路极速推理" }
                        ].map((m) => (
                          <button
                            key={m.name}
                            onClick={() => {
                              setActiveModel(m.name);
                              setIsModelDropdownOpen(false);
                            }}
                            className={`w-full flex flex-col items-start text-left px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                              activeModel === m.name 
                                ? "bg-blue-50 text-[#083190] font-bold" 
                                : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>{m.name}</span>
                              {activeModel === m.name && <Check className="w-3.5 h-3.5 text-[#083190]" />}
                            </div>
                            <span className="text-[10px] text-slate-400 font-normal mt-0.5 leading-snug">{m.desc}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Send Action Trigger */}
                <button
                  onClick={handleStartupSend}
                  className="flex items-center space-x-1 px-4 py-1.5 bg-[#083190] hover:bg-blue-800 text-white font-bold rounded-lg transition-all text-xs"
                >
                  <span>发送</span>
                  <Sparkles className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleSetupStartCheck = () => {
    setActiveSessionId("session-s-1");
    handleStartCheck();
  };

  const handleWizardSubmitAndStartMatch = (patientData: any) => {
    const isFullMatch = modalMatchMode === "full";
    const selectedProjName = selectedProject !== "全部" 
      ? selectedProject 
      : (isFullMatch ? "全库匹配" : (modalSelectedLibraryProject || "2型糖尿病临床入排精准核查项目"));
    
    const newSessionId = `session-s-${Date.now()}`;
    const newSessionObj = {
      id: newSessionId,
      title: `${patientData.disease || "未知疾病"} - 智能筛查匹配`,
      desc: `患者：${patientData.fullName}`,
      project: selectedProjName,
      patientData: { ...patientData },
      artifacts: {
        uploaded: [
          { id: `u-${Date.now()}-1`, name: uploadedRecordFile?.name || "患者病历.pdf", type: "pdf" as const },
          { id: `u-${Date.now()}-2`, name: isFullMatch ? "全库 19 个项目协议方案" : `${selectedProjName}_临床试验方案.pdf`, type: "pdf" as const },
        ],
        generated: [
          { id: `g-${Date.now()}`, name: "AI_筛查评估研报.pdf", type: "pdf" as const },
        ],
      },
    };

    setSessions((prev) => [newSessionObj, ...prev]);
    setHasCreatedTask(true);
    setSidebarTab("screening");
    setActiveSessionId(newSessionId);
    setShowBuildModal(false);
    handleStartCheck();
  };

  const handleStartCheck = () => {
    setCheckState("thinking");
    setCheckStep(1);
    
    // Simulate processing steps
    setTimeout(() => setCheckStep(2), 1500);
    setTimeout(() => setCheckStep(3), 3000);
    setTimeout(() => setCheckStep(4), 4500);
    setTimeout(() => {
      setCheckState("completed");
      setCheckStep(5);
    }, 6000);
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const displayArtifacts = activeSession
    ? {
        ...activeSession.artifacts,
        generated:
          checkState === "completed" ? activeSession.artifacts.generated : [],
      }
    : undefined;

  // Filter sessions by selected project and search query
  const filteredSessions = sessions.filter((session) => {
    const matchesProject = selectedProject === "全部" || session.project === selectedProject;
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesSearch;
  });

  const sortedSessions = [...filteredSessions].sort((a, b) => {
    const aPinned = (a as any).isPinned ? 1 : 0;
    const bPinned = (b as any).isPinned ? 1 : 0;
    return bPinned - aPinned;
  });

  return (
    <div className="flex bg-white h-full rounded-xl overflow-hidden font-sans relative">
      {/* Left Sidebar */}
      <div className={`${isSidebarOpen ? "w-64" : "w-0"} transition-all duration-300 bg-white border-r border-gray-100/60 flex flex-col shrink-0 relative z-20 overflow-hidden`}>
        {/* Workspace Sections Navigation with New Task button */}
        <div className="p-4 w-64 shrink-0">
          <button
            onClick={() => {
              setActiveSessionId(null);
              setCheckState("idle");
              setCheckStep(0);
              setSidebarTab("screening");
              setBuildStep("upload");
              setUploadedRecordFile(null);
            }}
            className="w-full bg-[#2b64e3] hover:bg-[#1a4eb8] text-white rounded-md py-2.5 text-[14px] font-bold flex items-center justify-center transition-colors shadow-sm"
          >
            <Plus className="w-[18px] h-[18px] mr-1.5" />
            新建任务
          </button>
        </div>

        {/* Tab Buttons for AI Screenings and Patients */}
        <div className="px-4 pb-2 w-64 space-y-1 shrink-0">
          {/* AI智能筛选 */}
          <button
            onClick={() => {
              setSidebarTab("screening");
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-bold rounded-lg transition-all border ${
              sidebarTab === "screening"
                ? "bg-blue-50/60 text-[#2b64e3] border-blue-100"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent"
            }`}
          >
            <div className="flex items-center">
              <Sparkles className={`w-4 h-4 mr-2 ${sidebarTab === "screening" ? "text-[#2b64e3]" : "text-gray-400"}`} />
              <span>AI智能筛选</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${sidebarTab === "screening" ? "bg-blue-200/60 text-[#2b64e3] font-bold" : "bg-gray-100 text-gray-500"}`}>
              {sessions.length}项
            </span>
          </button>

          {/* 受试者病历库 */}
          <button
            onClick={() => {
              setSidebarTab("patients");
              setActiveSessionId(null);
              setCheckState("idle");
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-bold rounded-lg transition-all border ${
              sidebarTab === "patients"
                ? "bg-blue-50/60 text-[#2b64e3] border-blue-100"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent"
            }`}
          >
            <div className="flex items-center">
              <Database className={`w-4 h-4 mr-2 ${sidebarTab === "patients" ? "text-[#2b64e3]" : "text-gray-400"}`} />
              <span>受试者病历库</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${sidebarTab === "patients" ? "bg-blue-200/60 text-[#2b64e3] font-bold" : "bg-gray-100 text-gray-500"}`}>
              {patients.length}例
            </span>
          </button>
        </div>

        {/* Search Input with light top border and gap */}
        <div className="border-t border-gray-100/80 pt-4 pb-3 px-4 w-64 mt-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索历史任务"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-200/80 focus:border-[#2b64e3] focus:bg-white rounded text-[13px] outline-none transition-all placeholder:text-gray-400"
            />
          </div>
        </div>
        <div className="px-4 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-64">
          历史任务
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1 hide-scrollbar w-64">
          {sortedSessions.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setActiveSessionId(item.id);
                setCheckState("completed");
                setCheckStep(4);
              }}
              className={`group px-3 py-2 text-[13px] rounded-lg cursor-pointer transition-colors font-medium flex flex-col items-start relative ${item.id === activeSessionId ? "bg-blue-50/60 text-[#083190] border border-blue-100" : "text-gray-700 hover:bg-gray-50 border border-transparent"}`}
            >
              <div className="flex items-center justify-between w-full min-w-0 relative">
                {editingSessionId === item.id ? (
                  <div className="flex items-center space-x-1 w-full" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editingSessionTitle}
                      onChange={(e) => setEditingSessionTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameSession(item.id, editingSessionTitle);
                        if (e.key === "Escape") setEditingSessionId(null);
                      }}
                      className="flex-1 bg-white border border-blue-400 px-1 py-0.5 text-[12px] rounded outline-none font-sans"
                      autoFocus
                    />
                    <button
                      onClick={() => handleRenameSession(item.id, editingSessionTitle)}
                      className="p-0.5 text-green-600 hover:bg-green-50 rounded"
                      title="保存"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingSessionId(null)}
                      className="p-0.5 text-red-500 hover:bg-red-50 rounded"
                      title="取消"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start truncate min-w-0 flex-1 pr-1">
                      <UserPlus className={`w-3.5 h-3.5 mr-2 mt-0.5 shrink-0 ${item.id === activeSessionId ? "text-[#083190]" : "text-gray-400"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center min-w-0">
                          {(item as any).isPinned && (
                            <Pin className="w-3 h-3 text-[#083190] mr-1 shrink-0 rotate-45" />
                          )}
                          <div className="truncate text-[13px] font-bold text-gray-800">{item.title}</div>
                        </div>
                        <div className="truncate text-[11px] text-gray-500 mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                    
                    <div className={`flex items-center space-x-0.5 shrink-0 pl-2 group-hover:opacity-100 opacity-0 transition-opacity absolute right-0 top-1/2 -translate-y-1/2 rounded-md p-0.5 ${item.id === activeSessionId ? "bg-blue-50/90" : "bg-white/90 group-hover:bg-gray-50/90"}`}>
                      {/* Pin Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSessions(prev => prev.map(s => s.id === item.id ? { ...s, isPinned: !(s as any).isPinned } : s));
                        }}
                        className={`p-0.5 rounded hover:bg-gray-200/80 ${(item as any).isPinned ? "text-[#083190]" : "text-gray-400 hover:text-[#083190]"}`}
                        title={(item as any).isPinned ? "取消置顶" : "置顶"}
                      >
                        <Pin className="w-3 h-3" />
                      </button>

                      {/* Rename Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSessionId(item.id);
                          setEditingSessionTitle(item.title);
                        }}
                        className="p-0.5 rounded hover:bg-gray-200/80 text-gray-400 hover:text-[#083190]"
                        title="重命名"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>

                      {/* Archive Button */}
                      {(!item.project || item.project === "未归档") && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setArchiveTargetProject("");
                            setShowArchiveModal(item.id);
                          }}
                          className="p-0.5 rounded hover:bg-gray-200/80 text-gray-400 hover:text-[#083190]"
                          title="归档"
                        >
                          <FolderOpen className="w-3 h-3" />
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDeleteSession(item.id, e)}
                        className="p-0.5 rounded hover:bg-gray-200/80 text-gray-400 hover:text-red-500"
                        title="删除"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center justify-between w-full mt-1">
                <span className="text-[10px] bg-blue-50/80 text-blue-700 px-1.5 py-0.5 rounded font-medium shrink-0 border border-blue-100/30">
                  {item.project || "未归档"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white border border-gray-200 border-l-0 py-3 px-1 rounded-r-md shadow-sm text-gray-400 hover:text-[#083190] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Main Content */}
      <div className="flex-1 bg-slate-50/30 flex flex-row overflow-hidden relative">
        <div className="flex-1 flex flex-col overflow-y-auto hide-scrollbar relative">
          {activeSession && (
          <div className="px-6 py-3 border-b border-gray-100/60 flex items-center justify-between bg-white z-10 shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center space-x-3">
              <span className="text-[16px] font-bold text-gray-800 tracking-wide">{activeSession.title}</span>
              <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-100/40 px-2 py-0.5 rounded-lg font-bold">
                {activeSession.project || "未归档"}
              </span>
            </div>
            
            {/* Toolbar: Search, Share, History, Document Sidebar Toggle */}
            <div className="flex items-center space-x-1 bg-gray-50/60 p-1 rounded-lg border border-gray-100">
              <div className="flex items-center">
                {isSearchOpen ? (
                  <div className="flex items-center bg-white border border-gray-200 rounded px-2 py-0.5 animate-in slide-in-from-right duration-200">
                    <Search className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
                    <input
                      type="text"
                      autoFocus
                      value={dialogSearchQuery}
                      onChange={(e) => setDialogSearchQuery(e.target.value)}
                      placeholder="搜索对话..."
                      className="w-24 bg-transparent text-[12px] outline-none py-0.5"
                    />
                    <button
                      onClick={() => {
                        setIsSearchOpen(false);
                        setDialogSearchQuery("");
                      }}
                      className="ml-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-1.5 text-gray-500 hover:text-[#083190] hover:bg-white rounded transition-all"
                    title="搜索对话内容"
                  >
                    <Search className="w-[16px] h-[16px]" />
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  if (activeSession) {
                    setShareModalInfo({
                      url: `https://totrial.com/share/screening/${activeSession.id}`,
                      title: activeSession.title
                    });
                  }
                }}
                className="p-1.5 text-gray-500 hover:text-[#083190] hover:bg-white rounded transition-all"
                title="分享对话"
              >
                <Share2 className="w-[16px] h-[16px]" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  className={`p-1.5 rounded transition-all ${isHistoryOpen ? 'bg-white text-[#083190] shadow-sm' : 'text-gray-500 hover:text-[#083190] hover:bg-white'}`}
                  title="历史任务"
                >
                  <Clock className="w-[16px] h-[16px]" />
                </button>

                <AnimatePresence>
                  {isHistoryOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsHistoryOpen(false)}></div>
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-150 py-2 z-50 text-left animate-in fade-in duration-150"
                      >
                        <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                          <span className="text-[12px] text-gray-500 font-bold">
                            历史提问 (3)
                          </span>
                          <button onClick={() => setIsHistoryOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="py-1">
                          <div className="px-4 py-2 text-[12px] text-gray-700 hover:bg-gray-50 cursor-pointer truncate font-medium">
                            临床试验方案设计依据是什么？
                          </div>
                          <div className="px-4 py-2 text-[12px] text-gray-700 hover:bg-gray-50 cursor-pointer truncate font-medium">
                            帮我梳理GCP临床试验规范关键要点。
                          </div>
                          <div className="px-4 py-2 text-[12px] text-gray-700 hover:bg-gray-50 cursor-pointer truncate font-medium">
                            2期临床试验患者筛选的要点是什么？
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {!activeSessionId && checkState === "idle" && (
          <div className="flex-1 flex flex-col bg-[#f8fafc] overflow-hidden w-full">
            {sidebarTab === "patients" ? (
              /* Full Screen Patient Database view */
              <div className="flex-1 flex flex-col bg-white overflow-hidden p-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5 shrink-0">
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-950 flex items-center">
                      <Database className="w-5 h-5 text-[#083190] mr-2" />
                      受试者病历库
                    </h2>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-4 shrink-0">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                      placeholder="输入姓名、主要诊断等进行全局搜索过滤..."
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#083190] transition-all"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none font-medium text-gray-700 focus:bg-white focus:border-[#083190]"
                  >
                    <option value="全部">所有诊断类型</option>
                    {Array.from(new Set(patients.map(p => p.disease))).map(dis => (
                      <option key={dis} value={dis}>{dis}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar space-y-3">
                  {patients
                    .filter(p => p.fullName.toLowerCase().includes(filterName.toLowerCase()) || p.disease.toLowerCase().includes(filterName.toLowerCase()))
                    .filter(p => filterSource === "全部" || p.disease === filterSource)
                    .map(p => (
                      <div 
                        key={p.id} 
                        className="bg-white border border-slate-100 hover:border-blue-100 rounded-2xl p-5 flex items-center justify-between transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] group relative overflow-hidden"
                      >
                        {/* Status bar */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${p.gender === '男' ? 'bg-blue-500/20' : 'bg-pink-500/20'}`} />
                        
                        <div className="flex items-center space-x-6 flex-1">
                          {/* Avatar Circle */}
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm shrink-0 ${p.gender === '男' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                            {p.fullName[0]}
                          </div>

                          <div className="grid grid-cols-4 gap-6 flex-1">
                            {/* Basic Info */}
                            <div className="col-span-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-[15px] font-bold text-slate-900">{p.fullName}</span>
                                <span className={`px-1.5 py-0.5 text-[9px] rounded-full font-bold uppercase ${p.gender === '男' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                  {p.gender} · {p.age}岁
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 mt-1 font-mono">{p.id}</div>
                            </div>

                            {/* Diagnosis */}
                            <div className="col-span-1">
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">主要诊断</div>
                              <div className="text-[13px] font-bold text-slate-700 truncate flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2" />
                                {p.disease}
                              </div>
                            </div>

                            {/* Record File */}
                            <div className="col-span-1">
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">病历档案</div>
                              <div className="inline-flex items-center space-x-1.5 bg-slate-50/50 px-2 py-1 rounded-lg text-slate-600 text-[11px] max-w-full">
                                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[120px]">{p.fileName || `${p.fullName}_病历.pdf`}</span>
                              </div>
                            </div>

                            {/* Contact */}
                            <div className="col-span-1">
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">联系电话</div>
                              <div className="text-[12px] font-medium text-slate-600 font-mono tracking-tight">{p.phone}</div>
                            </div>
                          </div>
                        </div>

                        {/* Action Column */}
                        <div className="flex items-center space-x-2 pl-6 ml-6 border-l border-slate-50">
                          <button
                            onClick={() => setSelectedProfilePatient(p)}
                            className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                            title="受试者画像"
                          >
                            <User className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedTracePatient(p)}
                            className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                            title="溯源追踪"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setFormName(p.fullName);
                              setFormShortName(p.name);
                              setFormDob(p.dob);
                              setFormAge(p.age.toString());
                              setFormGender(p.gender);
                              setFormDisease(p.disease);
                              setFormPhone(p.phone);
                              setFormIdCard(p.idCard);
                              setFormSource(p.source);
                              setFormReferrer(p.referrer);
                              setUploadedRecordFile({ name: p.fileName || `${p.fullName}_住院病历摘要.pdf`, size: p.fileSize || "1.6MB" });
                              setSidebarTab("screening");
                              setCheckState("idle");
                            }}
                            className="px-4 py-2 bg-[#083190] hover:bg-blue-900 text-white rounded-xl text-[12px] font-bold transition-all shadow-sm shadow-blue-900/10"
                          >
                            重新筛查
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              /* WorkBuddy Greeting Screen */
              true ? renderStartupDialogueWorkspace() : false ? (
                <div className="flex-1 flex flex-col bg-[#f8fafc] overflow-y-auto p-8 relative items-center justify-center min-h-[500px]">
                  {/* Visual Accent Circle Pattern background */}
                  <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-50/40 blur-3xl pointer-events-none" />

                  <div className="w-full max-w-2xl text-center space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
                    {/* Premium Brand Emblem */}
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#083190] to-blue-600 flex items-center justify-center text-white shadow-[0_8px_24px_rgba(8,49,144,0.18)]">
                      <Sparkles className="w-8 h-8 animate-pulse" />
                    </div>

                    {/* Catchy Slogan Headers */}
                    <div className="space-y-3">
                      <h1 className="text-3xl font-black text-gray-950 tracking-tight leading-tight">
                        AI Screening 临床智能筛查
                      </h1>
                      <p className="text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
                        基于 GCP 指南级多维度对准，独创对话流匹配终端。一次只问一件事，提供最精细的入排条件校验。
                      </p>
                    </div>

                    {/* Recommendation Card / Fast Actions */}
                    <div className="bg-white border border-gray-150/70 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4 text-left">
                      <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
                        <div className="w-1.5 h-3.5 bg-[#083190] rounded" />
                        <h3 className="text-xs font-black text-gray-950 uppercase tracking-wider">
                          推荐一键载入临床筛查方案对话
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Presets */}
                        <button
                          onClick={() => {
                            const id = "session-s-3";
                            setActiveSessionId(id);
                            setSidebarTab("screening");
                          }}
                          className="p-4 rounded-xl border border-blue-150 bg-blue-50/30 hover:bg-blue-50/60 hover:border-blue-400 hover:shadow-sm transition-all text-left group cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                              推荐首选
                            </span>
                            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                          <h4 className="text-xs font-black text-gray-950 mb-1">
                            2型糖尿病 III 期
                          </h4>
                          <p className="text-[10.5px] text-gray-500 line-clamp-2 leading-relaxed">
                            对标 12 项代谢限值红线条件，适合郝彬病历。
                          </p>
                        </button>

                        <button
                          onClick={() => {
                            const id = "session-s-1";
                            setActiveSessionId(id);
                            setSidebarTab("screening");
                          }}
                          className="p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/10 transition-all text-left group cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                              肿瘤方向
                            </span>
                            <ArrowRightLeft className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                          <h4 className="text-xs font-black text-gray-950 mb-1">
                            盐酸安罗替尼
                          </h4>
                          <p className="text-[10.5px] text-gray-500 line-clamp-2 leading-relaxed">
                            多中心肺癌研究，核对咯血与体能评级。
                          </p>
                        </button>

                        <button
                          onClick={() => {
                            const id = "session-s-2";
                            setActiveSessionId(id);
                            setSidebarTab("screening");
                          }}
                          className="p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/10 transition-all text-left group cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                              心血管方向
                            </span>
                            <ArrowRightLeft className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                          <h4 className="text-xs font-black text-gray-950 mb-1">
                            冠心宁片中保
                          </h4>
                          <p className="text-[10.5px] text-gray-500 line-clamp-2 leading-relaxed">
                            评估稳定性心绞痛与心功能及肝肾指标。
                          </p>
                        </button>
                      </div>

                      {/* Quick Manual Entry */}
                      <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="text-gray-500">
                          或者是上传一份新的本地患者脱敏病历，我们将即刻配置对话对齐端：
                        </div>
                        <button
                          onClick={() => {
                            setFormName("");
                            setFormShortName("");
                            setFormDob("");
                            setFormAge("");
                            setFormGender("男");
                            setFormDisease("");
                            setFormPhone("");
                            setFormIdCard("");
                            setFormSource("机构转介");
                            setFormReferrer("");
                            setUploadedRecordFile(null);
                            setBuildStep("upload");
                            setShowBuildModal(true);
                          }}
                          className="px-3 py-1.5 bg-[#083190] hover:bg-blue-800 text-white rounded-lg font-bold transition-all shadow-sm shrink-0 flex items-center"
                        >
                          <Upload className="w-3.5 h-3.5 mr-1" />
                          上传患者病历建档
                        </button>
                      </div>
                    </div>

                    {/* Minimalist Footnote */}
                    
                  </div>
                </div>
              ) : (
                /* Beautiful Dialogue/Chat Workspace in configuration state */
                <div className="flex-1 flex flex-col bg-slate-50/30 overflow-hidden relative">
                {/* Chat Header inside feed */}
                <div className="px-6 py-4 bg-white border-b border-gray-150 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                  <div>
                    <h2 className="text-base font-extrabold text-gray-950 flex items-center tracking-tight">
                      <Sparkles className="w-4.5 h-4.5 text-[#083190] mr-2 animate-pulse" />
                      智能匹配筛查对话终端
                    </h2>
                    <p className="text-[11px] text-gray-500 mt-0.5">请选择或上传患者病历、选定比对方案，然后开启 AI 精准核查匹配分析流</p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-[#083190] text-[10.5px] font-bold border border-blue-100/40">
                      <Database className="w-3 h-3 mr-1" />
                      受试者库：{patients.length}例
                    </span>
                   
                  </div>
                </div>

                {/* Chat Container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Interactive Configuration Card */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.015)] max-w-3xl mx-auto w-full space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
                    {/* Integrated AI Instruction Banner at the top of the card */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-gray-100/80">
                      <div className="flex items-center space-x-2 mb-1.5">
                        <Sparkles className="w-4 h-4 text-[#083190]" />
                        <h4 className="text-xs font-extrabold text-[#083190] tracking-tight">医学 AI 智能配对指南</h4>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        您好！请在此配置临床筛查任务。在下方<b>选择患者脱敏病历</b>并<b>指定需要匹配的临床试验方案</b>。开启智能匹配后，AI将即时完成实体数据提取、匹配度计算，并输出最终核查匹配报告。
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
                      <Sparkles className="w-4.5 h-4.5 text-[#083190]" />
                      <h3 className="text-sm font-bold text-gray-800">新建临床匹配筛选对标任务</h3>
                    </div>

                    {/* Step 1: Record Select/Upload */}
                    <div className="space-y-3">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase">1. 选择患者脱敏病历记录</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setBuildStep("upload")}
                          className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${buildStep === "upload" ? "border-[#083190] bg-blue-50/40 text-[#083190]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                        >
                          从受试者病历库选择
                        </button>
                        <button
                          onClick={() => setBuildStep("form")}
                          className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${buildStep === "form" ? "border-[#083190] bg-blue-50/40 text-[#083190]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                        >
                          上传新病历文件
                        </button>
                      </div>

                      {buildStep === "upload" ? (
                        <div className="space-y-2">
                          <p className="text-[10.5px] text-gray-500 font-medium">请下拉选择一名受试者病历：</p>
                          <select
                            value={patients.find(p => p.fullName === formName)?.id || ""}
                            onChange={(e) => {
                              const selectedId = e.target.value;
                              const p = patients.find(pat => pat.id === selectedId);
                              if (p) {
                                setFormName(p.fullName);
                                setFormShortName(p.name);
                                setFormDob(p.dob);
                                setFormAge(p.age.toString());
                                setFormGender(p.gender);
                                setFormDisease(p.disease);
                                setFormPhone(p.phone);
                                setFormIdCard(p.idCard);
                                setFormSource(p.source);
                                setFormReferrer(p.referrer);
                                setUploadedRecordFile({ name: p.fileName || `${p.fullName}_住院病历摘要.pdf`, size: p.fileSize || "1.6MB" });
                              } else {
                                setFormName("");
                                setUploadedRecordFile(null);
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 rounded-xl text-xs bg-white text-gray-800 font-bold outline-none shadow-sm"
                          >
                            <option value="">-- 请选择受试者病历 --</option>
                            {patients.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.fullName} ({p.gender}/{p.age}岁) - {p.disease}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                             onClick={() => {
                               setFormName("郝彬");
                               setFormShortName("H*");
                               setFormDob("1964-03");
                               setFormAge("62");
                               setFormGender("男");
                               setFormDisease("稳定性心绞痛");
                               setFormPhone("139****5827");
                               setFormIdCard("310101196403153827");
                               setUploadedRecordFile({ name: "郝彬_住院病历.pdf", size: "1.8MB" });
                             }}>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs font-bold text-gray-750">点击此处或拖入本地病历文档</p>
                          <p className="text-[10px] text-gray-400 mt-1">支持 PDF / DOCX / 扫描件 (系统将即时自动提取基本数据指标)</p>
                        </div>
                      )}

                      {uploadedRecordFile && (
                        <div className="p-3 bg-gray-50 border border-gray-150 rounded-xl flex items-center justify-between animate-in zoom-in-95 duration-150">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 shrink-0 font-bold text-xs">PDF</div>
                            <div>
                              <div className="text-xs font-bold text-gray-800">{uploadedRecordFile.name}</div>
                              <div className="text-[10px] text-gray-400 font-medium">已选择受试者：{formName} ({formGender}/{formAge}岁 - 临床诊断: {formDisease})</div>
                            </div>
                          </div>
                          <button onClick={() => {
                            setUploadedRecordFile(null);
                            setFormName("");
                          }} className="text-gray-400 hover:text-gray-650 p-1 hover:bg-gray-150 rounded-full">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Step 2: Project Select */}
                    <div className="space-y-3 pt-3 border-t border-gray-100">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase">2. 选择需要进行匹配对标的临床试验方案</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => setModalMatchMode("full")}
                          className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${modalMatchMode === "full" ? "border-[#083190] bg-blue-50/40 text-[#083190]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                        >
                           全库智能匹配
                        </button>
                        <button
                          onClick={() => {
                            setModalMatchMode("single");
                            setModalProjectSource("library");
                            setModalSelectedLibraryProject("冠心宁片中保临床方案");
                          }}
                          className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${(modalMatchMode === "single" && modalProjectSource === "library") ? "border-[#083190] bg-blue-50/40 text-[#083190]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                        >
                           选内置项目
                        </button>
                        <button
                          onClick={() => {
                            setModalMatchMode("single");
                            setModalProjectSource("upload");
                            setCustomSchemeFile({ name: "多中心试验协议方案设计.pdf", size: "2.4MB" });
                          }}
                          className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${(modalMatchMode === "single" && modalProjectSource === "upload") ? "border-[#083190] bg-blue-50/40 text-[#083190]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                        >
                           自选上传方案
                        </button>
                      </div>

                      {modalMatchMode === "full" ? (
                        <div className="p-3 bg-blue-50/30 border border-blue-100/50 rounded-xl text-[11px] text-gray-600">
                          💡 <b>全库匹配对标：</b>系统将核查分析该患者病历与库中全部 19 个临床入组项目的对齐度，自动推荐高匹配度项目。
                        </div>
                      ) : modalProjectSource === "library" ? (
                        <select
                          value={modalSelectedLibraryProject}
                          onChange={(e) => setModalSelectedLibraryProject(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white text-gray-800 font-bold"
                        >
                          <option value="冠心宁片中保临床方案">《冠心宁片中保临床方案（稳定性心绞痛研究）》</option>
                          <option value="盐酸安罗替尼胶囊">《盐酸安罗替尼胶囊多中心临床试验研究》</option>
                          <option value="替尔泊肽注射液三期临床研究">《替尔泊肽注射液用于肥胖伴合并症临床方案（SURMOUNT-5）》</option>
                        </select>
                      ) : (
                        <div className="p-3 bg-gray-50 border border-gray-150 rounded-xl flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-700 shrink-0 font-bold text-xs">PDF</div>
                            <div>
                              <div className="text-xs font-bold text-gray-800">{customSchemeFile?.name || "临床研究协议方案.pdf"}</div>
                              <div className="text-[10px] text-gray-400 font-medium">已成功选择临床方案 (2.4MB)</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Step 3: Consent and Trigger */}
                    <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="agreeConsentBox"
                          checked={agreeToRecruitment}
                          onChange={(e) => setAgreeToRecruitment(e.target.checked)}
                          className="w-4 h-4 text-[#083190] border-gray-300 rounded cursor-pointer"
                        />
                        <label htmlFor="agreeConsentBox" className="text-[11px] text-gray-500 font-medium select-none cursor-pointer">
                          我确认已获得患者的医学数据脱敏授权，并同意通过人工智能模型进行对比筛查
                        </label>
                      </div>

                      <button
                        disabled={!uploadedRecordFile}
                        onClick={() => {
                          const patientObj = {
                            fullName: formName || "郝彬",
                            name: formShortName || "H*",
                            gender: formGender,
                            age: parseInt(formAge) || 62,
                            dob: formDob || "1964-03",
                            disease: formDisease || "稳定性心绞痛",
                            phone: formPhone || "139****5827",
                            idCard: formIdCard || "310101196403153827",
                            source: formSource || "机构转介",
                            referrer: formReferrer || "张医生",
                            fileName: uploadedRecordFile?.name || "郝彬_住院病历.pdf",
                            fileSize: uploadedRecordFile?.size || "1.8MB",
                          };
                          if (!patients.some(p => p.fullName === patientObj.fullName)) {
                            setPatients(prev => [patientObj, ...prev]);
                          }
                          handleWizardSubmitAndStartMatch(patientObj);
                        }}
                        className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center shadow-md whitespace-nowrap ${!uploadedRecordFile ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none" : "bg-[#083190] hover:bg-blue-800 text-white hover:-translate-y-0.5 active:translate-y-0"}`}
                      >
                        <Sparkles className="w-4 h-4 mr-1.5" />
                        开始智能匹配
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
          </div>
        )}
          {/* Dynamic Step-by-Step AI Screening Wizard Modal */}
          <AnimatePresence>
              {showBuildModal && (
                <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-100"
                  >
                    {/* Modal Header */}
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
                      <div>
                        <h3 className="text-md font-bold text-gray-800 flex items-center">
                          <Sparkles className="w-5 h-5 text-[#083190] mr-2 animate-pulse" />
                          ✨ AI Screening 智能建档 (新增患者)
                        </h3>
                        <p className="text-[11px] text-gray-500 mt-1">
                          通过深度解析病历，一键建立结构化患者档案，核对并配置进行临床研究精准筛选。
                        </p>
                      </div>
                      <button
                        onClick={() => setShowBuildModal(false)}
                        className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Progress indicator steps bar */}
                    <div className="px-8 py-3 bg-blue-50/30 border-b border-gray-100 flex items-center justify-between text-[12px] shrink-0 font-medium">
                      <div className="flex items-center space-x-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${buildStep === "upload" ? "bg-[#2b64e3] text-white" : (buildStep !== "extracting" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600")}`}>
                          {buildStep !== "upload" && buildStep !== "extracting" ? "✓" : "1"}
                        </span>
                        <span className={buildStep === "upload" || buildStep === "extracting" ? "text-[#2b64e3] font-bold" : "text-green-700"}>
                          上传病历并智能提取
                        </span>
                      </div>
                      <div className="w-12 h-[2px] bg-gray-200 flex-1 mx-4"></div>
                      <div className="flex items-center space-x-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${buildStep === "form" ? "bg-[#2b64e3] text-white" : (buildStep === "project_select" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600")}`}>
                          {buildStep === "project_select" ? "✓" : "2"}
                        </span>
                        <span className={buildStep === "form" ? "text-[#2b64e3] font-bold" : (buildStep === "project_select" ? "text-green-700" : "text-gray-450")}>
                          核对补充患者信息
                        </span>
                      </div>
                      <div className="w-12 h-[2px] bg-gray-200 flex-1 mx-4"></div>
                      <div className="flex items-center space-x-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${buildStep === "project_select" ? "bg-[#2b64e3] text-white" : "bg-gray-200 text-gray-600"}`}>
                          3
                        </span>
                        <span className={buildStep === "project_select" ? "text-[#2b64e3] font-bold" : "text-gray-450"}>
                          配置临床匹配项目
                        </span>
                      </div>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 p-6 overflow-y-auto min-h-[300px] flex flex-col justify-start">
                      
                      {/* Step 1: Uploading record */}
                      {buildStep === "upload" && (
                        <div className="max-w-2xl mx-auto w-full space-y-6 text-center animate-in fade-in duration-200">
                          <div
                            onClick={() => {
                              // Simulate custom upload by pre-filling Haobin's clinical record details
                              setUploadedRecordFile({ name: "郝彬_心内科住院门诊病历摘要.docx", size: "1.8MB" });
                              setBuildStep("extracting");
                            }}
                            className="border-2 border-dashed border-gray-300 hover:border-[#083190] rounded-2xl p-10 cursor-pointer bg-gray-50/50 hover:bg-blue-50/10 transition-all group flex flex-col items-center justify-center"
                          >
                            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform text-[#083190]">
                              <Upload className="w-8 h-8" />
                            </div>
                            <h4 className="text-[16px] font-bold text-gray-800 group-hover:text-[#083190] transition-colors">
                              点击上传患者病历/检查报告 (支持 PDF/图片/Word)
                            </h4>
                            <p className="text-[12px] text-gray-400 mt-2 max-w-md">
                              支持直接拖入文件。AI 将智能结构化脱敏，提取姓名、年龄、诊断、关键化验指标及排病史等细节。
                            </p>
                          </div>

                          <div className="pt-4 font-sans text-left space-y-2">
                            <div className="relative mb-3 flex items-center justify-center">
                              <span className="absolute w-full border-t border-gray-200"></span>
                              <span className="relative bg-white px-4 text-xs font-semibold text-gray-400 uppercase">
                                或者是从库中下拉选择已有病历
                              </span>
                            </div>
                            <select
                              value=""
                              onChange={(e) => {
                                const selectedId = e.target.value;
                                const p = patients.find(pat => pat.id === selectedId);
                                if (p) {
                                  setFormName(p.fullName);
                                  setFormShortName(p.name);
                                  setFormDob(p.dob);
                                  setFormAge(p.age.toString());
                                  setFormGender(p.gender);
                                  setFormDisease(p.disease);
                                  setFormPhone(p.phone);
                                  setFormIdCard(p.idCard);
                                  setFormSource(p.source);
                                  setFormReferrer(p.referrer);
                                  setUploadedRecordFile({ name: p.fileName || `${p.fullName}_住院病历摘要.pdf`, size: p.fileSize || "1.6MB" });
                                  setBuildStep("extracting");
                                }
                              }}
                              className="w-full px-3 py-2.5 border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 rounded-xl text-xs bg-white text-gray-800 font-bold outline-none shadow-sm"
                            >
                              <option value="">-- 从受试者病历库中选择已有病历直接调取 --</option>
                              {patients.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.fullName} ({p.gender}/{p.age}岁) - {p.disease}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Extraction loading simulation */}
                      {buildStep === "extracting" && (
                        <div className="max-w-md mx-auto w-full text-center space-y-6 animate-in fade-in duration-300 py-10">
                          <div className="relative w-20 h-20 mx-auto">
                            <div className="absolute inset-0 border-4 border-blue-50 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-[#083190] rounded-full border-t-transparent animate-spin"></div>
                            <Sparkles className="w-8 h-8 text-[#083190] absolute inset-0 m-auto animate-pulse" />
                          </div>
                          <div>
                            <h4 className="text-[16px] font-bold text-gray-900">AI 智能提取中...</h4>
                            <p className="text-[12px] text-gray-500 mt-2">
                              正在解析《{uploadedRecordFile?.name}》，结构化并匹配医学术语库。
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 text-left font-mono text-[11px] text-gray-600 border border-gray-100 space-y-2">
                            <div className="flex items-center text-green-600 font-bold">
                              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                              [完成] 图像OCR文本脱敏与标准化对齐...
                            </div>
                            <div className="flex items-center text-[#083190] font-bold">
                              <span className="w-2 h-2 rounded-full bg-[#083190] mr-2 animate-spin border border-t-transparent"></span>
                              [进行中] 正在识别基本生命体征与患者信息字段...
                            </div>
                            <div className="flex items-center text-gray-400">
                              <span className="w-2 h-2 rounded-full bg-gray-300 mr-2"></span>
                              [等待] 提取主要疾病诊断、入排指标与核心化验事实...
                            </div>
                          </div>
                          {/* Auto advance simulation */}
                          <ExtractionTimer onComplete={() => {
                            // If they selected something already, keep it, else default to Haobin
                            if (!formName) {
                              setFormName("郝彬");
                              setFormShortName("HB");
                              setFormDob("1964-08");
                              setFormAge("62");
                              setFormGender("男");
                              setFormDisease("心绞痛");
                              setFormPhone("13800009207");
                              setFormIdCard("110101196408234567");
                              setFormSource("机构转介");
                              setFormReferrer("张医生");
                            }
                            setBuildStep("form");
                          }} />
                        </div>
                      )}

                      {/* Step 3: Check & fill form */}
                      {buildStep === "form" && (
                        <div className="max-w-3xl mx-auto w-full animate-in fade-in duration-200">
                          <div className="mb-4 bg-green-50 border border-green-150 rounded-xl p-3 flex items-center space-x-3">
                            <div className="bg-green-600 text-white rounded-full p-1 shrink-0">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                            <div className="text-[12px] text-green-850">
                              <b>AI 自动建档解析成功！</b> 已自动提取患者 6 项核心指标，您可对关键信息进行修正与核对补齐。
                            </div>
                          </div>

                          {/* The Form Layout matching the image mockup exactly */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[12px] font-bold text-gray-700 mb-1">
                                <span className="text-red-500 mr-1">*</span>姓名
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={formName}
                                  onChange={(e) => {
                                    setFormName(e.target.value);
                                    if (e.target.value === "郝彬") setFormShortName("HB");
                                    else if (e.target.value === "林国强") setFormShortName("LGQ");
                                    else if (e.target.value === "张建军") setFormShortName("ZJJ");
                                    else if (e.target.value) setFormShortName(e.target.value.slice(0, 1).toUpperCase());
                                  }}
                                  placeholder="请输入或由AI提取"
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#083190]"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-blue-50 text-[#083190] px-1.5 py-0.5 rounded">
                                  AI已提取
                                </span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[12px] font-bold text-gray-750 mb-1">
                                姓名缩写
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={formShortName}
                                  onChange={(e) => setFormShortName(e.target.value)}
                                  placeholder="算法自动生成"
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#083190] bg-gray-50/50"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                                  自动生成
                                </span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[12px] font-bold text-gray-700 mb-1">
                                <span className="text-red-500 mr-1">*</span>出生年月
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={formDob}
                                  onChange={(e) => {
                                    setFormDob(e.target.value);
                                    const yr = parseInt(e.target.value.split("-")[0]);
                                    if (!isNaN(yr)) {
                                      setFormAge((2026 - yr).toString());
                                    }
                                  }}
                                  placeholder="格式如 1964-08"
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#083190]"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-blue-50 text-[#083190] px-1.5 py-0.5 rounded">
                                  AI已提取
                                </span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[12px] font-bold text-gray-750 mb-1">
                                年龄
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={formAge}
                                  onChange={(e) => setFormAge(e.target.value)}
                                  placeholder="自动估算"
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#083190] bg-gray-50/50"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                                  自动估算
                                </span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[12px] font-bold text-gray-700 mb-1">
                                性别
                              </label>
                              <select
                                value={formGender}
                                onChange={(e) => setFormGender(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#083190] bg-white"
                              >
                                <option value="男">男</option>
                                <option value="女">女</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[12px] font-bold text-gray-700 mb-1">
                                主要疾病 / 临床诊断
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={formDisease}
                                  onChange={(e) => setFormDisease(e.target.value)}
                                  placeholder="如 心绞痛、肺癌 等"
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#083190]"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-blue-50 text-[#083190] px-1.5 py-0.5 rounded">
                                  AI已提取
                                </span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[12px] font-bold text-gray-700 mb-1">
                                联系电话
                              </label>
                              <input
                                type="text"
                                value={formPhone}
                                onChange={(e) => setFormPhone(e.target.value)}
                                placeholder="输入联系方式"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#083190]"
                              />
                            </div>

                            <div>
                              <label className="block text-[12px] font-bold text-gray-700 mb-1">
                                身份证号
                              </label>
                              <input
                                type="text"
                                value={formIdCard}
                                onChange={(e) => setFormIdCard(e.target.value)}
                                placeholder="身份证号（系统自动加密存储）"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#083190]"
                              />
                            </div>

                            <div>
                              <label className="block text-[12px] font-bold text-gray-700 mb-1">
                                来源渠道
                              </label>
                              <select
                                value={formSource}
                                onChange={(e) => setFormSource(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#083190] bg-white"
                              >
                                <option value="机构转介">机构转介</option>
                                <option value="自主招募">自主招募</option>
                                <option value="合作科室">合作科室</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[12px] font-bold text-gray-700 mb-1">
                                推荐人 / 责任研究者
                              </label>
                              <input
                                type="text"
                                value={formReferrer}
                                onChange={(e) => setFormReferrer(e.target.value)}
                                placeholder="推荐医生姓名"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#083190]"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
                            <button
                              onClick={() => setBuildStep("upload")}
                              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-lg text-[13px] font-medium"
                            >
                              返回重新上传
                            </button>
                            <button
                              onClick={() => {
                                // Default project selection parameters
                                if (selectedProject !== "全部") {
                                  setModalSelectedLibraryProject(selectedProject);
                                } else {
                                  setModalSelectedLibraryProject("");
                                }
                                setBuildStep("project_select");
                              }}
                              className={`px-5 py-2 rounded-lg text-[13px] font-bold text-white transition-all ${(!formName || !formDob) ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#083190] hover:bg-blue-900'}`}
                            >
                              核对无误，选择临床项目
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step 4: Configure Matching Target Projects */}
                      {buildStep === "project_select" && (
                        <div className="max-w-3xl mx-auto w-full space-y-6 animate-in fade-in duration-200">
                          
                          {/* Requirement 1: Match modes inside "全部" mode */}
                          {selectedProject === "全部" ? (
                              <div className="border border-blue-100 rounded-xl bg-white overflow-hidden text-left font-sans shadow-sm">
                                {/* Header */}
                                <div className="bg-blue-50/50 px-5 py-3 border-b border-blue-100 flex items-center">
                                  <FileText className="w-4 h-4 text-[#083190] mr-2" />
                                  <h4 className="text-[14px] font-bold text-[#083190]">选择临床项目</h4>
                                </div>
                                
                                <div className="p-5 space-y-6">
                                  {/* 3-tab selector */}
                                  <div className="grid grid-cols-3 gap-1 border border-gray-150 rounded-xl p-1 bg-gray-50/60">
                                    <button
                                      onClick={() => {
                                        setModalMatchMode("single");
                                        setModalProjectSource("upload");
                                      }}
                                      className={`py-2 text-[13px] font-bold rounded-lg transition-all ${modalMatchMode === "single" && modalProjectSource === "upload" ? "bg-white text-[#083190] shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-700"}`}
                                    >
                                      自定义上传方案
                                    </button>
                                    <button
                                      onClick={() => {
                                        setModalMatchMode("single");
                                        setModalProjectSource("library");
                                      }}
                                      className={`py-2 text-[13px] font-bold rounded-lg transition-all ${modalMatchMode === "single" && modalProjectSource === "library" ? "bg-white text-[#083190] shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-700"}`}
                                    >
                                      选择内置项目
                                    </button>
                                    <button
                                      onClick={() => {
                                        setModalMatchMode("full");
                                      }}
                                      className={`py-2 text-[13px] font-bold rounded-lg transition-all ${modalMatchMode === "full" ? "bg-white text-[#083190] shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-700"}`}
                                    >
                                      全库智能匹配
                                    </button>
                                  </div>

                                  {/* Tab Contents */}
                                  <div className="space-y-4 pt-1">
                                    {/* Tab 1: Upload */}
                                    {modalMatchMode === "single" && modalProjectSource === "upload" && (
                                      <div className="border border-dashed border-gray-200 hover:border-[#083190] rounded-xl p-6 bg-gray-50/30 text-center transition-all">
                                        {customSchemeFile ? (
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                              <FileText className="w-8 h-8 text-[#083190] opacity-60" />
                                              <div className="text-left">
                                                <p className="text-[13px] font-bold text-gray-800">{customSchemeFile.name}</p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">{customSchemeFile.size}</p>
                                              </div>
                                            </div>
                                            <button onClick={() => setCustomSchemeFile(null)} className="text-[12px] text-red-500 hover:text-red-700 hover:underline font-bold px-3 py-1">重新上传</button>
                                          </div>
                                        ) : (
                                          <div className="space-y-2">
                                            <Upload className="w-8 h-8 text-gray-400 mx-auto animate-pulse" />
                                            <p className="text-[13px] font-bold text-gray-700">点击选择或拖拽试验设计方案至此处上传</p>
                                            <p className="text-[11px] text-gray-450">支持 PDF, DOCX 等格式临床试验协议</p>
                                            <div className="flex items-center justify-center space-x-3 pt-2">
                                              <button
                                                onClick={() => setCustomSchemeFile({ name: "自定义多中心临床研究设计_V3.pdf", size: "2.4MB" })}
                                                className="text-[#083190] font-bold text-xs bg-white border border-gray-200 px-3 py-1 rounded-md shadow-sm hover:bg-gray-50 transition-all"
                                              >
                                                模拟上传方案
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Tab 2: Built-in */}
                                    {modalMatchMode === "single" && modalProjectSource === "library" && (
                                      <div className="space-y-2 animate-in slide-in-from-top-2 duration-200 text-left">
                                        <label className="block text-[12px] font-bold text-gray-500">选择内置临床研究项目</label>
                                        <select
                                          value={modalSelectedLibraryProject}
                                          onChange={(e) => setModalSelectedLibraryProject(e.target.value)}
                                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-[13px] bg-white outline-none focus:border-[#083190] font-medium text-gray-800"
                                        >
                                          <option value="">-- 请选择库中已有临床项目 --</option>
                                          <option value="冠心宁片中保临床方案">冠心宁片中保临床方案（第四阶段中药保护）</option>
                                          <option value="盐酸安罗替尼胶囊">盐酸安罗替尼胶囊（多中心非小细胞肺癌研究）</option>
                                          <option value="替尔泊肽注射液三期临床研究">替尔泊肽注射液三期临床研究（肥胖与心肺合并症）</option>
                                        </select>
                                      </div>
                                    )}

                                    {/* Tab 3: Full */}
                                    {modalMatchMode === "full" && (
                                      <div className="p-4 bg-blue-50/20 border border-blue-100/50 rounded-xl text-xs text-gray-600 leading-relaxed text-left">
                                        💡 <b>全库智能匹配模式：</b>系统将智能并发对标筛选该患者对库中全部 <b>19 项</b> 处于招募状态的多中心研究，自动寻找匹配度最高、临床通过率最大的项目设计方案。
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                          ) : (
                            // Requirement 2: Specific Project Mode. Remove full matching! Default to current, display scheme, allow removal & re-upload
                            <div className="space-y-4 font-sans text-left">
                              <div className="p-4 bg-blue-50/30 border border-blue-100 rounded-xl flex items-start space-x-3">
                                <div className="bg-[#083190] text-white p-1.5 rounded-full shrink-0">
                                  <Pin className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="text-[14px] font-bold text-gray-900">当前对话已被限定至特定项目：</h4>
                                  <p className="text-xs text-[#083190] font-semibold mt-0.5">[{selectedProject}]</p>
                                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                                    根据上下文锁定的规则，系统已为您过滤掉全库并发匹配，默认将针对该项目的排入条件进行精准评估。
                                  </p>
                                </div>
                              </div>
                              {/* Display active trial protocol */}
                              <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
                                <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 text-[12px] font-bold text-gray-700 flex items-center justify-between">
                                  <span>当前项目绑定的核心试验方案 (入排基准)</span>
                                  <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold">
                                    协议生效中
                                  </span>
                                </div>

                                <div className="p-4">
                                  {!isSchemeRemoved && !customSchemeFile ? (
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                          <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                          <p className="text-[13px] font-bold text-gray-800">
                                            {selectedProject === "盐酸安罗替尼胶囊" ? "盐酸安罗替尼胶囊多中心临床方案_V2.0.pdf" : "冠心宁片中药临床试验方案_V1.1_中保修订版.docx"}
                                          </p>
                                          <span className="text-[10px] text-gray-400 font-mono">1.8MB • 标准草案规章</span>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => setIsSchemeRemoved(true)}
                                        className="text-red-500 hover:text-red-700 font-bold text-[12px] hover:underline"
                                      >
                                        移除方案
                                      </button>
                                    </div>
                                  ) : customSchemeFile ? (
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-lg bg-[#083190]/5 text-[#083190] flex items-center justify-center">
                                          <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                          <p className="text-[13px] font-bold text-[#083190] flex items-center">
                                            {customSchemeFile.name}
                                            <span className="ml-2 text-[9px] bg-green-50 text-green-600 border border-green-200 px-1 py-0.5 rounded font-bold">
                                              已追加到项目文档
                                            </span>
                                          </p>
                                          <span className="text-[10px] text-gray-400 font-mono">{customSchemeFile.size} • 自定义上传方案</span>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => {
                                          setCustomSchemeFile(null);
                                          setIsSchemeRemoved(true);
                                        }}
                                        className="text-gray-450 hover:text-red-500 text-[12px] hover:underline"
                                      >
                                        重新上传
                                      </button>
                                    </div>
                                  ) : (
                                    <div
                                      onClick={() => {
                                        setCustomSchemeFile({ name: `${selectedProject}_最新重新上传试验方案_V3.2.pdf`, size: "2.4MB" });
                                        setShowSyncSuccess(true);
                                        setTimeout(() => setShowSyncSuccess(false), 3000);
                                      }}
                                      className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center bg-gray-50/50 hover:bg-blue-50/10 cursor-pointer hover:border-[#083190] transition-colors group"
                                    >
                                      <Upload className="w-6 h-6 text-gray-400 group-hover:text-[#083190] mx-auto mb-2" />
                                      <p className="text-[12px] font-bold text-gray-750 group-hover:text-[#083190]">
                                        点击此处重新上传该项目的试验方案 (.pdf / .docx)
                                      </p>
                                      <p className="text-[10px] text-gray-400 mt-1">
                                        上传的文件将由AI解析其入排条件，并同步自动保存至该项目的【项目文档】中，实现同步归档。
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {showSyncSuccess && (
                                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-[11px] rounded-lg animate-in fade-in duration-200 flex items-center">
                                  <Check className="w-4 h-4 mr-2 text-green-600 shrink-0" />
                                  <span>重新上传成功！该方案已安全写入当前分区的【项目文档】中，AI 已完成重新预读解析。</span>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center space-x-2 mt-6 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                            <input
                              type="checkbox"
                              id="agreeToRecruitment"
                              checked={agreeToRecruitment}
                              onChange={(e) => setAgreeToRecruitment(e.target.checked)}
                              className="w-4 h-4 text-[#083190] border-gray-300 rounded focus:ring-[#083190]"
                            />
                            <label htmlFor="agreeToRecruitment" className="text-[12px] text-gray-700">
                              同意参与临研通平台招募业务下的患者匹配服务
                            </label>
                          </div>

                          <div className="flex justify-between space-x-3 mt-4 pt-4 border-t border-gray-100">
                            <button
                              onClick={() => setBuildStep("form")}
                              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-lg text-[13px] font-medium"
                            >
                              返回核对信息
                            </button>
                            <button
                              disabled={!(agreeToRecruitment && (selectedProject !== "全部" || modalMatchMode === "full" || (modalProjectSource === "upload" ? !!customSchemeFile : !!modalSelectedLibraryProject)))}
                              onClick={() => {
                                // Add registered patient to database so it stays in the list
                                const newId = `P2026070908${Math.floor(100000 + Math.random() * 900000)}`;
                                const newPatientObj = {
                                  id: newId,
                                  name: formShortName || (formName.slice(0, 1) + "**"),
                                  fullName: formName,
                                  gender: formGender,
                                  age: parseInt(formAge) || 62,
                                  dob: formDob,
                                  disease: formDisease || "未知疾病",
                                  phone: formPhone ? formPhone.slice(0, 3) + "****" + formPhone.slice(-4) : "138****0000",
                                  source: formSource,
                                  idCard: formIdCard || "110101196408234567",
                                  referrer: formReferrer || "张医生",
                                };
                                
                                setPatients(prev => [newPatientObj, ...prev]);
                                handleWizardSubmitAndStartMatch(newPatientObj);
                              }}
                              className={`px-6 py-2.5 font-bold rounded-lg text-[13px] transition-colors flex items-center justify-center ${!(agreeToRecruitment && (modalMatchMode === "full" || (modalProjectSource === "upload" ? !!customSchemeFile : !!modalSelectedLibraryProject))) ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' : 'bg-[#083190] hover:bg-blue-800 text-white shadow-sm'}`}
                            >
                              开始智能核查
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* AI Patient Profile Modal (👤 画像) - ToC Styled */}
            <AnimatePresence>
              {selectedProfilePatient && (
                <div className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-[#f8fafc] rounded-[24px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-white/50"
                  >
                    {/* Header with Gradient */}
                    <div className="px-8 py-6 bg-gradient-to-r from-[#083190] to-blue-600 text-white relative">
                      <div className="absolute top-0 right-0 p-4">
                        <button 
                          onClick={() => setSelectedProfilePatient(null)} 
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-5">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-bold border border-white/30">
                          {selectedProfilePatient.fullName[0]}
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold flex items-center space-x-2">
                            <span>{selectedProfilePatient.fullName}</span>
                            <span className="text-sm font-normal opacity-80">{selectedProfilePatient.gender} | {selectedProfilePatient.age}岁</span>
                          </h3>
                          <div className="flex items-center space-x-3 text-[12px] opacity-90">
                            <span className="flex items-center"><Link className="w-3 h-3 mr-1" /> ID: {selectedProfilePatient.id.slice(-6)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8 hide-scrollbar">
                      {/* Clinical Portrait Card Stack */}
                      <div className="space-y-6">
                        {/* Clinical Tags */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/50">
                          <div className="flex items-center space-x-2 mb-4">
                            <Tag className="w-4 h-4 text-blue-500" />
                            <h4 className="text-[13px] font-bold text-slate-800">临床表型标签云</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {["2型糖尿病", "血糖升高", "代谢综合征", "心血管风险高危", "长期用药史"].map((tag, i) => (
                              <span 
                                key={i} 
                                className="px-3 py-1.5 bg-[#f0f9f1] text-[#3e8e41] text-[12px] font-medium rounded-xl border border-[#e2f2e3]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Biochemical Indicators Grid */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/50">
                          <div className="flex items-center space-x-2 mb-4">
                            <Activity className="w-4 h-4 text-indigo-500" />
                            <h4 className="text-[13px] font-bold text-slate-800">关键生化 / 评估指标</h4>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { label: "糖化血红蛋白", value: "8.00%", unit: "", status: "high" },
                              { label: "空腹血糖", value: "7.9", unit: "mmol/L", status: "high" },
                              { label: "钾", value: "4.6", unit: "mmol/L", status: "normal" },
                              { label: "钠", value: "140", unit: "mmol/L", status: "normal" },
                              { label: "钙", value: "2.37", unit: "mmol/L", status: "normal" },
                              { label: "氯", value: "105", unit: "mmol/L", status: "normal" },
                            ].map((item, i) => (
                              <div key={i} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/50 flex flex-col items-center justify-center text-center">
                                <div className="text-[10px] text-slate-400 font-bold mb-1 truncate w-full">{item.label}</div>
                                <div className={`text-[13px] font-bold flex items-center ${item.status === 'high' ? 'text-rose-500' : 'text-slate-700'}`}>
                                  {item.value}
                                  {item.status === 'high' && <ArrowUp className="w-3 h-3 ml-0.5" />}
                                </div>
                                <div className="text-[9px] text-slate-400 mt-0.5">{item.unit || '-'}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Analysis Card */}
                        <div className="bg-blue-50/30 rounded-2xl p-6 border border-blue-100/50">
                          <div className="flex items-center space-x-2 mb-3">
                            <Sparkles className="w-4 h-4 text-[#083190]" />
                            <h4 className="text-[13px] font-bold text-slate-800 uppercase tracking-wide">AI 智能筛查建议</h4>
                          </div>
                          <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
                            受试者临床特征与“冠心宁片”研究方案高度契合。重点关注其最近两个月的糖化血红蛋白波动曲线，目前的 8.0% 略高于常规基线，但在本方案可接受范围内。
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="px-8 py-5 bg-white border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => setSelectedProfilePatient(null)}
                        className="px-6 py-2.5 bg-[#083190] hover:bg-blue-900 text-white font-bold rounded-xl text-[13px] transition-all shadow-lg shadow-blue-900/10"
                      >
                        完成阅读
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* AI Traceability Modal (📄 溯源) - Timeline/Card Styled */}
            <AnimatePresence>
              {selectedTracePatient && (
                <div className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-[#f8fafc] rounded-[24px] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-white/50"
                  >
                    <div className="px-8 py-5 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                          <History className="w-5 h-5 text-[#083190]" />
                        </div>
                        <div>
                          <h3 className="text-[16px] font-bold text-slate-900 leading-tight">
                            溯源追踪 - {selectedTracePatient.fullName}
                          </h3>
                          <p className="text-[11px] text-slate-400 font-medium">原始病历脱敏解析与历史筛查记录</p>
                        </div>
                      </div>
                      <button onClick={() => setSelectedTracePatient(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>

                    <div className="p-8 overflow-y-auto space-y-6 hide-scrollbar flex-1">
                      {/* Privacy Tip */}
                      <div className="p-4 bg-slate-900 rounded-2xl text-slate-300 text-[12px] flex items-start space-x-3 shadow-lg shadow-slate-900/10">
                        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                          <b>脱敏加密保障：</b> 系统已自动对受试者隐私信息进行本地脱敏（屏蔽姓名、完整证件号、详细住址等），云端仅存储匿名化后的科研特征向量。
                        </p>
                      </div>

                      {/* Timeline Flow */}
                      <div className="space-y-4">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">最近筛查记录</h4>
                        
                        {[
                          { 
                            time: "2026-07-16 09:05:24", 
                            project: "TQB2868 注射液与盐酸安罗替尼胶囊联合化疗对比安慰剂 联合化疗一线治疗转移性胰腺导管腺癌（mPDAC）的随机、双盲、平行对照、多中心 III 期临床试验", 
                            status: "不符合",
                            assertion: "ALT/AST 异常"
                          },
                          { 
                            time: "2026-07-10 14:30:12", 
                            project: "冠心宁片治疗中风后遗症临床试验", 
                            status: "符合",
                            assertion: "基线指标完美"
                          }
                        ].map((item, idx) => (
                          <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative group hover:border-blue-100 transition-all">
                            <div className="flex items-start justify-between mb-3">
                              <div className="space-y-1">
                                <div className="text-[13px] font-bold text-slate-800 leading-relaxed group-hover:text-blue-600 transition-colors">
                                  {item.project}
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  匹配时间：{item.time}
                                </div>
                              </div>
                              <div className="shrink-0 ml-4">
                                <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${item.status === '符合' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                  {item.status}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                              <div className="flex items-center space-x-2">
                                <span className="text-[11px] text-slate-400">AI 匹配点：</span>
                                <span className="text-[11px] font-bold text-slate-700">{item.assertion}</span>
                              </div>
                              <button className="text-[12px] font-bold text-[#083190] hover:underline flex items-center">
                                AI 研报 <ChevronRight className="w-3 h-3 ml-0.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="px-8 py-5 bg-white border-t border-slate-100 flex justify-end shrink-0">
                      <button
                        onClick={() => setSelectedTracePatient(null)}
                        className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-[13px] transition-all"
                      >
                        返回列表
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {(checkState === "thinking" || checkState === "checking" || checkState === "completed" || screeningChatMessages.length > 0) && (
              <div className="flex-1 flex flex-col bg-slate-50/30 overflow-hidden w-full">
                {/* Chat Conversation Stream Feed */}
                <div className="flex-1 overflow-y-auto hide-scrollbar p-6 space-y-8 bg-slate-50/30">
                  {/* User Input Bubble */}
                  <div className="flex items-start space-x-3 max-w-4xl mx-auto w-full justify-end">
                    <div className="space-y-1 w-full max-w-3xl text-left">
                      <div className="bg-blue-50/30 border border-blue-100/30 rounded-xl p-4 text-[13px] text-gray-750 leading-relaxed text-left">
                        <p className="font-semibold mb-1 text-gray-800">我已上传文件：</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="bg-white px-2.5 py-1.5 rounded shadow-[0_1px_2px_rgba(0,0,0,0.02)] border border-gray-100 font-medium text-xs text-gray-600">
                            病历附件：<span className="underline">{activeSession?.artifacts?.uploaded?.[0]?.name || uploadedRecordFile?.name || "郝彬_住院病历.pdf"}</span>
                          </span>
                          <span className="bg-white px-2.5 py-1.5 rounded shadow-[0_1px_2px_rgba(0,0,0,0.02)] border border-gray-100 font-medium text-xs text-gray-600">
                            试验方案：<b>{activeSession?.project || "2型糖尿病临床入排精准核查项目"}</b>
                          </span>
                        </div>
                        <p className="mt-3 text-xs text-gray-450 font-medium">请开始筛查匹配。</p>
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-blue-200 shrink-0 shadow-sm">
                      <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256&q=80" alt="User Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  </div>
                  {/* Results UI - Processing State */}
                  {checkState === "thinking" && (
                    <div className="flex items-start space-x-4 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
                      <div className="w-9 h-9 rounded-full bg-[#083190] flex items-center justify-center text-white shrink-0 shadow-md font-bold font-sans text-sm border border-blue-400">
                        临
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="bg-white border border-blue-100 shadow-sm rounded-xl p-5 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Loader2 className="w-4 h-4 text-[#083190] animate-spin" />
                              <span className="text-[13px] font-bold text-gray-800">正在进行智能筛查对标分析...</span>
                            </div>
                            <span className="text-[11px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                               {thinkingHints[thinkingHintIndex]}
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            {[
                              { id: 1, label: "提取病历，结构化病历..." },
                              { id: 2, label: "提取方案，结构化方案..." },
                              { id: 3, label: "比对病历和方案..." },
                              { id: 4, label: "生成匹配研报..." }
                            ].map((step) => (
                              <div key={step.id} className="flex items-center space-x-3">
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${checkStep >= step.id ? "bg-green-500 border-green-500" : "bg-white border-gray-200"}`}>
                                  {checkStep > step.id ? (
                                    <Check className="w-2.5 h-2.5 text-white" />
                                  ) : checkStep === step.id ? (
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                  ) : null}
                                </div>
                                <span className={`text-[12px] ${checkStep >= step.id ? "text-gray-800 font-bold" : "text-gray-400"}`}>
                                  步骤 {step.id}：{step.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Results UI - Completed State */}
                  {checkState === "completed" && (
                    <div className="flex items-start space-x-4 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
                      <div className="w-9 h-9 rounded-full bg-[#083190] flex items-center justify-center text-white shrink-0 shadow-md font-bold font-sans text-sm border border-blue-400">
                        临
                      </div>
                      <div className="flex-1 space-y-4">
                        {(() => {
                          const isFullMatch = activeSession?.project === "全部" || activeSession?.project === "全部项目" || activeSession?.project === "全库匹配";
                          const currentProject = activeSession?.project || "2型糖尿病临床入排精准核查项目";

                          // Path A: Record + Project
                          if (!isFullMatch) {
                            return (
                              <div className="space-y-4">
                                <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 flex flex-col space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 pr-4 text-left">
                                      <h3 className="text-base font-semibold text-gray-900">{currentProject}</h3>
                                      <p className="text-[12px] text-gray-500 mt-1 font-medium">判定：<span className="text-green-600 font-bold">推荐入组</span></p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                      <span className="text-[24px] font-bold text-[#083190]">98%</span>
                                      <span className="text-[10px] text-gray-400 font-bold -mt-1">匹配度</span>
                                    </div>
                                  </div>

                                  <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100/50 flex flex-col space-y-1.5 text-left">
                                    <div className="flex items-center text-[12px]">
                                      <span className="font-bold text-[#083190] shrink-0">AI匹配点：</span>
                                      <span className="text-gray-700 ml-1">患者为62岁男性，伴有心电图ST段压低事实，完全符合本试验核心入组依据。</span>
                                    </div>
                                  </div>

                                  <div className="flex justify-end pt-2">
                                    <button 
                                      onClick={() => {
                                        localStorage.setItem("totrial_selected_project", currentProject);
                                        setActiveSessionId(null);
                                        window.dispatchEvent(new CustomEvent("totrial_project_changed"));
                                        setTimeout(() => {
                                          window.dispatchEvent(new CustomEvent('totrial_open_artifacts'));
                                        }, 10);
                                      }}
                                      className="px-6 py-2.5 bg-[#083190] text-white text-sm font-bold rounded-xl hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                                    >
                                      查看匹配报告
                                    </button>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-4 py-2">
                                  <div className="h-[1px] flex-1 bg-gray-100"></div>
                                  <span className="text-xs text-gray-400 font-medium tracking-wider">推荐其他项目</span>
                                  <div className="h-[1px] flex-1 bg-gray-100"></div>
                                </div>
                                <div className="space-y-2">
                                  {[
                                    { 
                                      name: "替尔泊肽注射液三期临床研究", 
                                      match: "85%",
                                      reason: "患者为2型糖尿病确诊，靶点及给药途径高度契合试验方案。"
                                    },
                                    { 
                                      name: "利拉鲁肽临床药代动力学项目", 
                                      match: "78%",
                                      reason: "患者年龄、基础肾功能指标符合本项药代动力学试验基线要求。"
                                    },
                                    { 
                                      name: "西格列汀二甲双胍片对标研究", 
                                      match: "72%",
                                      reason: "患者过往口服降糖药史与该联用对标研究入组标准完美契合。"
                                    }
                                  ].map((proj, idx) => (
                                    <div key={idx} className="bg-white border border-gray-50 rounded-xl p-4 flex flex-col space-y-3 hover:border-blue-200 transition-all text-left shadow-sm">
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <div className="text-[13px] font-bold text-gray-700">{proj.name}</div>
                                          <div className="text-[11px] text-gray-500 font-medium mt-0.5">匹配度: <span className="text-blue-600 font-bold">{proj.match}</span> | 判定: 推荐入组</div>
                                        </div>
                                          <button 
                                            onClick={() => {
                                              localStorage.setItem("totrial_selected_project", proj.name);
                                              setActiveSessionId(null);
                                              window.dispatchEvent(new CustomEvent("totrial_project_changed"));
                                              setTimeout(() => {
                                                window.dispatchEvent(new CustomEvent('totrial_open_artifacts'));
                                              }, 10);
                                            }}
                                            className="px-3 py-1.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-md hover:bg-slate-100 transition-colors border border-slate-100 shrink-0 ml-4"
                                          >
                                            查看报告
                                          </button>
                                      </div>
                                      <div className="bg-blue-50/50 rounded-lg p-2.5 border border-blue-100/50 text-[11px] text-gray-700 leading-relaxed">
                                        <span className="font-bold text-[#083190]">AI匹配点：</span>
                                        <span>{proj.reason}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }

                          // Path B: Record only (Full library)
                          return (
                            <div className="space-y-2">
                              {[
                                { 
                                  name: "2型糖尿病临床入排精准核查项目", 
                                  match: "98%",
                                  reason: "患者为2型糖尿病确诊，关键代谢指标完全符合入组标准。"
                                },
                                { 
                                  name: "替尔泊肽注射液三期临床研究", 
                                  match: "85%",
                                  reason: "患者为2型糖尿病确诊，靶点及给药途径高度契合试验方案。"
                                },
                                { 
                                  name: "利拉鲁肽临床药代动力学项目", 
                                  match: "78%",
                                  reason: "患者年龄、基础肾功能指标符合本项药代动力学试验基线要求。"
                                },
                                { 
                                  name: "西格列汀二甲双胍片对标研究", 
                                  match: "72%",
                                  reason: "患者过往口服降糖药史与该联用对标研究入组标准完美契合。"
                                },
                                { 
                                  name: "达格列净对标临床研究项目", 
                                  match: "68%",
                                  reason: "基本符合入组条件，但需进一步核实近期肾小球滤过率波动情况。"
                                }
                              ].map((proj, idx) => (
                                <div key={idx} className="bg-white border border-gray-50 rounded-xl p-4 flex flex-col space-y-3 shadow-sm text-left hover:border-blue-200 transition-all">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="text-[14px] font-bold text-gray-800">{proj.name}</div>
                                      <div className="text-[11px] text-gray-500 font-medium mt-0.5">判定: <span className="text-green-600 font-bold">推荐入组</span></div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                      <span className="text-[20px] font-bold text-[#083190]">{proj.match}</span>
                                      <span className="text-[9px] text-gray-400 font-bold -mt-1">匹配度</span>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-blue-50/50 rounded-lg p-2.5 border border-blue-100/50 text-[12px] text-gray-700">
                                    <span className="font-bold text-[#083190]">AI匹配点：</span>
                                    <span>{proj.reason}</span>
                                  </div>

                                  <div className="flex justify-end pt-1">
                                    <button 
                                      onClick={() => {
                                        localStorage.setItem("totrial_selected_project", proj.name);
                                        setActiveSessionId(null);
                                        window.dispatchEvent(new CustomEvent("totrial_project_changed"));
                                        setTimeout(() => {
                                          window.dispatchEvent(new CustomEvent('totrial_open_artifacts'));
                                        }, 10);
                                      }}
                                      className="px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 transition-colors border border-blue-100/50"
                                    >
                                      查看报告
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

              {/* Dynamic screening chat thread history (If any typed) */}
              {screeningChatMessages.map((msg, i) => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={i} className={`flex items-start space-x-3 max-w-4xl mx-auto w-full ${isUser ? "ml-auto justify-end" : "animate-in fade-in slide-in-from-bottom-2 duration-200"}`}>
                    {!isUser && (
                      <div className="w-9 h-9 rounded-full bg-[#083190] flex items-center justify-center text-white shrink-0 shadow-md font-bold font-sans text-sm border border-blue-400">
                        临
                      </div>
                    )}
                    <div className="space-y-1 max-w-2xl text-left">
                      <div className={`p-4 text-[13px] rounded-xl leading-relaxed border ${isUser ? "bg-blue-50/30 text-gray-700 border-blue-100/30" : "bg-white text-gray-800 border-gray-100"}`}>
                        {!isUser && <p className="font-bold text-[#083190] mb-1.5 text-xs">智能助手</p>}
                        <p className="whitespace-pre-wrap font-medium text-gray-700">{msg.text}</p>
                      </div>
                    </div>
                    {isUser && (
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-green-200 shrink-0 shadow-sm">
                        <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256&q=80" alt="User Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>
                );
              })}

              {isAiTyping && (
                <div className="flex items-start space-x-3 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="w-9 h-9 rounded-full bg-[#083190] flex items-center justify-center text-white shrink-0 shadow-md font-bold font-sans text-sm border border-blue-400">
                    临
                  </div>
                  <div className="space-y-1 max-w-2xl text-left">
                                  <div className="p-1 bg-white border border-gray-200 rounded-lg">
                                    <div className="flex space-x-1">
                                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                                    </div>
                                  </div>
                  </div>
                </div>
              )}
              <div ref={screeningChatEndRef} />
              </div>

              {/* Chat input box fixed at the bottom of the container */}
              <div className="p-6 bg-slate-50/30 shrink-0">
                <div className="max-w-4xl mx-auto w-full">
                  <div className="bg-white border border-slate-200 focus-within:border-[#083190] focus-within:ring-4 focus-within:ring-blue-100/60 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.04)] transition-all p-4 flex flex-col space-y-3 relative text-left">
                    <div className="relative">
                      <textarea
                        rows={2}
                        value={screeningChatInput}
                        onChange={(e) => setScreeningChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey && screeningChatInput.trim()) {
                            e.preventDefault();
                            handleSendScreeningChatMessage();
                          }
                        }}
                        placeholder="描述初筛需求或上传文件，快速开展受试者预筛选"
                        className="w-full resize-none border-none p-0 text-[13px] font-medium outline-none bg-transparent text-slate-800 placeholder:text-slate-400 focus:ring-0 leading-relaxed"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center">
                        <input
                          type="file"
                          ref={chatFileInputRef}
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              alert(`已选择文件: ${e.target.files[0].name}`);
                            }
                          }}
                        />
                        <button 
                          onClick={() => chatFileInputRef.current?.click()}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-800 transition-all text-[12px] font-bold shadow-sm"
                        >
                          <Plus className="w-4 h-4 text-[#083190]" />
                          <span>上传</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="relative group">
                          <button className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition-all">
                            <span className="text-[12px] font-bold">TotrialDriver3.0</span>
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                          </button>
                        </div>

                        <button
                          disabled={!screeningChatInput.trim()}
                          onClick={handleSendScreeningChatMessage}
                          className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${!screeningChatInput.trim() ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-[#083190] hover:bg-blue-800 text-white shadow-lg shadow-blue-900/10"}`}
                        >
                          <span>发送</span>
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        )}
        </div>

        {isArtifactsOpen && (
          <div 
            className={`shrink-0 flex flex-col bg-white relative z-20 shadow-[-20px_0_40px_rgba(0,0,0,0.02)] transition-all ${isArtifactsExpanded ? "absolute inset-0 z-40 w-full" : ""}`}
            style={{ width: isArtifactsExpanded ? "100%" : rightPanelWidth }}
          >
            {/* Resize Handle */}
            {!isArtifactsExpanded && (
              <div
                onMouseDown={startResizing}
                className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400/30 transition-colors z-30"
              />
            )}
            <ArtifactsPanel 
              artifacts={displayArtifacts as SessionArtifacts} 
              isChatting={!!displayArtifacts}
              isExpanded={isArtifactsExpanded}
              onToggleExpand={() => setIsArtifactsExpanded(!isArtifactsExpanded)}
              onClose={() => setIsArtifactsOpen(false)}
            />
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {showReport && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-[#083190] mr-2" />
                <h3 className="text-[16px] font-bold text-gray-800">
                  临床方案入排比对报告
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="px-4 py-1.5 bg-[#083190] text-white text-[13px] font-medium rounded hover:bg-[#002d70] transition-colors"
                  onClick={() => alert("报告正在导出并下载成功...")}
                >
                  导出报告
                </button>
                <button
                  onClick={() => setShowReport(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gray-100 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-4 bg-white shadow-sm border border-gray-200 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-4xl mx-auto font-sans">
                  <div className="flex items-end justify-between mb-8 pb-4 border-b-2 border-gray-100">
                    <div>
                       <h1 className="text-3xl font-bold text-gray-900 mb-2">
                         临床方案入排比对报告
                       </h1>
                       <div className="text-gray-500 font-medium">项目：冠心宁片中保临床方案（心绞痛）</div>
                    </div>
                    <div className="flex space-x-4">
                       <span 
                         onClick={() => setReportView('overview')}
                         className={`px-4 py-2 font-bold rounded-md cursor-pointer transition-colors ${reportView === 'overview' ? 'bg-blue-50 text-[#083190]' : 'text-gray-500 hover:bg-gray-50'}`}
                       >
                         概览视图
                       </span>
                       <span 
                         onClick={() => setReportView('detail')}
                         className={`px-4 py-2 font-medium rounded-md cursor-pointer transition-colors ${reportView === 'detail' ? 'bg-blue-50 text-[#083190]' : 'text-gray-500 hover:bg-gray-50'}`}
                       >
                         全量比对明细 (32)
                       </span>
                    </div>
                  </div>

                  {reportView === 'overview' ? (
                    <>
                      <div className="grid grid-cols-3 gap-6 mb-8">
                         <div className="col-span-2 bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <h2 className="text-[15px] font-bold text-gray-800 mb-4 flex items-center"><User className="w-4 h-4 mr-2 text-[#083190]" /> 患者基本档案</h2>
                            <div className="grid grid-cols-2 gap-y-4 text-[13px]">
                              <div><span className="text-gray-500 mr-2">姓名:</span> <span className="font-semibold text-gray-800">郝彬</span></div>
                              <div><span className="text-gray-500 mr-2">性别/年龄:</span> <span className="font-semibold text-gray-800">男 / 62岁</span></div>
                              <div><span className="text-gray-500 mr-2">就诊卡号:</span> <span className="font-semibold text-gray-800">OP29384711</span></div>
                              <div><span className="text-gray-500 mr-2">主要诊断:</span> <span className="font-semibold text-gray-800">冠心病，稳定型心绞痛</span></div>
                            </div>
                         </div>
                         <div className="col-span-1 bg-green-50 rounded-xl p-6 border border-green-200 flex flex-col items-center justify-center text-center">
                            <div className="text-[36px] font-bold text-green-600 mb-1">98%</div>
                            <div className="text-[14px] text-green-700 font-medium mb-2">综合匹配度</div>
                            <div className="bg-green-600 text-white px-4 py-1.5 rounded-full text-[13px] font-bold shadow-sm">建议入组</div>
                         </div>
                      </div>

                      <div className="space-y-6">
                        <section>
                          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                            <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" /> 核心纳入标准 (Inclusion)
                          </h2>
                          <div className="border border-gray-200 rounded-lg overflow-hidden text-[13px]">
                             <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                                   <tr>
                                      <th className="px-4 py-3 font-medium w-16">序号</th>
                                      <th className="px-4 py-3 font-medium w-[40%]">方案要求</th>
                                      <th className="px-4 py-3 font-medium">病历佐证事实</th>
                                      <th className="px-4 py-3 font-medium w-24">判定</th>
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                   <tr>
                                      <td className="px-4 py-3 text-gray-500">I-01</td>
                                      <td className="px-4 py-3 font-medium text-gray-800">年龄18-75周岁，性别不限。</td>
                                      <td className="px-4 py-3 text-gray-600">患者当前年龄62岁。</td>
                                      <td className="px-4 py-3"><span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">满足</span></td>
                                   </tr>
                                   <tr>
                                      <td className="px-4 py-3 text-gray-500">I-02</td>
                                      <td className="px-4 py-3 font-medium text-gray-800">符合稳定性心绞痛诊断标准，且近1个月内发作每周≥2次。</td>
                                      <td className="px-4 py-3 text-gray-600">门诊主诉：阵发性胸痛3年，近一月加重，每周发作3-4次。</td>
                                      <td className="px-4 py-3"><span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">满足</span></td>
                                   </tr>
                                </tbody>
                             </table>
                          </div>
                        </section>
                        
                        <section>
                          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center mt-8">
                            <AlertCircle className="w-5 h-5 mr-2 text-red-500" /> 核心排除标准 (Exclusion)
                          </h2>
                          <div className="border border-gray-200 rounded-lg overflow-hidden text-[13px]">
                             <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                                   <tr>
                                      <th className="px-4 py-3 font-medium w-16">序号</th>
                                      <th className="px-4 py-3 font-medium w-[40%]">方案要求</th>
                                      <th className="px-4 py-3 font-medium">病历佐证事实</th>
                                      <th className="px-4 py-3 font-medium w-24">判定</th>
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                   <tr>
                                      <td className="px-4 py-3 text-gray-500">E-01</td>
                                      <td className="px-4 py-3 font-medium text-gray-800">重度心力衰竭 (NYHA III-IV级) 或近6个月内发生急性心肌梗死。</td>
                                      <td className="px-4 py-3 text-gray-600">既往史无心梗，当前心功能NYHA II级。</td>
                                      <td className="px-4 py-3"><span className="text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs font-bold">未排除</span></td>
                                   </tr>
                                   <tr>
                                      <td className="px-4 py-3 text-gray-500">E-02</td>
                                      <td className="px-4 py-3 font-medium text-gray-800">严重的肝、肾功能异常 (ALT/AST &gt; 正常上限2倍，或 Cr &gt; 正常上限1.5倍)。</td>
                                      <td className="px-4 py-3 text-gray-600">上周化验指标均在正常范围（ALT: 28, Cr: 76）。</td>
                                      <td className="px-4 py-3"><span className="text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs font-bold">未排除</span></td>
                                   </tr>
                                </tbody>
                             </table>
                          </div>
                        </section>

                        <div className="h-20"></div>
                      </div>
                    </>
                  ) : (
                    <div className="animate-in fade-in duration-300">
                      <div className="flex justify-between items-center mb-6">
                        <div className="text-[14px] text-gray-600">共扫描入排标准 <strong className="text-gray-900">32</strong> 项，已比对 <strong className="text-green-600">32</strong> 项，其中 <strong className="text-red-500">0</strong> 项不满足。</div>
                        <div className="flex space-x-2">
                           <input type="text" placeholder="搜索指标..." className="px-3 py-1.5 border border-gray-200 rounded-md text-[13px] outline-none focus:border-[#083190]" />
                           <select className="px-3 py-1.5 border border-gray-200 rounded-md text-[13px] outline-none focus:border-[#083190] bg-white">
                             <option value="all">全部分类</option>
                             <option value="inclusion">纳入标准</option>
                             <option value="exclusion">排除标准</option>
                           </select>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg overflow-hidden text-[13px]">
                         <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                               <tr>
                                  <th className="px-4 py-3 font-medium w-20">编号</th>
                                  <th className="px-4 py-3 font-medium w-24">分类</th>
                                  <th className="px-4 py-3 font-medium w-[30%]">具体标准</th>
                                  <th className="px-4 py-3 font-medium">病历佐证摘要</th>
                                  <th className="px-4 py-3 font-medium w-24 text-center">系统判定</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                               {[
                                 { id: 'I-01', cat: '纳入', type: 'inclusion', desc: '年龄18-75周岁，性别不限。', proof: '患者当前年龄62岁。', status: '满足' },
                                 { id: 'I-02', cat: '纳入', type: 'inclusion', desc: '符合稳定性心绞痛诊断标准，且近1个月内发作每周≥2次。', proof: '门诊主诉：阵发性胸痛3年，近一月加重，每周发作3-4次。', status: '满足' },
                                 { id: 'I-03', cat: '纳入', type: 'inclusion', desc: '入选前经过至少4周的基础抗心绞痛治疗，症状稳定。', proof: '既往用药：阿司匹林、单硝酸异山梨酯，规律服用6周，无恶化。', status: '满足' },
                                 { id: 'I-04', cat: '纳入', type: 'inclusion', desc: '静息心电图证实有心肌缺血表现(ST段压低≥0.1mV)。', proof: '入院心电图：V4-V6导联ST段水平型压低0.15mV。', status: '满足' },
                                 { id: 'E-01', cat: '排除', type: 'exclusion', desc: '重度心力衰竭 (NYHA III-IV级) 或近6个月内发生急性心肌梗死。', proof: '既往史无心梗，当前心功能NYHA II级。', status: '未排除' },
                                 { id: 'E-02', cat: '排除', type: 'exclusion', desc: '严重的肝、肾功能异常 (ALT/AST > 正常上限2倍，或 Cr > 正常上限1.5倍)。', proof: '上周化验指标均在正常范围（ALT: 28, Cr: 76）。', status: '未排除' },
                                 { id: 'E-03', cat: '排除', type: 'exclusion', desc: '已知对试验药物成分过敏。', proof: '过敏史：青霉素过敏。无中药丹参、川芎过敏史。', status: '未排除' },
                                 { id: 'E-04', cat: '排除', type: 'exclusion', desc: '正在参加其他临床试验者。', proof: '签署同意书前未参与其他试验。', status: '未排除' },
                               ].map((item, index) => (
                                 <tr key={index} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3 text-gray-500">{item.id}</td>
                                    <td className="px-4 py-3">
                                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${item.type === 'inclusion' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                        {item.cat}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-800">{item.desc}</td>
                                    <td className="px-4 py-3 text-gray-600">{item.proof}</td>
                                    <td className="px-4 py-3 text-center">
                                      {item.status === '满足' ? (
                                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">满足</span>
                                      ) : item.status === '不满足' ? (
                                        <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold">不满足</span>
                                      ) : (
                                        <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs font-bold">未排除</span>
                                      )}
                                    </td>
                                 </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                      {activeSession && (!activeSession.project || activeSession.project === "未归档" || activeSession.project === "未分配") && (
                        <div className="flex justify-center mt-6 animate-in fade-in duration-300">
                          <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3.5 flex items-center justify-between w-full max-w-xl shadow-sm">
                            <div className="flex items-center text-[13px] text-gray-700">
                              <FolderOpen className="w-4 h-4 mr-2 text-[#083190]" />
                              <span>该任务目前为<b>“未归档”</b>状态，是否归档到某个项目中？</span>
                            </div>
                            <button
                              onClick={() => {
                                setArchiveTargetProject("");
                                setShowArchiveModal(activeSessionId);
                              }}
                              className="px-3.5 py-1.5 bg-[#083190] hover:bg-blue-900 text-white font-bold rounded-lg text-[12px] transition-colors"
                            >
                              立即归档
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="h-20"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      <AnimatePresence>
        {showArchiveModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[110]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl border border-gray-150 p-6 w-96 max-w-[90%]"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 flex items-center">
                  <FolderOpen className="w-4 h-4 mr-1.5 text-[#083190]" />
                  归档到项目
                </h3>
                <button
                  onClick={() => setShowArchiveModal(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <p className="text-[12px] text-gray-500">请选择要归档的目标项目：</p>
                <div className="space-y-2 max-h-48 overflow-y-auto font-sans">
                  {getProjectOptions().map((proj) => (
                    <button
                      key={proj}
                      onClick={() => setArchiveTargetProject(proj)}
                      className={`w-full text-left px-3.5 py-2.5 text-[13px] rounded-lg border transition-all flex justify-between items-center ${
                        archiveTargetProject === proj
                          ? "border-[#083190] bg-blue-50/50 text-[#083190] font-semibold"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span>{proj}</span>
                      {archiveTargetProject === proj && (
                        <Check className="w-4 h-4 text-[#083190]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setShowArchiveModal(null)}
                  className="px-4 py-2 text-[12px] font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (!archiveTargetProject) {
                      alert("请选择一个项目");
                      return;
                    }
                    setSessions((prev) =>
                      prev.map((s) =>
                        s.id === showArchiveModal ? { ...s, project: archiveTargetProject } : s
                      )
                    );
                    setShowArchiveModal(null);
                    alert(`已成功归档到项目 [${archiveTargetProject}]`);
                  }}
                  className="px-4 py-2 text-[12px] font-bold text-white bg-[#083190] hover:bg-blue-900 rounded-lg transition-colors"
                >
                  确认归档
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Project File Selector Modal */}
      <AnimatePresence>
        {showProjectFileSelector && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[110]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl border border-gray-150 p-6 w-[480px] max-w-[90%]"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 flex items-center">
                  <FileText className="w-4 h-4 mr-1.5 text-[#083190]" />
                  从项目文档引用文件 ({showProjectFileSelector.activeField === 'protocol' ? '临床方案' : '患者病历'})
                </h3>
                <button
                  onClick={() => setShowProjectFileSelector(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 font-sans">
                <p className="text-[12px] text-gray-500">
                  当前关联项目: <strong className="text-gray-700">{selectedProject === '全部' ? '冠心宁片中保临床方案' : selectedProject}</strong>
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {getProjectFilesForField(selectedProject === '全部' ? '冠心宁片中保临床方案' : selectedProject, showProjectFileSelector.activeField).map((file) => (
                    <button
                      key={file.name}
                      onClick={() => {
                        setSetupState((prev) => ({
                          ...prev,
                          [showProjectFileSelector.activeField]: true
                        }));
                        setShowProjectFileSelector(null);
                      }}
                      className="w-full text-left px-3.5 py-3 border border-gray-100 rounded-lg hover:border-blue-300 hover:bg-blue-50/20 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-gray-400 group-hover:text-blue-500" />
                        <div>
                          <p className="text-[13px] font-medium text-gray-800 group-hover:text-blue-600">{file.name}</p>
                          <span className="text-[11px] text-gray-400">{file.type} • {file.size}</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        选用
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setShowProjectFileSelector(null)}
                  className="px-4 py-2 text-[12px] font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  取消
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {shareModalInfo && (
          <ShareModal
            isOpen={!!shareModalInfo}
            onClose={() => setShareModalInfo(null)}
            shareUrl={shareModalInfo.url}
            title={shareModalInfo.title}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
