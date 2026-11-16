import {
  Search,
  Plus,
  MessageSquare,
  Send,
  RefreshCw,
  User,
  CheckCircle2,
  ChevronRight,
  ArrowRightLeft,
  Check,
  Share2,
  Clock,
  PanelRightClose,
  X,
  FolderOpen,
  Pin,
  Edit2,
  Trash2,
  Minimize2,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import ArtifactsPanel, { SessionArtifacts } from "./ArtifactsPanel";
import { HighlightText } from "./HighlightText";
import ShareModal from "./ShareModal";
import { ShareConfigModal } from "./ShareConversationPrototype";

const INITIAL_SESSIONS = [
  {
    id: "session-q-1",
    title: "GCP合规性咨询",
    project: "冠心宁片中保临床方案",
    artifacts: {
      uploaded: [
        { id: "u1", name: "GCP法规2025版.pdf", type: "pdf" as const },
        { id: "u2", name: "方案设计指导原则.docx", type: "docx" as const },
      ],
      generated: [],
    },
  },
  {
    id: "session-q-2",
    title: "方案设计指导原则解读",
    project: "盐酸安罗替尼胶囊",
    artifacts: {
      uploaded: [],
      generated: [{ id: "g3", name: "数据核查指南.pdf", type: "pdf" as const }],
    },
  },
  {
    id: "session-q-3",
    title: "严重不良事件(SAE)报告规范...",
    project: "冠心宁片中保临床方案",
    artifacts: { uploaded: [], generated: [] },
  },
  {
    id: "session-q-unassigned",
    title: "阿普唑仑片不良反应数据统计",
    project: "未归档",
    artifacts: { uploaded: [], generated: [] },
  },
];

const CitationSpan: React.FC<{
  text: string; 
  artifactId: string; 
  page?: string;
}> = ({ 
  text, 
  artifactId, 
  page
}) => {
  return (
    <button
      onClick={() => {
        window.dispatchEvent(new CustomEvent('totrial_highlight_artifact', { 
          detail: { artifactId, page } 
        }));
      }}
      className="inline-flex items-center px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[11px] font-bold mx-0.5 hover:bg-blue-100 transition-colors border border-blue-100 cursor-pointer"
    >
      {text}
    </button>
  );
};

const parseContent = (content: any, highlight: string = "") => {
  if (typeof content !== 'string') return content;
  
  // First handle highlights if any
  // Then handle citations [引用1: Name p.X]
  const citationRegex = /\[引用(\d+):\s*(.*?)(?:\s*p\.(\d+))?\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = citationRegex.exec(content)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      const textPart = content.slice(lastIndex, match.index);
      parts.push(<HighlightText key={`text-${lastIndex}`} text={textPart} highlight={highlight} />);
    }

    const [fullMatch, index, name, page] = match;
    const artifactId = name.includes("方案") ? "gx-2" : (name.includes("规范") ? "gx-1" : "gx-3");
    
    parts.push(
      <CitationSpan 
        key={`cite-${match.index}`} 
        text={`[引用${index}: ${name}${page ? ` p.${page}` : ''}]`}
        artifactId={artifactId}
        page={page}
      />
    );

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < content.length) {
    const lastPart = content.slice(lastIndex);
    parts.push(<HighlightText key={`text-${lastIndex}`} text={lastPart} highlight={highlight} />);
  }

  return parts.length > 0 ? parts : content;
};

const Typewriter = ({
  text,
  onComplete,
}: {
  text: string;
  onComplete?: () => void;
}) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 20); // 20ms per character
    return () => clearInterval(interval);
  }, [text, onComplete]);

  return <span>{parseContent(displayedText)}</span>;
};

