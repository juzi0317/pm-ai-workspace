import {
  History,
  Settings,
  FileText,
  Calendar,
  AlertCircle,
  Trash2,
  MessageSquare,
  Search,
  Send,
  Clock,
  ChevronDown,
  CheckCircle2,
  Plus,
  Loader2,
  X,
  List,
  MapPin,
  User,
  ChevronRight,
  ArrowRightLeft,
  Share2,
  PanelRightClose,
  FolderOpen,
  Check,
  Pin,
  Edit2,
  Paperclip,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import ShareModal from "./ShareModal";
import ArtifactsPanel, { SessionArtifacts } from "./ArtifactsPanel";
import { HighlightText } from "./HighlightText";

const SESSIONS = [
  {
    id: "session-m-1",
    title: "冠心宁片中保 - S1001 访视1",
    desc: "筛选号：1001",
    project: "冠心宁片中保临床方案",
    artifacts: {
      uploaded: [
        { id: "u1", name: "试验方案.pdf", type: "pdf" as const },
        { id: "u2", name: "空白CRF.pdf", type: "pdf" as const },
        { id: "u3", name: "受试者化验单.png", type: "png" as const },
        { id: "u4", name: "受试者病例.pdf", type: "pdf" as const },
      ],
      generated: [
        { id: "g1", name: "问题清单.xlsx", type: "xlsx" as const },
        { id: "g2", name: "完整报告.pdf", type: "pdf" as const },
      ],
    },
  },
  {
    id: "session-m-2",
    title: "琥珀酰明胶 - S2001 访视2",
    desc: "筛选号：2001",
    project: "盐酸安罗替尼胶囊",
    artifacts: {
      uploaded: [
        {
          id: "u5",
          name: "TW23315-华夏-琥珀酰明胶电解.pdf",
          type: "pdf" as const,
        },
      ],
      generated: [
        { id: "g3", name: "核查异常项列表.xlsx", type: "xlsx" as const },
      ],
    },
  },
  {
    id: "session-m-3",
    title: "盐酸安罗替尼 - S3011 筛选期",
    desc: "筛选号：3011",
    project: "盐酸安罗替尼胶囊",
    artifacts: {
      uploaded: [],
      generated: [],
    },
  },
  {
    id: "session-m-unassigned",
    title: "阿普唑仑片 - S1001 首次访视",
    desc: "筛选号：1001",
    project: "未归档",
    artifacts: {
      uploaded: [],
      generated: [],
    },
  },
];

type SetupState = {
  protocol: boolean;
  crf: boolean;
  consentDate: string;
  baselineDate: string;
  data: boolean;
};

function detectFileType(fileName: string): 'protocol' | 'crf' | 'data' | 'unknown' {
  const lower = fileName.toLowerCase();
  if (lower.includes('方案') || lower.includes('protocol')) return 'protocol';
  if (lower.includes('crf') || lower.includes('病例报告')) return 'crf';
  return 'data';
}

function getMissingText(state: SetupState): string {
  const missing: string[] = [];
  if (!state.protocol) missing.push('试验方案');
  if (!state.crf) missing.push('空白CRF');
  if (!state.data) missing.push('待查数据');
  if (!state.consentDate) missing.push('知情同意日期');
  if (!state.baselineDate) missing.push('D0基线日期');
  return missing.length > 0 ? `还需要：${missing.join('、')}` : '';
}

function CollectionStatusBar({ setupState }: { setupState: SetupState }) {
  const isSetupReady = setupState.protocol && setupState.crf && setupState.data;
  const items = [
    { label: '试验方案', ready: setupState.protocol, icon: FileText },
    { label: '空白CRF', ready: setupState.crf, icon: FileText },
    { label: '待查数据', ready: setupState.data, icon: FileText },
    { label: '知情日期', ready: !!setupState.consentDate, icon: Calendar },
    { label: '基线日期', ready: !!setupState.baselineDate, icon: Calendar },
  ];

  return (
    <div className="flex items-center gap-1.5 px-4 py-2 bg-white border-b border-gray-100 shrink-0 overflow-x-auto">
      <span className="text-[12px] text-gray-400 font-medium mr-1 shrink-0">收集进度</span>
      {items.map((item) => (
        <span
          key={item.label}
          className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 flex items-center gap-1 ${
            item.ready
              ? 'bg-blue-50 text-[#083190] border border-blue-100/60'
              : 'bg-gray-50 text-gray-400 border border-gray-100'
          }`}
        >
          {item.ready ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : (
            <span className="w-3 h-3 rounded-full border border-gray-300 inline-block" />
          )}
          {item.label}
        </span>
      ))}
      {isSetupReady && (
        <span className="text-[11px] text-green-600 font-bold ml-auto shrink-0 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> 材料已齐
        </span>
      )}
    </div>
  );
}

const getProjectFilesForField = (project: string, field: 'protocol' | 'crf' | 'data') => {
  const isAnluo = project === "盐酸安罗替尼胶囊";
  const isGuan = project === "冠心宁片中保临床方案";
  
  if (field === 'protocol') {
    if (isAnluo) return [{ name: "盐酸安罗替尼临床试验方案.pdf", size: "4.1MB", type: "临床方案" }];
    if (isGuan) return [{ name: "冠心宁片中保临床方案.pdf", size: "1.8MB", type: "临床方案" }];
    return [
      { name: "盐酸安罗替尼临床试验方案.pdf", size: "4.1MB", type: "临床方案" },
      { name: "冠心宁片中保临床方案.pdf", size: "1.8MB", type: "临床方案" }
    ];
  } else if (field === 'crf') {
    if (isAnluo) return [{ name: "空白CRF_安罗替尼V1.pdf", size: "940KB", type: "CRF表" }];
    if (isGuan) return [{ name: "空白CRF_冠心宁片.pdf", size: "1.1MB", type: "CRF表" }];
    return [
      { name: "空白CRF_安罗替尼V1.pdf", size: "940KB", type: "CRF表" },
      { name: "空白CRF_冠心宁片.pdf", size: "1.1MB", type: "CRF表" }
    ];
  } else {
    if (isAnluo) return [{ name: "李四_住院病历摘要.pdf", size: "1.2MB", type: "源数据" }];
    if (isGuan) return [{ name: "冠心宁01002(OCR).pdf", size: "241KB", type: "源数据" }];
    return [
      { name: "李四_住院病历摘要.pdf", size: "1.2MB", type: "源数据" },
      { name: "冠心宁01002(OCR).pdf", size: "241KB", type: "源数据" }
    ];
  }
};

export default function AIMonitoring({ selectedProject = "全部" }: { selectedProject?: string }) {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogSearchQuery, setDialogSearchQuery] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingSessionTitle, setEditingSessionTitle] = useState("");

  const [checkState, setCheckState] = useState<
    "idle" | "checking" | "completed"
  >("idle");
  const [checkStep, setCheckStep] = useState(0);
  const [showReport, setShowReport] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [setupState, setSetupState] = useState<SetupState>({
    protocol: false,
    crf: false,
    consentDate: "",
    baselineDate: "",
    data: false,
  });

  const isSetupReady = setupState.protocol && setupState.crf && setupState.data;

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState(SESSIONS);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState<string | null>(null);
  const [archiveTargetProject, setArchiveTargetProject] = useState<string>("");
  const [shareModalInfo, setShareModalInfo] = useState<{ url: string; title: string } | null>(null);

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
      if (newWidth >= 300 && newWidth <= 800) {
        setRightPanelWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
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

  const chatFileInputRef = useRef<HTMLInputElement>(null);

  const handleChatFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const fileNames = files.map(f => f.name).join("、");

      // Auto-detect file types and update setup state
      const detected: string[] = [];
      const updated = { ...setupState };
      files.forEach(f => {
        const type = detectFileType(f.name);
        if (type === 'protocol' && !updated.protocol) {
          updated.protocol = true;
          detected.push('试验方案');
        } else if (type === 'crf' && !updated.crf) {
          updated.crf = true;
          detected.push('空白CRF');
        } else if (type === 'data' && !updated.data) {
          updated.data = true;
          detected.push('待查数据');
        }
      });
      setSetupState(updated);

      // Ensure session exists
      if (activeSessionId === null) {
        const newSession = {
          id: `session-m-${Date.now()}`,
          title: detected.length > 0 ? detected.join('+') + ' 核查' : '新核查任务',
          desc: "通过上传文件发起",
          project: selectedProject === "全部" ? "未归档" : selectedProject,
          artifacts: { uploaded: [], generated: [] },
        };
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
      }

      setMessages((prev) => [
        ...prev,
        { role: "user" as const, content: `📎 已上传文件：${fileNames}` },
      ]);

      const updatedReady = updated.protocol && updated.crf && updated.data;
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai" as const,
            content: updatedReady
              ? `已收到文件，识别为：${detected.join('、')}。所有必需材料已齐备，是否开始核查？`
              : `已收到文件，识别为：${detected.length > 0 ? detected.join('、') : '待查数据'}。${getMissingText(updated)}`,
            action: updatedReady ? 'startCheck' : undefined,
          },
        ]);
      }, 800);
    }
    if (chatFileInputRef.current) {
      chatFileInputRef.current.value = "";
    }
  };

  const handleStartCheck = () => {
    setCheckState("checking");
    setCheckStep(0);
    // setIsSidebarOpen(false); // Auto hide sidebar

    // Simulate steps sequentially
    setTimeout(() => setCheckStep(1), 500);
    setTimeout(() => setCheckStep(2), 1000);
    setTimeout(() => setCheckStep(3), 1500);
    setTimeout(() => {
      setCheckStep(4);
      setCheckState("completed");
    }, 2000);
  };

  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: React.ReactNode; isTyping?: boolean; action?: string }[]>([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("TotrialDriver3.0");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Welcome message on mount
  useEffect(() => {
    if (activeSessionId === null && messages.length === 0) {
      setMessages([{
        role: "ai",
        content: "欢迎使用 AI Monitoring 临床智能核查助手！\n\n请上传试验方案、空白CRF和待查数据，或在下方输入核查需求。我会在材料齐备后提示您开始核查。",
      }]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, checkState, checkStep]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Create session if needed
    if (activeSessionId === null) {
      const newSession = {
        id: `session-m-${Date.now()}`,
        title: text.trim().slice(0, 24),
        desc: "通过输入框发起的核查",
        project: selectedProject === "全部" ? "未归档" : selectedProject,
        artifacts: { uploaded: [], generated: [] },
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
    }

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");

    // Intent detection
    const lower = text.toLowerCase();
    const isStartCheck = lower.includes('开始核查') || lower.includes('开始吧') || lower.includes('开始检查');
    const hasDateKeyword = lower.includes('日期') || lower.includes('基线') || lower.includes('知情同意');

    // Detect date in text: patterns like "2024-03-01" or "2024年3月1日"
    const dateMatch = text.match(/(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}[日]?)/);

    if (isStartCheck) {
      if (isSetupReady) {
        handleStartCheck();
        setTimeout(() => {
          setMessages((prev) => [...prev, { role: "ai", content: "好的，正在启动智能核查，请稍候..." }]);
        }, 300);
      } else {
        setTimeout(() => {
          setMessages((prev) => [...prev, { role: "ai", content: `材料尚未齐备，${getMissingText(setupState)}。请补充后重试。` }]);
        }, 500);
      }
    } else if (dateMatch) {
      // Try to set date parameters
      const dateVal = dateMatch[1].replace(/[年月]/g, '-').replace(/日/g, '');
      const updated = { ...setupState };
      if (lower.includes('基线') || lower.includes('d0')) {
        updated.baselineDate = dateVal;
      } else if (lower.includes('知情')) {
        updated.consentDate = dateVal;
      } else if (!updated.consentDate) {
        updated.consentDate = dateVal;
      } else if (!updated.baselineDate) {
        updated.baselineDate = dateVal;
      }
      setSetupState(updated);
      const updatedReady = updated.protocol && updated.crf && updated.data;
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: updatedReady
              ? `已设置日期参数。所有必需材料已齐备，是否开始核查？`
              : `已设置日期参数。${getMissingText(updated)}`,
            action: updatedReady ? 'startCheck' : undefined,
          },
        ]);
      }, 500);
    } else if (lower.includes('新增') || lower.includes('再') || lower.includes('重新')) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: "已收到新病历材料指示，即将开始新一轮智能核查..." },
        ]);
        setTimeout(() => {
          setCheckState("idle");
          setCheckStep(0);
          handleStartCheck();
        }, 1500);
      }, 800);
    } else {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: isSetupReady
              ? `已收到您的反馈。当前材料已齐备，您也可以直接说"开始核查"启动核查。`
              : `已收到您的反馈。${getMissingText(setupState)}`,
            action: isSetupReady ? 'startCheck' : undefined,
          },
        ]);
      }, 800);
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  // Derive artifacts conditionally. If not completed, hide generated documents.
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
      <div className={`${isSidebarOpen ? "w-64" : "w-0"} transition-all duration-300 bg-white border-r border-gray-100 flex flex-col shrink-0 relative z-20 overflow-hidden`}>
        <div className="p-4 w-64">
          <button
            onClick={() => {
              setActiveSessionId(null);
              setCheckState("idle");
              setCheckStep(0);
              setMessages([]);
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
          {sortedSessions.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setActiveSessionId(item.id);
                setCheckState("completed");
                setCheckStep(4);
                setMessages([]);
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
                      <MessageSquare
                        className={`w-3.5 h-3.5 mr-2 mt-0.5 shrink-0 ${item.id === activeSessionId ? "text-[#083190]" : "text-gray-400"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center min-w-0">
                          {(item as any).isPinned && (
                            <Pin className="w-3 h-3 text-[#083190] mr-1 shrink-0 rotate-45" />
                          )}
                          <span className="truncate text-[13px] font-semibold">{item.title}</span>
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
      <div className="flex-1 bg-white flex flex-col relative overflow-hidden">
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
                      placeholder="搜索核查任务..."
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
                    title="搜索核查任务内容"
                  >
                    <Search className="w-[16px] h-[16px]" />
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  if (activeSession) {
                    setShareModalInfo({
                      url: `https://totrial.com/share/monitoring/${activeSession.id}`,
                      title: activeSession.title
                    });
                  }
                }}
                className="p-1.5 text-gray-500 hover:text-[#083190] hover:bg-white rounded transition-all"
                title="分享任务"
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

        {/* Collection Status Bar - always visible */}
        <CollectionStatusBar setupState={setupState} />

        {/* Scrollable chat area */}
        <div className="flex-1 overflow-y-auto bg-[#f5f7fa]">
          <div className="w-full px-6">
            {/* Example cards - only when no session and initial state */}
            {activeSessionId === null && (
              <div className="pt-6 pb-2">
                <div className="text-center mb-6">
                  <h1 className="text-[24px] font-bold text-gray-900 mb-2 tracking-tight">
                    AI Monitoring 临床智能核查
                  </h1>
                  <p className="text-[13px] text-gray-500">
                    上传材料或描述需求，AI 引导完成核查
                  </p>
                </div>
                <div className="mb-4 w-full">
                  <div className="text-[12px] text-gray-500 mb-2 font-medium">💡 快速体验示例：</div>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        const newSession = {
                          id: `session-m-${Date.now()}`,
                          title: "冠心宁片 - S1001 访视1",
                          desc: "筛选号：1001",
                          project: "冠心宁片中保临床方案",
                          artifacts: {
                            uploaded: [
                              { id: "u-demo1-1", name: "试验方案.pdf", type: "pdf" as const },
                              { id: "u-demo1-2", name: "空白CRF.pdf", type: "pdf" as const },
                              { id: "u-demo1-3", name: "受试者化验单.png", type: "png" as const },
                              { id: "u-demo1-4", name: "受试者病例.pdf", type: "pdf" as const },
                            ],
                            generated: [],
                          },
                        };
                        setSessions(prev => [newSession, ...prev]);
                        setActiveSessionId(newSession.id);
                        setSetupState({
                          protocol: true,
                          crf: true,
                          consentDate: "2025-10-15",
                          baselineDate: "2025-10-20",
                          data: true,
                        });
                        setMessages([]);
                        setCheckState("checking");
                        setCheckStep(0);
                        setTimeout(() => setCheckStep(1), 500);
                        setTimeout(() => setCheckStep(2), 1000);
                        setTimeout(() => setCheckStep(3), 1500);
                        setTimeout(() => { setCheckStep(4); setCheckState("completed"); }, 2000);
                      }}
                      className="text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all group shadow-sm"
                    >
                      <div className="text-[13px] font-bold text-gray-800 group-hover:text-[#083190] mb-1.5">
                        示例1：冠心宁片受试者核查
                      </div>
                      <div className="text-[11px] text-gray-500 leading-relaxed">
                        筛选号 1001 · 访视1 · 稳定性劳累性心绞痛
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        const newSession = {
                          id: `session-m-${Date.now() + 1}`,
                          title: "盐酸安罗替尼 - S2001 访视2",
                          desc: "筛选号：2001",
                          project: "盐酸安罗替尼胶囊",
                          artifacts: {
                            uploaded: [
                              { id: "u-demo2-1", name: "TW23315-华夏-琥珀酰明胶电解.pdf", type: "pdf" as const },
                              { id: "u-demo2-2", name: "试验方案.pdf", type: "pdf" as const },
                              { id: "u-demo2-3", name: "空白CRF.pdf", type: "pdf" as const },
                            ],
                            generated: [],
                          },
                        };
                        setSessions(prev => [newSession, ...prev]);
                        setActiveSessionId(newSession.id);
                        setSetupState({
                          protocol: true,
                          crf: true,
                          consentDate: "2025-11-05",
                          baselineDate: "2025-11-10",
                          data: true,
                        });
                        setMessages([]);
                        setTimeout(() => handleStartCheck(), 300);
                      }}
                      className="text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all group shadow-sm"
                    >
                      <div className="text-[13px] font-bold text-gray-800 group-hover:text-[#083190] mb-1.5">
                        示例2：盐酸安罗替尼数据核查
                      </div>
                      <div className="text-[11px] text-gray-500 leading-relaxed">
                        筛选号 2001 · 访视2 · 晚期非小细胞肺癌
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Check step cards - shown when checking/completed */}
            {activeSessionId !== null && checkState !== "idle" && (
              <div className="pt-6 pb-4">
              {checkState === "idle" ? null : (
                <>
                  <div className="w-full max-w-4xl mx-auto flex mb-6 justify-end">
                    <div className="bg-green-50/50 border border-green-100/50 rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-[13px] text-gray-700 flex flex-col w-full max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-white px-3 py-1.5 rounded shadow-[0_1px_2px_rgba(0,0,0,0.03)] border border-gray-100 text-gray-600 font-medium">
                          冠心宁01002-clip.pdf
                        </span>
                        <span className="bg-white px-3 py-1.5 rounded shadow-[0_1px_2px_rgba(0,0,0,0.03)] border border-gray-100 text-gray-600 font-medium">
                          冠心宁10009-clip.pdf
                        </span>
                        <span className="bg-white px-3 py-1.5 rounded shadow-[0_1px_2px_rgba(0,0,0,0.03)] border border-gray-100 text-gray-600">
                          2026-07-22 00:00:00
                        </span>
                        <span className="bg-white px-3 py-1.5 rounded shadow-[0_1px_2px_rgba(0,0,0,0.03)] border border-gray-100 text-gray-600">
                          2026-07-23 00:00:00
                        </span>
                        <span className="font-semibold text-gray-800 ml-2">
                          <HighlightText
                            text="请根据材料完成数据核查"
                            highlight={searchQuery}
                          />
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-3">17:34</div>
                    </div>
                  </div>

                <div className="border border-gray-100 rounded-xl shadow-sm p-8 max-w-4xl w-full bg-gray-50/30">
                  <div className="flex items-start mb-6">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#083190] flex items-center justify-center mr-3 mt-1 shrink-0">
                      <Search className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-[15px]">
                        <HighlightText
                          text="开始智能核查"
                          highlight={searchQuery}
                        />
                      </h3>
                      <p className="text-[12px] text-gray-500 mt-0.5">
                        <HighlightText
                          text="正在分析试验方案和CRF数据，识别潜在的数据质量问题..."
                          highlight={searchQuery}
                        />
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Step 1: 解析试验方案 */}
                    <div className="bg-blue-50/40 rounded-xl border border-blue-100 overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-3">
                        <div className="flex items-center">
                          {checkStep > 0 || checkState === "completed" ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                          ) : (
                            <Loader2 className="w-5 h-5 text-[#083190] mr-3 animate-spin" />
                          )}
                          <span className="text-[15px] font-medium text-[#083190]">
                            解析实验方案
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-[13px] text-blue-400">
                          {checkStep > 0 || checkState === "completed" ? (
                            <>
                              <button className="bg-orange-300 hover:bg-orange-400 text-white px-3 py-1 rounded transition-colors text-[12px]">
                                重试
                              </button>
                              <span className="flex items-center">
                                <Clock className="w-3.5 h-3.5 mr-1" /> 1m9s
                              </span>
                              <ChevronDown className="w-4 h-4 text-blue-300" />
                            </>
                          ) : null}
                        </div>
                      </div>

                      {(checkStep > 0 || checkState === "completed") && (
                        <div className="px-5 pb-5 pt-2">
                          <div className="space-y-2.5 pl-8 text-[13px] text-gray-700">
                            <div className="flex items-start">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" />{" "}
                              <span className="text-gray-500 mr-1">
                                项目名称：
                              </span>
                              冠心宁片治疗稳定型劳累性心绞痛(血瘀证)的多中心、随机、双盲、阳性药物平行对照临床试验
                            </div>
                            <div className="flex items-center">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 shrink-0" />{" "}
                              <span className="text-gray-500 mr-1">
                                方案编号：
                              </span>
                              TW-24085
                            </div>
                            <div className="flex items-center">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 shrink-0" />{" "}
                              <span className="text-gray-500 mr-1">
                                试验分期：
                              </span>
                            </div>
                            <div className="flex items-center">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 shrink-0" />{" "}
                              <span className="text-gray-500 mr-1">
                                治疗领域：
                              </span>
                            </div>
                            <div className="flex items-center">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 shrink-0" />{" "}
                              <span className="text-gray-500 mr-1">
                                纳入标准：
                              </span>
                              3条
                            </div>
                            <div className="flex items-center">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 shrink-0" />{" "}
                              <span className="text-gray-500 mr-1">
                                排除标准：
                              </span>
                              0条
                            </div>
                            <div className="flex items-center">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 shrink-0" />{" "}
                              <span className="text-gray-500 mr-1">
                                访视计划：
                              </span>
                              1个访视
                            </div>
                            <div className="flex items-start">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" />{" "}
                              <span className="text-gray-500 mr-1 shrink-0">
                                采集项：
                              </span>
                              体格检查、理化检查、中医辨证及中医证候量表、静脉采血、粪便隐血试验(OB)、粪便常规检查、生化全套、心电图、动态血压、心脏超声、头胸CT
                            </div>
                            <div className="flex items-center pt-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 shrink-0" />{" "}
                              [解析完成] 方案解析完成
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Step 2: 分析CRF/病历 */}
                    {(checkStep > 0 || checkState === "completed") && (
                      <div className="bg-blue-50/40 rounded-xl border border-blue-100 overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3">
                          <div className="flex items-center">
                            {checkStep > 1 || checkState === "completed" ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                            ) : (
                              <Loader2 className="w-5 h-5 text-[#083190] mr-3 animate-spin" />
                            )}
                            <span className="text-[15px] font-medium text-[#083190]">
                              分析CRF/病历
                            </span>
                          </div>
                          <div className="flex items-center space-x-3 text-[13px] text-blue-400">
                            {checkStep > 1 || checkState === "completed" ? (
                              <>
                                <button className="bg-orange-300 hover:bg-orange-400 text-white px-3 py-1 rounded transition-colors text-[12px]">
                                  重试
                                </button>
                                <span className="flex items-center">
                                  <Clock className="w-3.5 h-3.5 mr-1" /> 20s
                                </span>
                                <ChevronDown className="w-4 h-4 text-blue-300" />
                              </>
                            ) : null}
                          </div>
                        </div>

                        {(checkStep > 1 || checkState === "completed") && (
                          <div className="px-5 pb-5 pt-2">
                            <div className="space-y-2.5 pl-8 text-[13px] text-gray-700">
                              <div className="flex items-center">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 shrink-0" />{" "}
                                <span className="text-gray-500 w-16">AST:</span>{" "}
                                30
                              </div>
                              <div className="flex items-center">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 shrink-0" />{" "}
                                <span className="text-gray-500 w-16">ALT:</span>{" "}
                                25
                              </div>
                              <div className="flex items-center">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 shrink-0" />{" "}
                                <span className="text-gray-500 w-16">
                                  舒张压:
                                </span>{" "}
                                80
                              </div>
                              <div className="flex items-center">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 shrink-0" />{" "}
                                <span className="text-gray-500 w-16">
                                  收缩压:
                                </span>{" "}
                                120
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 3: 深度核查 */}
                    {(checkStep > 1 || checkState === "completed") && (
                      <div className="bg-blue-50/40 rounded-xl border border-blue-100 overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3">
                          <div className="flex items-center">
                            {checkStep > 2 || checkState === "completed" ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                            ) : (
                              <Loader2 className="w-5 h-5 text-[#083190] mr-3 animate-spin" />
                            )}
                            <span className="text-[15px] font-medium text-[#083190]">
                              深度核查
                            </span>
                          </div>
                          <div className="flex items-center space-x-3 text-[13px] text-blue-400">
                            {checkStep > 2 || checkState === "completed" ? (
                              <>
                                <button className="bg-orange-300 hover:bg-orange-400 text-white px-3 py-1 rounded transition-colors text-[12px]">
                                  重试
                                </button>
                                <span className="flex items-center">
                                  <Clock className="w-3.5 h-3.5 mr-1" /> 41s
                                </span>
                                <ChevronDown className="w-4 h-4 text-blue-300" />
                              </>
                            ) : null}
                          </div>
                        </div>

                        {(checkStep > 2 || checkState === "completed") && (
                          <div className="px-5 pb-5 pt-2">
                            <div className="pl-8">
                              <div className="flex flex-wrap gap-x-6 gap-y-3 mb-6 text-[13px]">
                                <div className="flex items-center text-orange-500">
                                  <AlertCircle className="w-4 h-4 mr-1.5" />{" "}
                                  知情同意核查{" "}
                                  <span className="ml-1 opacity-80">
                                    (发现 1 个问题)
                                  </span>
                                </div>
                                <div className="flex items-center text-orange-500">
                                  <AlertCircle className="w-4 h-4 mr-1.5" />{" "}
                                  入排标准核查{" "}
                                  <span className="ml-1 opacity-80">
                                    (发现 1 个问题)
                                  </span>
                                </div>
                                <div className="flex items-center text-orange-500">
                                  <AlertCircle className="w-4 h-4 mr-1.5" />{" "}
                                  访视时间窗合规性{" "}
                                  <span className="ml-1 opacity-80">
                                    (发现 1 个问题)
                                  </span>
                                </div>
                                <div className="flex items-center text-green-500">
                                  <CheckCircle2 className="w-4 h-4 mr-1.5" />{" "}
                                  方案偏离记录
                                </div>
                                <div className="flex items-center text-orange-500">
                                  <AlertCircle className="w-4 h-4 mr-1.5" />{" "}
                                  关键数据完整性{" "}
                                  <span className="ml-1 opacity-80">
                                    (发现 1 个问题)
                                  </span>
                                </div>
                                <div className="flex items-center text-orange-500">
                                  <AlertCircle className="w-4 h-4 mr-1.5" />{" "}
                                  一致性/缺失值{" "}
                                  <span className="ml-1 opacity-80">
                                    (发现 1 个问题)
                                  </span>
                                </div>
                                <div className="flex items-center text-green-500">
                                  <CheckCircle2 className="w-4 h-4 mr-1.5" />{" "}
                                  SAE报告
                                </div>
                                <div className="flex items-center text-green-500">
                                  <CheckCircle2 className="w-4 h-4 mr-1.5" />{" "}
                                  不良事件数据
                                </div>
                              </div>

                              <div className="text-red-500 text-[14px] font-bold mb-4 flex items-center">
                                <span className="text-lg mr-2 font-light">
                                  ×
                                </span>{" "}
                                发现 5 个问题：严重 1 个、重要 3 个
                              </div>

                              <div className="bg-[#fcf8ff] rounded-xl p-4 mb-6 border border-purple-100">
                                <div className="flex items-start text-[13px]">
                                  <MessageSquare className="w-4 h-4 text-purple-600 mr-2 mt-0.5 shrink-0" />
                                  <div>
                                    <div className="font-bold text-purple-900 mb-1">
                                      共核查9个字段，发现5个主要问题。
                                    </div>
                                    <div className="text-purple-700 mb-1 opacity-90">
                                      数据完整性较差，关键医学检查数据大量缺失。
                                    </div>
                                    <div className="text-purple-700 opacity-90">
                                      主要问题集中在日期逻辑严重冲突（未来日期
                                      vs
                                      过去日期）以及筛选期核心入排标准数据（中医辨证、全面化验）的缺失。
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div
                                id="issue-list"
                                className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm"
                              >
                                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                  <h4 className="font-bold text-[15px] text-gray-800">
                                    问题清单 (5 项)
                                  </h4>
                                  <button className="flex items-center text-[12px] text-gray-600 border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">
                                    <span className="mr-1">↓</span> 导出 Excel
                                  </button>
                                </div>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-[13px] text-left">
                                    <thead className="bg-gray-50/50 text-gray-600 font-medium border-b border-gray-100">
                                      <tr>
                                        <th className="py-3 px-4">序号</th>
                                        <th className="py-3 px-4">发起日期</th>
                                        <th className="py-3 px-4">中心名称</th>
                                        <th className="py-3 px-4">患者姓名</th>
                                        <th className="py-3 px-4">住院号</th>
                                        <th className="py-3 px-4">所属访视</th>
                                        <th className="py-3 px-4">等级</th>
                                        <th className="py-3 px-4">核查维度</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {[
                                        {
                                          id: "ISSUE-001",
                                          date: "2024-01-15...",
                                          center: "未提供",
                                          name: "张三",
                                          no: "100234",
                                          visit: "筛选期",
                                          level: "Critical",
                                          dim: "知情同意日...",
                                        },
                                        {
                                          id: "ISSUE-002",
                                          date: "2024-01-15...",
                                          center: "未提供",
                                          name: "张三",
                                          no: "100234",
                                          visit: "筛选期",
                                          level: "Major",
                                          dim: "筛选期访视...",
                                        },
                                        {
                                          id: "ISSUE-003",
                                          date: "2024-01-15...",
                                          center: "未提供",
                                          name: "张三",
                                          no: "100234",
                                          visit: "筛选期",
                                          level: "Major",
                                          dim: "关键实验室...",
                                        },
                                        {
                                          id: "ISSUE-004",
                                          date: "2024-01-15...",
                                          center: "未提供",
                                          name: "张三",
                                          no: "100234",
                                          visit: "筛选期",
                                          level: "Major",
                                          dim: "中医辨证及...",
                                        },
                                        {
                                          id: "ISSUE-005",
                                          date: "2024-01-15...",
                                          center: "未提供",
                                          name: "张三",
                                          no: "100234",
                                          visit: "筛选期",
                                          level: "Minor",
                                          dim: "CRF字段缺...",
                                        },
                                      ].map((row, i) => (
                                        <tr
                                          key={i}
                                          className="hover:bg-gray-50/50"
                                        >
                                          <td className="py-3 px-4 text-gray-700">
                                            {row.id}
                                          </td>
                                          <td className="py-3 px-4 text-gray-500">
                                            {row.date}
                                          </td>
                                          <td className="py-3 px-4 text-gray-500">
                                            {row.center}
                                          </td>
                                          <td className="py-3 px-4 text-gray-700">
                                            {row.name}
                                          </td>
                                          <td className="py-3 px-4 text-gray-500">
                                            {row.no}
                                          </td>
                                          <td className="py-3 px-4 text-gray-500">
                                            {row.visit}
                                          </td>
                                          <td className="py-3 px-4">
                                            <span
                                              className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                                row.level === "Critical"
                                                  ? "bg-red-100 text-red-500"
                                                  : row.level === "Major"
                                                    ? "bg-orange-100 text-orange-500"
                                                    : "bg-green-100 text-green-500"
                                              }`}
                                            >
                                              {row.level}
                                            </span>
                                          </td>
                                          <td className="py-3 px-4 text-gray-700">
                                            {row.dim}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 4: 生成报告 */}
                    {(checkStep > 2 || checkState === "completed") && (
                      <div className="bg-blue-50/40 rounded-xl border border-blue-100 overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3">
                          <div className="flex items-center">
                            {checkStep > 3 || checkState === "completed" ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                            ) : (
                              <Loader2 className="w-5 h-5 text-[#083190] mr-3 animate-spin" />
                            )}
                            <span className="text-[15px] font-medium text-[#083190]">
                              生成报告
                            </span>
                          </div>
                          <div className="flex items-center space-x-3 text-[13px] text-blue-400">
                            {checkStep > 3 || checkState === "completed" ? (
                              <>
                                <button className="bg-orange-300 hover:bg-orange-400 text-white px-3 py-1 rounded transition-colors text-[12px]">
                                  重试
                                </button>
                                <span className="flex items-center">
                                  <Clock className="w-3.5 h-3.5 mr-1" /> 0s
                                </span>
                                <ChevronDown className="w-4 h-4 text-blue-300" />
                              </>
                            ) : null}
                          </div>
                        </div>

                        {(checkStep > 3 || checkState === "completed") && (
                          <div className="px-5 pb-5 pt-2">
                            <div className="space-y-2.5 pl-8 text-[13px] text-gray-700">
                              <div className="flex items-center">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 shrink-0" />{" "}
                                完成8个维度的全面核查
                              </div>
                              <div className="flex items-center">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 shrink-0" />{" "}
                                发现5个问题:严重1个、重要3个、轻微1个
                              </div>
                            </div>

                            <div className="mt-8 bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                              <h3 className="font-bold text-green-600 text-[15px] flex items-center mb-4">
                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                核查完成
                              </h3>

                              <div className="flex items-end mb-4">
                                <span className="text-[32px] font-bold text-gray-800 mr-3 leading-none">
                                  5
                                </span>
                                <span className="text-gray-500 text-[14px] mb-1 font-medium mr-4">
                                  个问题
                                </span>
                                <span className="bg-red-400 text-white text-[12px] px-3 py-0.5 rounded-full font-medium mr-2 mb-1">
                                  Critical 1
                                </span>
                                <span className="bg-orange-400 text-white text-[12px] px-3 py-0.5 rounded-full font-medium mr-2 mb-1">
                                  Major 3
                                </span>
                                <span className="bg-green-500 text-white text-[12px] px-3 py-0.5 rounded-full font-medium mb-1">
                                  Minor 1
                                </span>
                              </div>

                              <div className="bg-red-50 text-red-500 border border-red-100 text-[13px] p-3 rounded-lg mb-6 font-medium">
                                <HighlightText
                                  text="发现 1 个严重问题，可能影响受试者安全或数据可靠性，建议立即处理。"
                                  highlight={searchQuery}
                                />
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex space-x-3">
                                  <button
                                    onClick={() =>
                                      document
                                        .getElementById("issue-list")
                                        ?.scrollIntoView({ behavior: "smooth" })
                                    }
                                    className="bg-[#083190] hover:bg-blue-900 text-white text-[13px] font-medium py-2 px-5 rounded-lg flex items-center transition-colors shadow-sm"
                                  >
                                    <AlertCircle className="w-4 h-4 mr-1.5" />{" "}
                                    查看问题清单
                                  </button>
                                  <button
                                    onClick={() => setShowReport(true)}
                                    className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-[13px] font-medium py-2 px-5 rounded-lg flex items-center transition-colors shadow-sm"
                                  >
                                    <FileText className="w-4 h-4 mr-1.5" />{" "}
                                    完整报告
                                  </button>
                                </div>
                                <button
                                  onClick={() => {
                                    setCheckState("idle");
                                    setCheckStep(0);
                                  }}
                                  className="text-gray-500 text-[13px] font-medium hover:text-gray-800 transition-colors"
                                >
                                  重新核查
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-[12px] text-gray-400 mt-4 pl-4">
                    06-10
                  </div>
                </div>
                </>
              )}

              {messages.length > 0 && (
                <div className="space-y-4 pb-4 w-full">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "ai" && (
                        <div className="w-full">
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 rounded-full bg-blue-50 text-[#083190] flex items-center justify-center mr-2 shrink-0">
                              <Search className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[12px] font-medium text-gray-600">AI 核查助手</span>
                          </div>
                          <div className="bg-white rounded-xl p-4 text-[13px] text-gray-800 leading-relaxed border border-gray-100 w-full whitespace-pre-wrap">
                            {msg.content}
                            {msg.action === 'startCheck' && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <button
                                  onClick={() => {
                                    handleStartCheck();
                                    setMessages(prev => [...prev, { role: "ai", content: "好的，正在启动智能核查，请稍候..." }]);
                                  }}
                                  className="px-4 py-1.5 bg-[#083190] text-white text-[12px] font-bold rounded-lg hover:bg-[#002d70] transition-colors flex items-center"
                                >
                                  <Search className="w-3.5 h-3.5 mr-1.5" /> 开始核查
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {msg.role === "user" && (
                        <div className="bg-[#eef2ff] rounded-xl p-4 max-w-lg">
                          <div className="text-[13px] text-gray-800 leading-relaxed">
                            {msg.content}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-2">
                            {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
              {activeSession && (!activeSession.project || activeSession.project === "未归档" || activeSession.project === "未分配") && (
                <div className="flex justify-center mt-6 w-full max-w-xl animate-in fade-in duration-300">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3.5 flex items-center justify-between w-full shadow-sm">
                    <div className="flex items-center text-[13px] text-gray-700">
                      <FolderOpen className="w-4 h-4 mr-2 text-[#083190]" />
                      <span>该任务目前为<b>"未归档"</b>状态，是否归档到某个项目中？</span>
                    </div>
                    <button
                      onClick={() => {
                        setArchiveTargetProject("");
                        setShowArchiveModal(activeSessionId);
                      }}
                      className="px-3.5 py-1.5 bg-[#083190] hover:bg-blue-900 text-white font-bold rounded-lg text-[12px] transition-colors whitespace-nowrap ml-2 shrink-0"
                    >
                      立即归档
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

              {/* 示例卡片 */}
              <div className="mb-4 w-full">
                <div className="text-[12px] text-gray-500 mb-2 font-medium">💡 快速体验示例：</div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      const newSession = {
                        id: `session-m-${Date.now()}`,
                        title: "冠心宁片 - S1001 访视1",
                        desc: "筛选号：1001",
                        project: "冠心宁片中保临床方案",
                        artifacts: {
                          uploaded: [
                            { id: "u-demo1-1", name: "试验方案.pdf", type: "pdf" as const },
                            { id: "u-demo1-2", name: "空白CRF.pdf", type: "pdf" as const },
                            { id: "u-demo1-3", name: "受试者化验单.png", type: "png" as const },
                            { id: "u-demo1-4", name: "受试者病例.pdf", type: "pdf" as const },
                          ],
                          generated: [],
                        },
                      };
                      setSessions(prev => [newSession, ...prev]);
                      setActiveSessionId(newSession.id);
                      setSetupState({
                        protocol: true,
                        crf: true,
                        consentDate: "2025-10-15",
                        baselineDate: "2025-10-20",
                        data: true,
                      });
                      // 直接进入核查进度，跳过"准备就绪"页
                      setCheckState("checking");
                      setCheckStep(0);
                      setTimeout(() => setCheckStep(1), 500);
                      setTimeout(() => setCheckStep(2), 1000);
                      setTimeout(() => setCheckStep(3), 1500);
                      setTimeout(() => { setCheckStep(4); setCheckState("completed"); }, 2000);
                    }}
                    className="text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all group shadow-sm"
                  >
                    <div className="text-[13px] font-bold text-gray-800 group-hover:text-[#083190] mb-1.5">
                      示例1：冠心宁片受试者核查
                    </div>
                    <div className="text-[11px] text-gray-500 leading-relaxed">
                      筛选号 1001 · 访视1 · 稳定性劳累性心绞痛
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      const newSession = {
                        id: `session-m-${Date.now() + 1}`,
                        title: "盐酸安罗替尼 - S2001 访视2",
                        desc: "筛选号：2001",
                        project: "盐酸安罗替尼胶囊",
                        artifacts: {
                          uploaded: [
                            { id: "u-demo2-1", name: "TW23315-华夏-琥珀酰明胶电解.pdf", type: "pdf" as const },
                            { id: "u-demo2-2", name: "试验方案.pdf", type: "pdf" as const },
                            { id: "u-demo2-3", name: "空白CRF.pdf", type: "pdf" as const },
                          ],
                          generated: [],
                        },
                      };
                      setSessions(prev => [newSession, ...prev]);
                      setActiveSessionId(newSession.id);
                      setSetupState({
                        protocol: true,
                        crf: true,
                        consentDate: "2025-11-05",
                        baselineDate: "2025-11-10",
                        data: true,
                      });
                      // 直接进入核查进度
                      setTimeout(() => handleStartCheck(), 300);
                    }}
                    className="text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all group shadow-sm"
                  >
                    <div className="text-[13px] font-bold text-gray-800 group-hover:text-[#083190] mb-1.5">
                      示例2：盐酸安罗替尼数据核查
                    </div>
                    <div className="text-[11px] text-gray-500 leading-relaxed">
                      筛选号 2001 · 访视2 · 晚期非小细胞肺癌
                    </div>
                  </button>
                </div>
              </div>

              {/* 分隔 */}
              <div className="mb-3 w-full">
                <div className="flex items-center">
                  <div className="flex-1 h-[1px] bg-gray-200"></div>
                  <span className="px-3 text-[11px] text-gray-400"> 上传核查材料 或 描述需求开始核查</span>
                  <div className="flex-1 h-[1px] bg-gray-200"></div>
                </div>
              </div>

              {/* Sections: 参照标准 + 核查参数 in one row, 待查数据 below */}
              <div className="space-y-4 pb-6 pt-2 w-full">
                {/* Row 1: 参照标准 + 核查参数 side by side */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Section 1: 参照标准 */}
                  <div className="border border-blue-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-blue-50/50 px-4 py-2.5 flex items-center justify-between">
                      <div className="flex items-center font-bold text-[#083190] text-[13px]">
                        <FileText className="w-4 h-4 mr-1.5" /> 参照标准{" "}
                        <span className="text-gray-400 text-[11px] ml-1.5 font-normal">
                          {(setupState.protocol ? 1 : 0) +
                            (setupState.crf ? 1 : 0)}
                          /2
                        </span>
                      </div>
                    </div>
                    <div className="bg-white p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between group">
                        <div className="flex items-start min-w-0">
                          <FileText className="w-4 h-4 text-gray-300 mr-2 mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-[12px] font-medium text-gray-800 truncate">
                              试验方案 <span className="text-red-500">*</span>
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5 truncate">
                              {setupState.protocol ? "冠心宁片中保临床方案.pdf" : "核心依据和准则"}
                            </div>
                          </div>
                        </div>
                        {!setupState.protocol ? (
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                            <button onClick={() => triggerUpload("protocol")} className="text-[#083190] text-[11px] font-medium hover:underline">上传</button>
                            <span className="text-gray-350">|</span>
                            <button onClick={() => setShowProjectFileSelector({ activeField: "protocol" })} className="text-blue-600 text-[11px] font-medium hover:underline">引用</button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 shrink-0 ml-2">
                            <button onClick={() => triggerUpload("protocol")} className="text-gray-500 hover:text-[#083190] text-[11px] font-medium hover:underline">修改</button>
                            <span className="text-gray-300">|</span>
                            <button onClick={() => setSetupState(s => ({ ...s, protocol: false }))} className="text-red-500 hover:text-red-700 text-[11px] font-medium hover:underline">删除</button>
                          </div>
                        )}
                      </div>
                      <div className="w-full h-[1px] bg-gray-50"></div>
                      <div className="flex items-center justify-between group">
                        <div className="flex items-start min-w-0">
                          <FileText className="w-4 h-4 text-gray-300 mr-2 mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-[12px] font-medium text-gray-800 truncate">
                              空白 CRF <span className="text-red-500">*</span>
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5 truncate">
                              {setupState.crf ? "空白CRF.pdf" : "上传收集数据的标准"}
                            </div>
                          </div>
                        </div>
                        {!setupState.crf ? (
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                            <button
                              onClick={() => triggerUpload("crf")}
                              className="text-[#083190] text-[11px] font-medium hover:underline"
                            >
                              上传
                            </button>
                            <span className="text-gray-350">|</span>
                            <button
                              onClick={() => setShowProjectFileSelector({ activeField: "crf" })}
                              className="text-blue-600 text-[11px] font-medium hover:underline"
                            >
                              引用
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 shrink-0 ml-2">
                            <button
                              onClick={() => triggerUpload("crf")}
                              className="text-gray-500 hover:text-[#083190] text-[11px] font-medium hover:underline"
                            >
                              修改
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => setSetupState(s => ({ ...s, crf: false }))}
                              className="text-red-500 hover:text-red-700 text-[11px] font-medium hover:underline"
                            >
                              删除
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 2: 核查参数 */}
                  <div className="border border-orange-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-white px-4 py-2.5 flex items-center justify-between border-b border-gray-50">
                      <div className="flex items-center font-bold text-gray-800 text-[13px]">
                        <Calendar className="w-4 h-4 mr-1.5 text-orange-500" />{" "}
                        核查参数{" "}
                        <span className="text-gray-400 text-[11px] ml-1.5 font-normal">
                          {(setupState.consentDate ? 1 : 0) +
                            (setupState.baselineDate ? 1 : 0)}
                          /2
                        </span>
                      </div>
                    </div>
                    <div className="bg-white p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start min-w-0">
                          <Calendar className="w-4 h-4 text-gray-300 mr-2 mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-[12px] font-medium text-gray-800 truncate">
                              知情同意日期
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5 truncate">
                              {setupState.consentDate
                                ? setupState.consentDate
                                : "点击设置日期"}
                            </div>
                          </div>
                        </div>
                        {!setupState.consentDate ? (
                          <>
                            <input
                              ref={consentDateRef}
                              type="date"
                              className="absolute w-0 h-0 opacity-0 pointer-events-none"
                              onChange={(e) => {
                                if (e.target.value)
                                  setSetupState((s) => ({
                                    ...s,
                                    consentDate: e.target.value,
                                  }));
                              }}
                            />
                            <button
                              onClick={() => {
                                try {
                                  (consentDateRef.current as any)?.showPicker();
                                } catch (e) {
                                  console.error(
                                    "showPicker failed (iframe?), using mock date",
                                  );
                                  setSetupState((s) => ({
                                    ...s,
                                    consentDate: "2025-10-15",
                                  }));
                                }
                              }}
                              className="border border-gray-200 px-2.5 py-1 rounded text-[11px] text-gray-500 flex items-center hover:bg-gray-50 transition-colors shrink-0 ml-2"
                            >
                              <Clock className="w-3 h-3 mr-1" /> 设置
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center space-x-2 shrink-0 ml-2">
                            <button
                              onClick={() => {
                                try {
                                  (consentDateRef.current as any)?.showPicker();
                                } catch (e) {
                                  console.error("showPicker failed (iframe?), using mock date");
                                  setSetupState((s) => ({ ...s, consentDate: "2025-10-15" }));
                                }
                              }}
                              className="text-gray-500 hover:text-[#083190] text-[11px] font-medium hover:underline"
                            >
                              修改
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => setSetupState(s => ({ ...s, consentDate: "" }))}
                              className="text-red-500 hover:text-red-700 text-[11px] font-medium hover:underline"
                            >
                              删除
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="w-full h-[1px] bg-gray-50"></div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-start min-w-0">
                          <Calendar className="w-4 h-4 text-gray-300 mr-2 mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-[12px] font-medium text-gray-800 truncate">
                              D0 基准日期
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5 truncate">
                              {setupState.baselineDate
                                ? setupState.baselineDate
                                : "点击设置日期"}
                            </div>
                          </div>
                        </div>
                        {!setupState.baselineDate ? (
                          <>
                            <input
                              ref={baselineDateRef}
                              type="date"
                              className="absolute w-0 h-0 opacity-0 pointer-events-none"
                              onChange={(e) => {
                                if (e.target.value)
                                  setSetupState((s) => ({
                                    ...s,
                                    baselineDate: e.target.value,
                                  }));
                              }}
                            />
                            <button
                              onClick={() => {
                                try {
                                  (baselineDateRef.current as any)?.showPicker();
                                } catch (e) {
                                  console.error(
                                    "showPicker failed (iframe?), using mock date",
                                  );
                                  setSetupState((s) => ({
                                    ...s,
                                    baselineDate: "2025-10-16",
                                  }));
                                }
                              }}
                              className="border border-gray-200 px-2.5 py-1 rounded text-[11px] text-gray-500 flex items-center hover:bg-gray-50 transition-colors shrink-0 ml-2"
                            >
                              <Clock className="w-3 h-3 mr-1" /> 设置
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center space-x-2 shrink-0 ml-2">
                            <button
                              onClick={() => {
                                try {
                                  (baselineDateRef.current as any)?.showPicker();
                                } catch (e) {
                                  console.error("showPicker failed (iframe?), using mock date");
                                  setSetupState((s) => ({ ...s, baselineDate: "2025-10-16" }));
                                }
                              }}
                              className="text-gray-500 hover:text-[#083190] text-[11px] font-medium hover:underline"
                            >
                              修改
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => setSetupState(s => ({ ...s, baselineDate: "" }))}
                              className="text-red-500 hover:text-red-700 text-[11px] font-medium hover:underline"
                            >
                              删除
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: 待查数据 */}
                <div className="border border-purple-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-white px-4 py-2.5 flex items-center justify-between border-b border-gray-50">
                    <div className="flex items-center font-bold text-gray-800 text-[13px]">
                      <FileText className="w-4 h-4 mr-1.5 text-purple-500" />{" "}
                      待查数据{" "}
                      <span className="text-gray-400 text-[11px] ml-1.5 font-normal">
                        {setupState.data ? 1 : 0}/1
                      </span>
                    </div>
                  </div>
                  <div className="bg-white p-3.5">
                    <div className="flex items-center justify-between group">
                      <div className="flex items-start min-w-0">
                        <FileText className="w-4 h-4 text-gray-300 mr-2 mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-[12px] font-medium text-gray-800 truncate">
                            待查材料 (源数据/CRF){" "}
                            <span className="text-red-500">*</span>
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5 truncate">
                            {setupState.data
                              ? "已上传材料"
                              : "源数据（病历、化验单、影像检查、患者日记卡等）或已填写的 CRF"}
                          </div>
                        </div>
                      </div>
                       {!setupState.data ? (
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                          <button
                            onClick={() => triggerUpload("data")}
                            className="text-[#083190] text-[11px] font-medium hover:underline"
                          >
                            上传
                          </button>
                          <span className="text-gray-350">|</span>
                          <button
                            onClick={() => setShowProjectFileSelector({ activeField: "data" })}
                            className="text-blue-600 text-[11px] font-medium hover:underline"
                          >
                            引用
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 shrink-0 ml-2">
                          <button
                            onClick={() => triggerUpload("data")}
                            className="text-gray-500 hover:text-[#083190] text-[11px] font-medium hover:underline"
                          >
                            修改
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => setSetupState(s => ({ ...s, data: false }))}
                            className="text-red-500 hover:text-red-700 text-[11px] font-medium hover:underline"
                          >
                            删除
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </>
          )}
        </div>

        {/* Fixed input bar: stays available on the initial page and during checking */}
        <div className="flex-shrink-0 bg-[#f5f7fa] px-6 py-4">
          <div className="w-full">
            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(input);
                  }
                }}
                className="w-full bg-white text-[13px] text-gray-800 placeholder-gray-400 outline-none resize-none min-h-[48px]"
                placeholder={activeSessionId !== null ? "补充说明或描述核查需求，点击“发送”核查已上传的材料" : "补充说明或描述核查需求，点击“发送”核查已上传的材料"}
                rows={1}
              />
              <div className="flex items-center justify-between mt-2 pt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    className="hidden"
                    ref={chatFileInputRef}
                    onChange={handleChatFileChange}
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.doc,.docx,.csv,.txt,.zip"
                  />
                  <button
                    onClick={() => chatFileInputRef.current?.click()}
                    className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-[12px] flex items-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> 上传
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="bg-white text-[12px] text-gray-500 outline-none cursor-pointer"
                    aria-label="选择模型"
                  >
                    <option value="TotrialDriver3.0">TotrialDriver3.0</option>
                    <option value="TotrialDriver2.5">TotrialDriver2.5</option>
                    <option value="TotrialDriverLite">TotrialDriver Lite</option>
                  </select>
                  <button onClick={() => handleSend(input)} className="px-4 py-1.5 bg-[#083190] text-white text-[12px] font-medium rounded-lg hover:bg-[#002d70] transition-colors flex items-center">
                    <Send className="w-3.5 h-3.5 mr-1" />
                    发送
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      </div>

      {/* Right Sidebar: Artifacts */}
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

      {/* Project File Selector Modal */}
      {showProjectFileSelector && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 border border-gray-150 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h3 className="text-[15px] font-bold text-gray-800 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-[#083190]" />
                从项目 [{selectedProject}] 引用文件
              </h3>
              <button onClick={() => setShowProjectFileSelector(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-[12px] text-gray-500 mb-4">
              请选择要作为 {showProjectFileSelector.activeField === 'protocol' ? '“试验方案”' : showProjectFileSelector.activeField === 'crf' ? '“空白CRF”' : '“待查材料”'} 引用的项目文件：
            </p>

            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              {getProjectFilesForField(selectedProject, showProjectFileSelector.activeField).map((file) => (
                <button
                  key={file.name}
                  onClick={() => {
                    setSetupState(s => ({ ...s, [showProjectFileSelector.activeField]: true }));
                    setShowProjectFileSelector(null);
                  }}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50/50 rounded-xl border border-gray-100 hover:border-blue-200 text-left transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100/50 text-[#083190] rounded-lg flex items-center justify-center group-hover:bg-blue-100">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-gray-800 group-hover:text-blue-900">{file.name}</div>
                      <div className="text-[11px] text-gray-400">{file.size} · {file.type}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-700" />
                </button>
              ))}
            </div>

            <div className="flex justify-end mt-5">
              <button
                onClick={() => setShowProjectFileSelector(null)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-[13px] text-gray-500 font-bold"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col mx-4 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-[#083190] mr-3" />
                <div>
                  <h2 className="text-[16px] font-bold text-gray-800">
                    核查报告
                  </h2>
                  <div className="text-[12px] text-gray-400">
                    临研通 AI Monitoring
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowReport(false)}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
              <div className="max-w-3xl mx-auto space-y-8">
                {/* 核查概览 */}
                <div>
                  <h3 className="text-[14px] font-bold text-gray-800 flex items-center mb-4">
                    <Search className="w-4 h-4 mr-2 text-gray-400" /> 核查概览
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gray-50/80 rounded-lg p-5 text-center border border-gray-100">
                      <div className="text-[32px] font-bold text-gray-800 mb-1 leading-none">
                        5
                      </div>
                      <div className="text-[12px] text-gray-500 font-medium">
                        问题总数
                      </div>
                    </div>
                    <div className="bg-gray-50/80 rounded-lg p-5 text-center border border-gray-100">
                      <div className="text-[32px] font-bold text-red-500 mb-1 leading-none">
                        1
                      </div>
                      <div className="text-[12px] text-gray-500 font-medium">
                        Critical
                      </div>
                    </div>
                    <div className="bg-gray-50/80 rounded-lg p-5 text-center border border-gray-100">
                      <div className="text-[32px] font-bold text-orange-400 mb-1 leading-none">
                        3
                      </div>
                      <div className="text-[12px] text-gray-500 font-medium">
                        Major
                      </div>
                    </div>
                    <div className="bg-gray-50/80 rounded-lg p-5 text-center border border-gray-100">
                      <div className="text-[32px] font-bold text-green-500 mb-1 leading-none">
                        1
                      </div>
                      <div className="text-[12px] text-gray-500 font-medium">
                        Minor
                      </div>
                    </div>
                  </div>
                </div>

                {/* 问题分布 */}
                <div>
                  <h3 className="text-[14px] font-bold text-gray-800 flex items-center mb-4">
                    <List className="w-4 h-4 mr-2 text-gray-400" /> 问题分布
                    (按维度)
                  </h3>
                  <div className="border border-gray-100 rounded-lg bg-white overflow-hidden">
                    <div className="grid grid-cols-2 divide-x divide-gray-100 text-[13px]">
                      <div className="divide-y divide-gray-100">
                        <div className="flex items-center justify-between p-4">
                          <span className="text-gray-700">知情同意核查</span>
                          <span className="text-gray-400">
                            1个 <span className="ml-1">↑</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4">
                          <span className="text-gray-700">
                            访视时间窗合规性
                          </span>
                          <span className="text-gray-400">
                            1个 <span className="ml-1">↑</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4">
                          <span className="text-gray-700">关键数据完整性</span>
                          <span className="text-gray-400">
                            1个 <span className="ml-1">↑</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4">
                          <span className="text-gray-700">SAE报告</span>
                          <span className="text-gray-400">
                            0个 <span className="ml-1">↑</span>
                          </span>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-100">
                        <div className="flex items-center justify-between p-4">
                          <span className="text-gray-700">入排标准核查</span>
                          <span className="text-gray-400">
                            1个 <span className="ml-1">↑</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4">
                          <span className="text-gray-700">方案偏离记录</span>
                          <span className="text-gray-400">
                            0个 <span className="ml-1">↑</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4">
                          <span className="text-gray-700">一致性/缺失值</span>
                          <span className="text-gray-400">
                            1个 <span className="ml-1">↑</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4">
                          <span className="text-gray-700">不良事件数据</span>
                          <span className="text-gray-400">
                            0个 <span className="ml-1">↑</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 问题清单 */}
                <div>
                  <h3 className="text-[14px] font-bold text-gray-800 flex items-center mb-4">
                    <AlertCircle className="w-4 h-4 mr-2 text-gray-400" />{" "}
                    问题清单
                  </h3>
                  <div className="space-y-4">
                    {/* Issue 1 */}
                    <div className="bg-red-50/40 border border-red-100 rounded-lg p-5">
                      <div className="flex items-start mb-3">
                        <div className="bg-gray-800 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 shrink-0 text-[10px]">
                          ×
                        </div>
                        <div>
                          <div className="flex items-center mb-1">
                            <span className="font-bold text-gray-800 mr-2 text-[14px]">
                              #ISSUE-001
                            </span>
                            <span className="bg-red-100 text-red-500 text-[11px] px-2 py-0.5 rounded-full font-medium mr-2">
                              Critical
                            </span>
                            <span className="text-gray-500 text-[13px]">
                              知情同意日期逻辑错误
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[13px] text-gray-700 leading-relaxed mb-4">
                        传入的知情同意日期【2026-06-02】晚于实际病历记录的筛选期访视日期【2023-10-01】，且远晚于当前时间。根据GCP原则，知情同意必须在任何研究相关操作（包括筛选检查）之前签署。此处存在严重的时间逻辑倒置，疑似参数配置错误或重大方案违背。
                      </div>

                      <div className="flex items-center space-x-4 text-[12px] text-gray-400 mb-4">
                        <div className="flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1" /> 未提供
                        </div>
                        <div className="flex items-center">
                          <User className="w-3.5 h-3.5 mr-1" /> 张三
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1" /> 筛选期
                        </div>
                      </div>

                      <div className="border-t border-red-100/50 pt-3 space-y-2 text-[12px]">
                        <div className="flex items-start">
                          <span className="font-bold text-red-600 mr-2 shrink-0">
                            法规依据:
                          </span>
                          <span className="text-red-600/90">
                            ICH-GCP E6(R2)
                            4.8.1：在受试者参加试验之前，必须获得受试者自愿签署的知情同意书；中国GCP第二十三条。
                          </span>
                        </div>
                        <div className="flex items-start">
                          <span className="font-bold text-red-600 mr-2 shrink-0">
                            纠正预防:
                          </span>
                          <span className="text-red-600/90">
                            立即核实知情同意书签署的真实日期。若为系统参数录入错误，请更正；若为真实发生，需记录为严重方案偏离并评估受试者权益保护情况。
                          </span>
                        </div>
                        <div className="flex items-start">
                          <span className="font-bold text-red-600 mr-2 shrink-0">
                            期望值:
                          </span>
                          <span className="text-red-600/90">
                            应早于或等于2023-10-01
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Issue 2 */}
                    <div className="bg-orange-50/40 border border-orange-100 rounded-lg p-5">
                      <div className="flex items-start mb-3">
                        <div className="bg-gray-800 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 shrink-0 text-[10px]">
                          !
                        </div>
                        <div>
                          <div className="flex items-center mb-1">
                            <span className="font-bold text-gray-800 mr-2 text-[14px]">
                              #ISSUE-002
                            </span>
                            <span className="bg-orange-100 text-orange-500 text-[11px] px-2 py-0.5 rounded-full font-medium mr-2">
                              Major
                            </span>
                            <span className="text-gray-500 text-[13px]">
                              筛选期访视时间窗违规
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[13px] text-gray-700 leading-relaxed mb-4">
                        实际筛选期访视日期【2023-10-01】不在规定的知情同意日期【2026-06-02】之后、D0日期【2026-06-04】之前的时间窗内。访视日期与关键里程碑日期逻辑完全冲突。
                      </div>

                      <div className="flex items-center space-x-4 text-[12px] text-gray-400 mb-4">
                        <div className="flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1" /> 未提供
                        </div>
                        <div className="flex items-center">
                          <User className="w-3.5 h-3.5 mr-1" /> 张三
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1" /> 筛选期
                        </div>
                      </div>

                      <div className="border-t border-orange-100/50 pt-3 text-[12px]">
                        <div className="flex items-start">
                          <span className="font-bold text-red-600 mr-2 shrink-0">
                            法规依据:
                          </span>
                          <span className="text-red-600/90">
                            方案第6章访视计划：筛选期检查应在知情同意后、随机化前完成。
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
              <div className="text-[12px] text-gray-400">
                生成时间: 2026年06月27日 16:18:38
              </div>
              <div className="flex space-x-3">
                <button className="border border-gray-200 hover:bg-gray-50 text-gray-600 text-[13px] font-medium py-2 px-4 rounded transition-colors flex items-center">
                  <span className="mr-1">↓</span> 导出PDF
                </button>
                <button
                  onClick={() => setShowReport(false)}
                  className="bg-[#083190] hover:bg-blue-900 text-white text-[13px] font-medium py-2 px-6 rounded transition-colors"
                >
                  关闭
                </button>
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
    </div>
  );
}