const getSimulatedResponse = (text: string): string => {
  const lowercase = text.toLowerCase();
  if (lowercase.includes("edc") || lowercase.includes("搭建") || lowercase.includes("数据录入")) {
    return `一、EDC（电子数据采集）系统的搭建要点
1. 方案设计转化：必须严格按照临床试验方案（Protocol）中规定的访视点、收集指标以及偏离报警条件，在EDC中设计CRF（病例报告表）。
2. 逻辑核查规则（DVS/Edit Checks）：提前编写和验证数据校验逻辑，如“出生日期不可晚于入组日期”、“男性患者不可填写怀孕相关信息”等，确保在录入源源拦截逻辑错误。
3. 角色与权限划分：定义研究者（Investigator）、协调员（CRC）、监查员（CRA）以及数据管理员（DM）的角色权限，实现职责分离与操作留痕。

二、临床数据录入规范与要求
1. 时效性：一般要求在受试者访视完成后24-48小时内完成EDC录入。
2. 真实性与一致性：录入数据必须与医院原始病历（Source Document）完全一致，任何偏差均需提供合理的医学解释。
3. 规范化缩写：医学术语、诊断及合并用药必须录入规范名称，避免录入地方俚语。

三、数据质量控制（QC）关键机制
1. 原始数据核查（SDV）：CRA必须100%核对主要疗效及安全性指标。
2. 疑问管理（Query Workflow）：DM及CRA发起的疑问需由研究者（或授权CRC）及时解答。
3. 系统稽查轨迹（Audit Trail）：系统自动记录每次修改的“人、时、旧值、新值、修改原因”，保证数据可追溯性。`;
  }
  
  if (lowercase.includes("不良反应") || lowercase.includes("阿普唑仑") || lowercase.includes("alprazolam")) {
    return `根据《阿普唑仑片（Alprazolam）临床应用指导原则》及大样本药物安全警戒（Pharmacovigilance）数据，其主要不良反应及临床监控要点如下：

一、 主要不良反应分类
1. 常见不良反应（发生率 >10%）：
   - 中枢神经系统：嗜睡、头昏、共济失调（特别是老年患者，极易导致跌倒）。
   - 消化系统：口干、便秘、食欲减退。
2. 长期或大剂量应用不良反应：
   - 依赖性与戒断症状：突然停药可能诱发震颤、癫痫发作、谵妄等严重戒断反应。
   - 精神行为异常：少数患者可能出现反常的精神兴奋、激惹和幻觉。

二、 临床重点监控指标
1. 步态与肌张力评估：每次访视必须评估跌倒风险，特别是老年和体弱患者。
2. 认知功能测定：长期服用需定期进行MMSE或MoCA简易认知评定量表筛查。
3. 肝肾功能与血常规：每3-6个月监测一次ALT/AST及血肌酐，防止蓄积中毒。
4. 处方依从性稽查：严格执行特殊精神药品二级管理制度，防止患者擅自加大剂量。`;
  }

  if (lowercase.includes("设计依据") || lowercase.includes("方案设计") || lowercase.includes("依据是什么")) {
    return `根据您当前项目的知识库文档，临床试验方案（Clinical Trial Protocol）设计的核心依据主要涵盖以下四大支柱：

一、 法规与监管指南依据
1. ICH-GCP及中国《药物临床试验质量管理规范》（GCP）：作为临床试验合规和受试者保护的法律基石。 [引用1: 项目方案.pdf p.4]
2. 药监局（NMPA/CDE）发布的特定疾病临床研究技术指导原则：为入排标准、终点选择和对照组设置提供具体指导。 [引用2: 临床试验质量管理规范.pdf p.12]

二、 临床前与早期临床研究数据
1. 药效学（PD）和药代动力学（PK）数据：决定临床试验给药剂量（Dose Ranging）及给药频次。 [引用3: 演示病历-1.pdf p.2]
2. 毒理学研究：确定临床安全窗及需重点监控的目标器官毒性。

三、 科学性设计原则
1. 对照组选择（Comparator Selection）：依据科学和伦理，选择标准治疗（Standard of Care）或安慰剂（Placebo）。
2. 盲法与随机化（Blinding & Randomization）：采用双盲设计最大程度消除主观偏差；由中央随机系统（IWRS）进行受试者分配。

四、 医学伦理学考量
- 坚持赫尔辛基宣言原则，确保受试者的风险/获益比（Risk-Benefit Ratio）合理。所有方案必须经伦理委员会（IRB）批准后方可实施。`;
  }

  return `您好！作为专业的临床研究AI大模型，我已经收到了您的专业咨询。

针对您的问题“${text}”，我们将结合最新的ICH-GCP法规、CDE指导原则以及业内最佳实践，为您提供深度解析：

1. 行业政策合规：研究设计需全面符合《药物临床试验质量管理规范》（2025版）的相关要求。 [引用1: 临床试验质量管理规范.pdf p.8]
2. 终点指标确立：应优先选择经科学验证的硬终点（Hard Endpoint），合并应用公认的量表或客观生物标记物（Biomarkers）。 [引用2: 项目方案.pdf p.15]
3. 统计学考量：样本量估算（Sample Size Estimation）必须具有足够的统计效能（Power > 80%），并明确定义缺失数据的填补策略（ITT分析集与PP分析集）。 [引用3: 演示病历-1.pdf p.5]

如需针对特定适应症或在研项目做定制化方案评估，请随时上传相关方案草案或指南文档。`;
};

export default function MedicalQA({ selectedProject = "全部" }: { selectedProject?: string }) {
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; content: React.ReactNode; isTyping?: boolean }[]
  >([]);
  const [input, setInput] = useState("");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogSearchQuery, setDialogSearchQuery] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingSessionTitle, setEditingSessionTitle] = useState("");

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState<string | null>(null);
  const [archiveTargetProject, setArchiveTargetProject] = useState<string>("");
  const [shareModalInfo, setShareModalInfo] = useState<{ url: string; title: string } | null>(null);
  const [showShareConfigModal, setShowShareConfigModal] = useState(false);

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

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
        setMessages([]);
      }
    }
  };

  // Synchronize active session if it doesn't belong to the newly selected project
  useEffect(() => {
    if (selectedProject !== "全部" && activeSession && activeSession.project !== selectedProject) {
      setActiveSessionId(null);
      setMessages([]);
    }
  }, [selectedProject]);

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
            prev.map((s) => (s.project === projName ? { ...s, project: "未归档" } : s))
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // Keep sidebar open during task execution as per user request

    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      currentSessionId = `session-new-${Date.now()}`;
      setSessions((prev) => [
        {
          id: currentSessionId,
          title: text.length > 15 ? text.substring(0, 15) + "..." : text,
          project: "未归档",
          artifacts: {
            uploaded: [
              { id: "u1", name: "GCP法规2025版.pdf", type: "pdf" as const },
              {
                id: "u2",
                name: "方案设计指导原则.docx",
                type: "docx" as const,
              },
            ],
            generated: [],
          },
        },
        ...prev,
      ]);
      setActiveSessionId(currentSessionId);
    }

    const isSaeQuestion =
      text.includes("SAE") || text.includes("不良事件") || text.includes("GCP");

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      {
        role: "ai",
        isTyping: true,
        content: (
          <div className="flex space-x-1.5 items-center py-2">
            <div className="w-2 h-2 bg-[#083190]/50 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-[#083190]/50 rounded-full animate-bounce"
              style={{ animationDelay: "0.15s" }}
            ></div>
            <div
              className="w-2 h-2 bg-[#083190]/50 rounded-full animate-bounce"
              style={{ animationDelay: "0.3s" }}
            ></div>
          </div>
        ),
      },
    ]);
    setInput("");

    try {
      let responseText = "";
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: text,
            systemInstruction:
              "你是一个专业的临床研究AI大模型，熟知GCP法规、EDC系统和临床试验流程。请专业、严谨、详实地回答用户的问题。",
          }),
        });
        if (response.ok) {
          const data = await response.json();
          responseText = data.text;
        }
      } catch (err) {
        console.error("Fetch failed, using simulation", err);
      }

      if (!responseText || responseText.includes("出错了") || responseText.includes("Failed")) {
        responseText = getSimulatedResponse(text);
      }

      setMessages((currentMsgs) => {
        const newMsgs = [...currentMsgs];
        newMsgs[newMsgs.length - 1] = {
          role: "ai",
          isTyping: true,
          content: (
            <Typewriter
              text={responseText}
              onComplete={() => {
                setMessages((msgs) => {
                  const m = [...msgs];
                  const lastMsg = m[m.length - 1];
                  if (lastMsg && lastMsg.role === "ai") {
                    lastMsg.isTyping = false;
                  }
                  return m;
                });

                if (isSaeQuestion && currentSessionId) {
                  setSessions((prevSessions) =>
                    prevSessions.map((s) => {
                      if (s.id === currentSessionId) {
                        return {
                          ...s,
                          artifacts: {
                            ...s.artifacts,
                            generated: [
                              {
                                id: `g-${Date.now()}-1`,
                                name: "临床试验方案摘要.docx",
                                type: "docx" as const,
                              },
                              {
                                id: `g-${Date.now()}-2`,
                                name: "医学文献综述导图.pdf",
                                type: "pdf" as const,
                              },
                            ],
                          },
                        };
                      }
                      return s;
                    }),
                  );
                }
              }}
            />
          ),
        };
        return newMsgs;
      });
    } catch (e) {
      setMessages((currentMsgs) => {
        const newMsgs = [...currentMsgs];
        newMsgs[newMsgs.length - 1] = {
          role: "ai",
          content: getSimulatedResponse(text),
        };
        return newMsgs;
      });
    }
  };

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

  const isUnarchived = activeSession && (!activeSession.project || activeSession.project === "未归档" || activeSession.project === "未分配");
  const isTyping = messages.some(m => m.isTyping);

  return (
    <>
    {/* Floating controls for expanded artifacts - bottom center */}
    {isArtifactsOpen && isArtifactsExpanded && (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] flex items-center space-x-2">
        <button
          onClick={() => setIsArtifactsExpanded(false)}
          className="flex items-center bg-white/95 backdrop-blur text-[#083190] border border-blue-200 shadow-lg rounded-lg px-3 py-2 text-xs font-bold hover:bg-blue-50 transition-all"
        >
          <Minimize2 className="w-3.5 h-3.5 mr-1.5" />
          收起
        </button>
        <button
          onClick={() => {
            setIsArtifactsOpen(false);
            setIsArtifactsExpanded(false);
          }}
          className="flex items-center bg-white/95 backdrop-blur text-rose-600 border border-rose-200 shadow-lg rounded-lg px-3 py-2 text-xs font-bold hover:bg-rose-50 transition-all"
        >
          <X className="w-3.5 h-3.5 mr-1.5" />
          关闭
        </button>
      </div>
    )}
    <div className="flex bg-white h-full rounded-xl overflow-hidden font-sans relative">
      {/* Left Sidebar */}
      <div className={`${isSidebarOpen ? "w-64" : "w-0"} transition-all duration-300 bg-white border-r border-gray-100 flex flex-col shrink-0 relative z-20 overflow-hidden`}>
        <div className="p-4 w-64">
          <button
            onClick={() => {
              setMessages([]);
              setActiveSessionId(null);
              setTimeout(() => {
                textareaRef.current?.focus();
              }, 50);
            }}
            className="w-full bg-[#2b64e3] hover:bg-[#1a4eb8] text-white rounded-md py-2.5 text-[14px] font-bold flex items-center justify-center transition-colors shadow-sm"
          >
            <Plus className="w-[18px] h-[18px] mr-1.5" />
            新建任务
          </button>
        </div>
        <div className="px-4 pb-3 w-64">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索历史任务"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded text-[13px] outline-none focus:border-blue-400 transition-colors placeholder:text-gray-400"
            />
          </div>
        </div>
        <div className="px-4 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-64">
          历史任务
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1 hide-scrollbar w-64">
          {sortedSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => {
                setActiveSessionId(session.id);
              }}
              className={`group px-3 py-2 text-[13px] rounded-lg cursor-pointer transition-colors font-medium flex flex-col items-start relative ${session.id === activeSessionId ? "bg-blue-50/60 text-[#2b64e3] border border-blue-100" : "text-gray-700 hover:bg-gray-50 border border-transparent"}`}
            >
              <div className="flex items-center justify-between w-full min-w-0 relative">
                {editingSessionId === session.id ? (
                  <div className="flex items-center space-x-1 w-full" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editingSessionTitle}
                      onChange={(e) => setEditingSessionTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameSession(session.id, editingSessionTitle);
                        if (e.key === "Escape") setEditingSessionId(null);
                      }}
                      className="flex-1 bg-white border border-blue-400 px-1 py-0.5 text-[12px] rounded outline-none font-sans"
                      autoFocus
                    />
                    <button
                      onClick={() => handleRenameSession(session.id, editingSessionTitle)}
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
                    <div className="flex items-center truncate min-w-0 flex-1 pr-1">
                      <MessageSquare
                        className={`w-3.5 h-3.5 mr-2 shrink-0 ${session.id === activeSessionId ? "text-[#2b64e3]" : "text-gray-400"}`}
                      />
                      {(session as any).isPinned && (
                        <Pin className="w-3 h-3 text-[#2b64e3] mr-1 shrink-0 rotate-45" />
                      )}
                      <span className="truncate text-[13px] font-semibold">{session.title}</span>
                    </div>
                    
                    <div className={`flex items-center space-x-0.5 shrink-0 pl-2 group-hover:opacity-100 opacity-0 transition-opacity absolute right-0 top-1/2 -translate-y-1/2 rounded-md p-0.5 ${session.id === activeSessionId ? "bg-blue-50/90" : "bg-white/90 group-hover:bg-gray-50/90"}`}>
                      {/* Pin Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSessions(prev => prev.map(s => s.id === session.id ? { ...s, isPinned: !(s as any).isPinned } : s));
                        }}
                        className={`p-0.5 rounded hover:bg-gray-200/80 ${(session as any).isPinned ? "text-[#2b64e3]" : "text-gray-400 hover:text-[#2b64e3]"}`}
                        title={(session as any).isPinned ? "取消置顶" : "置顶"}
                      >
                        <Pin className="w-3 h-3" />
                      </button>

                      {/* Rename Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSessionId(session.id);
                          setEditingSessionTitle(session.title);
                        }}
                        className="p-0.5 rounded hover:bg-gray-200/80 text-gray-400 hover:text-[#2b64e3]"
                        title="重命名"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>

                      {/* Archive Button */}
                      {(!session.project || session.project === "未归档") && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setArchiveTargetProject("");
                            setShowArchiveModal(session.id);
                          }}
                          className="p-0.5 rounded hover:bg-gray-200/80 text-gray-400 hover:text-[#2b64e3]"
                          title="归档"
                        >
                          <FolderOpen className="w-3 h-3" />
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
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
                  {session.project || "未归档"}
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
      <div className="flex-1 flex flex-col relative bg-white overflow-hidden">
        {activeSession && (
          <div className="px-6 py-3 border-b border-gray-100/60 flex items-center justify-between bg-white z-10 shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-w-0">
            <div className="flex items-center space-x-3 min-w-0 flex-1 mr-4">
              <span className="text-[16px] font-bold text-gray-800 tracking-wide truncate" title={activeSession.title}>{activeSession.title}</span>
              {isUnarchived && (
                <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded font-bold shrink-0">
                  未归档
                </span>
              )}
              {!isUnarchived && (
                <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-100/40 px-2 py-0.5 rounded-lg font-bold shrink-0">
                  {activeSession.project}
                </span>
              )}
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
                  setShowShareConfigModal(true);
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
                        className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-150 py-2 z-50 text-left"
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
                            帮我梳理GCP核心条款及伦理审查要点
                          </div>
                          <div className="px-4 py-2 text-[12px] text-gray-700 hover:bg-gray-50 cursor-pointer truncate font-medium">
                            结合上述依据，输出一份完整报告
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-[1px] h-4 bg-gray-200 mx-1"></div>

              <button
                onClick={() => window.dispatchEvent(new Event('totrial_toggle_artifacts'))}
                className="p-1.5 text-gray-500 hover:text-[#083190] hover:bg-white rounded transition-all"
                title="项目文档"
              >
                <PanelRightClose className="w-[16px] h-[16px]" />
              </button>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-10 pb-[200px] hide-scrollbar">
          {activeSessionId === null ? (
            <div className="max-w-4xl mx-auto pt-8 animate-in fade-in duration-300">
              <h1 className="text-3xl font-extrabold text-gray-900 flex items-center mb-2 tracking-tight">
                欢迎来到 <span className="bg-blue-50 text-[#2b64e3] px-3.5 py-1 rounded-xl border border-blue-100/60 shadow-[0_2px_10px_rgba(37,99,235,0.04)] ml-2.5 mr-2 flex items-center gap-1.5">医研千问</span>{" "}
                <span className="text-3xl select-none animate-bounce duration-1000"></span>
              </h1>
              <p className="text-[14px] text-gray-500 mb-8 font-medium leading-relaxed">
                基于大模型打造的医疗健康问答，致力于为用户提供精准、权威的临床知识解答！
              </p>

              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[13.5px] text-gray-600 font-bold tracking-wide">
                    试试以下例子
                  </span>
                  <button className="text-[#2b64e3] hover:text-blue-700 text-xs flex items-center font-bold tracking-wider transition-colors">
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    换一换
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div
                    onClick={() => {
                      handleSend(
                        "请帮我梳理ICH-GCP法规中关于严重不良事件(SAE)的报告流程和时间要求",
                      );
                    }}
                    className="group bg-blue-50/20 p-5 rounded-xl border border-blue-100/20 hover:bg-white hover:border-[#2b64e3]/30 hover:shadow-[0_4px_20px_rgba(43,100,227,0.05)] transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center text-blue-600 text-[14px] font-bold mb-2">
                        <span className="text-[18px] mr-2">📋</span>
                        SAE报告流程梳理
                      </div>
                      <p className="text-[12.5px] text-gray-500 leading-relaxed font-medium">
                        请帮我梳理ICH-GCP法规中关于严重不良事件(SAE)的报告流程和时间要求
                      </p>
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      handleSend(
                        "临床试验方案设计中，如何确定合理的样本量？需要考虑哪些统计学因素？",
                      );
                    }}
                    className="group bg-blue-50/20 p-5 rounded-xl border border-blue-100/20 hover:bg-white hover:border-[#2b64e3]/30 hover:shadow-[0_4px_20px_rgba(43,100,227,0.05)] transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center text-blue-600 text-[14px] font-bold mb-2">
                        <span className="text-[18px] mr-2">📊</span>
                        样本量计算要点
                      </div>
                      <p className="text-[12.5px] text-gray-500 leading-relaxed font-medium">
                        临床试验方案设计中，如何确定合理的样本量？需要考虑哪些统计学因素？
                      </p>
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      handleSend(
                        "EDC系统搭建时需要注意哪些关键点？如何确保数据录入的规范性和质量控制？",
                      );
                    }}
                    className="group bg-blue-50/20 p-5 rounded-xl border border-blue-100/20 hover:bg-white hover:border-[#2b64e3]/30 hover:shadow-[0_4px_20px_rgba(43,100,227,0.05)] transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center text-blue-600 text-[14px] font-bold mb-2">
                        <span className="text-[18px] mr-2">💾</span>
                        EDC系统搭建要点
                      </div>
                      <p className="text-[12.5px] text-gray-500 leading-relaxed font-medium">
                        EDC系统搭建时需要注意哪些关键点？如何确保数据录入的规范性和质量控制？
                      </p>
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      handleSend(
                        "II期临床试验的入排标准应该如何设计？请结合肿瘤适应症给出具体建议",
                      );
                    }}
                    className="group bg-blue-50/20 p-5 rounded-xl border border-blue-100/20 hover:bg-white hover:border-[#2b64e3]/30 hover:shadow-[0_4px_20px_rgba(43,100,227,0.05)] transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center text-blue-600 text-[14px] font-bold mb-2">
                        <span className="text-[18px] mr-2">🏥</span>
                        入排标准设计指南
                      </div>
                      <p className="text-[12.5px] text-gray-500 leading-relaxed font-medium">
                        II期临床试验的入排标准应该如何设计？请结合肿瘤适应症给出具体建议
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Predefined mock conversation for session-q-1 */}
              {activeSessionId === "session-q-1" && (
                <>
                  <div className="flex space-x-4">
                    <div className="w-10 h-10 shrink-0 bg-blue-100 rounded border border-blue-200 flex items-center justify-center text-[#083190]">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="flex-1 pt-2">
                      <div className="text-[15px] font-bold text-gray-800">
                        <HighlightText
                          text="临床试验方案设计依据是什么"
                          highlight={dialogSearchQuery}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <div className="w-10 h-10 shrink-0 bg-[#13316e] rounded flex items-center justify-center text-white font-bold text-lg leading-none shadow-sm">
                      临
                    </div>
                    <div className="flex-1 bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
                      <div className="text-[15px] text-gray-800 leading-[1.8] whitespace-pre-wrap">
                        <div className="space-y-4">
                          <p>
                            <HighlightText
                              text="您好，我是临研通研发的临床研究专用大模型 Driver AI，很高兴为您解答关于临床试验方案设计依据的问题。"
                              highlight={dialogSearchQuery}
                            />
                            <br />
                            <HighlightText
                              text="临床试验方案 (Protocol) 是整个试验的“宪法”和科学蓝图，其设计必须建立在严谨、合规、科学与伦理的基础之上。主要依据可归纳为以下五大维度，Driver AI 已为您系统梳理并标注关键要点："
                              highlight={dialogSearchQuery}
                            />
                          </p>
                          <h4 className="font-bold flex items-center text-[#13316e] mt-4 mb-2">
                            <span className="text-[18px] mr-1">🔹</span>
                            <HighlightText
                              text="一、法规与监管要求（强制性依据）"
                              highlight={dialogSearchQuery}
                            />
                          </h4>
                          <div className="flex items-center text-green-600 font-medium text-sm mb-1">
                            <CheckCircle2 className="w-4 h-4 mr-1" />{" "}
                            <HighlightText
                              text="国际层面："
                              highlight={dialogSearchQuery}
                            />
                          </div>
                          <ul className="list-disc pl-5 text-gray-700 space-y-1">
                            <li>
                              <HighlightText
                                text="ICH-GCP（《药物临床试验质量管理规范》）——核心伦理与质量框架"
                                highlight={dialogSearchQuery}
                              />
                            </li>
                            <li>
                              <HighlightText
                                text="ICH E3（临床研究报告结构）、E6(R3)（最新版GCP指南）、E8(R1)（临床试验总则）等"
                                highlight={dialogSearchQuery}
                              />
                            </li>
                          </ul>
                          <div className="flex items-center text-green-600 font-medium text-sm mb-1 mt-2">
                            <CheckCircle2 className="w-4 h-4 mr-1" />{" "}
                            <HighlightText
                              text="中国层面："
                              highlight={dialogSearchQuery}
                            />
                          </div>
                          <ul className="list-disc pl-5 text-gray-700 space-y-1">
                            <li>
                              <HighlightText
                                text="《中华人民共和国药品管理法》《药品注册管理办法》（2020年修订）"
                                highlight={dialogSearchQuery}
                              />
                            </li>
                            <li>
                              <HighlightText
                                text="《药物临床试验质量管理规范》（2020年版）"
                                highlight={dialogSearchQuery}
                              />
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {messages.map((msg, idx) => (
                <div key={idx} className="flex space-x-4">
                  {msg.role === "user" ? (
                    <>
                      <div className="w-10 h-10 shrink-0 bg-blue-100 rounded border border-blue-200 flex items-center justify-center text-[#083190]">
                        <User className="w-6 h-6" />
                      </div>
                      <div className="flex-1 pt-2">
                        <div className="text-[15px] font-bold text-gray-800">
                          {msg.content}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 shrink-0 bg-[#13316e] rounded flex items-center justify-center text-white font-bold text-lg leading-none shadow-sm">
                        临
                      </div>
                      <div className="flex-1 bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
                        <div className="text-[15px] text-gray-800 leading-[1.8] whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {messages.length > 0 && isUnarchived && !isTyping && (
                <div className="flex justify-center mt-6 animate-in fade-in duration-300">
                  <div className="bg-[#eff6ff] border border-blue-100 rounded-xl px-6 py-4 flex items-center justify-between w-full shadow-sm">
                    <div className="flex items-center text-[13.5px] text-gray-700 font-medium">
                      <FolderOpen className="w-4 h-4 mr-3 text-[#083190]" />
                      <span>该任务目前为<b>“未归档”</b>状态，是否归档到某个项目中？</span>
                    </div>
                    <button
                      onClick={() => {
                        setArchiveTargetProject("");
                        setShowArchiveModal(activeSessionId);
                      }}
                      className="px-5 py-2 bg-[#083190] hover:bg-blue-900 text-white font-bold rounded-lg text-[13px] transition-colors shadow-md active:scale-95"
                    >
                      立即归档
                    </button>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-4 left-0 right-0 px-10">
          <div className="max-w-4xl mx-auto relative bg-white border border-gray-200 rounded-xl shadow-[0_-10px_40px_rgb(0,0,0,0.03)] flex flex-col min-h-[100px]">
            <div className="flex-1 relative flex">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(input);
                  }
                }}
                placeholder="请输入你的问题或需求"
                className="w-full resize-none outline-none text-[15px] p-5 text-gray-800 placeholder:text-gray-400 bg-transparent flex-1 border-0"
              ></textarea>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <button className="flex items-center text-[13px] text-gray-500 hover:text-[#083190] transition-colors">
                  <Plus className="w-4 h-4 mr-1.5" />
                  上传
                </button>
                <button
                  onClick={() => handleSend(input)}
                  className="bg-[#2b64e3] hover:bg-[#1a4eb8] text-white p-2.5 rounded-lg transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4 -ml-0.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-3 text-[12px] text-gray-400 pb-2">
            内容由Totrial-Driver大模型生成，基于现有数据与算法，建议结合实际情况和专业判断使用。
          </div>
        </div>

        {/* decorative background element */}
        <div className="absolute right-0 top-1/4 w-[400px] h-[600px] pointer-events-none opacity-[0.03] overflow-hidden -z-10">
          <div className="w-[800px] h-[800px] border-[120px] border-blue-900 rounded-full absolute top-0 -right-[400px]"></div>
        </div>
      </div>

      {/* Right Sidebar: Artifacts */}
      {isArtifactsOpen && (
        <div 
          className={`shrink-0 flex flex-col bg-white relative z-20 shadow-[-20px_0_40px_rgba(0,0,0,0.02)] transition-all ${isArtifactsExpanded ? "fixed inset-0 z-[9999] w-full" : ""}`}
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
            artifacts={activeSessionId ? activeSession?.artifacts : null}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isChatting={!!activeSessionId}
            isExpanded={isArtifactsExpanded}
            onToggleExpand={() => setIsArtifactsExpanded(!isArtifactsExpanded)}
            onClose={() => setIsArtifactsOpen(false)}
          />
        </div>
      )}

      {/* Archive Modal */}
      <AnimatePresence>
        {showArchiveModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
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
                <div className="space-y-2 max-h-48 overflow-y-auto">
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

      {/* Share Modal */}
      <AnimatePresence>
        {shareModalInfo && (
          <ShareModal
            isOpen={!!shareModalInfo}
            onClose={() => setShareModalInfo(null)}
            shareUrl={shareModalInfo.url}
            title={shareModalInfo.title}
            messages={messages}
          />
        )}
      </AnimatePresence>

      {/* 新版分享配置弹窗 */}
      <AnimatePresence>
        {showShareConfigModal && activeSession && (
          <ShareConfigModal
            isOpen={showShareConfigModal}
            onClose={() => setShowShareConfigModal(false)}
            shareUrl={`https://totrial.com/share/qa/${activeSession.id}`}
            title={activeSession.title}
            sharerName="小雨滴"
            projectName={activeSession.project || "未归档项目"}
            onConfirm={(includeKB, sentTargets) => {
              console.log("分享配置：", { includeKnowledgeBase: includeKB, sentTargets });
              setShowShareConfigModal(false);
              // TODO: 实际分享逻辑
            }}
          />
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
