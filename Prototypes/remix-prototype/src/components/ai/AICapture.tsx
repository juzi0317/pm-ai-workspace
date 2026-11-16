import { Search, Plus, FileText, Image as ImageIcon, Sparkles, CheckCircle2, Send, ChevronDown, UploadCloud, FolderOpen, StopCircle, ChevronRight, Share2, Clock, PanelRightClose, X, Check, Pin, Edit2, Trash2 } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ArtifactsPanel, { SessionArtifacts } from './ArtifactsPanel';
import ShareModal from './ShareModal';

const SESSIONS = [
  {
    id: 'session-c-1', 
    title: '演示病历-1.pdf', 
    size: '241.07KB', 
    type: 'pdf', 
    icon: FileText, 
    color: 'text-rose-500', 
    bg: 'bg-rose-50',
    project: "冠心宁片中保临床方案",
    artifacts: {
      uploaded: [
        { id: 'u1', name: '演示病历-1.pdf', type: 'pdf' as const }
      ],
      generated: [
        { id: 'g1', name: '病历关键项提取.xlsx', type: 'xlsx' as const }
      ]
    }
  },
  {
    id: 'session-c-2', 
    title: '新建会话21', 
    size: '10009受试者全部资料', 
    type: 'folder', 
    icon: FileText, 
    color: 'text-[#083190]', 
    bg: 'bg-blue-50',
    project: "冠心宁片中保临床方案",
    artifacts: {
      uploaded: [
        { id: 'u1', name: '李静病例.pdf', type: 'pdf' as const },
        { id: 'u2', name: '王国维病例.pdf', type: 'pdf' as const }
      ],
      generated: [
        { id: 'g1', name: '受试者关键项提取结果.xlsx', type: 'xlsx' as const }
      ]
    }
  },
  {
    id: 'session-c-3', 
    title: '演示病历-1.pdf', 
    size: '241.07KB', 
    type: 'pdf', 
    icon: FileText, 
    color: 'text-rose-500', 
    bg: 'bg-rose-50',
    project: "盐酸安罗替尼胶囊",
    artifacts: {
      uploaded: [],
      generated: []
    }
  },
  {
    id: 'session-c-4', 
    title: '新建会话20', 
    size: 'pdf NaNKB', 
    type: 'pdf', 
    icon: FileText, 
    color: 'text-rose-500', 
    bg: 'bg-rose-50',
    project: "盐酸安罗替尼胶囊",
    artifacts: {
      uploaded: [],
      generated: []
    }
  },
  {
    id: 'session-c-5', 
    title: '新建会话19', 
    size: 'pdf NaNKB', 
    type: 'pdf', 
    icon: FileText, 
    color: 'text-rose-500', 
    bg: 'bg-rose-50',
    project: "盐酸安罗替尼胶囊",
    artifacts: {
      uploaded: [],
      generated: []
    }
  },
  {
    id: 'session-c-unassigned', 
    title: '阿普唑仑片说明书提取.pdf', 
    size: '1.2MB', 
    type: 'pdf', 
    icon: FileText, 
    color: 'text-rose-500', 
    bg: 'bg-rose-50',
    project: "未归档",
    artifacts: {
      uploaded: [],
      generated: []
    }
  }
];

const getProjectFiles = (project: string) => {
  const isAnluo = project === "盐酸安罗替尼胶囊";
  const isGuan = project === "冠心宁片中保临床方案";
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
};

export default function AICapture({ selectedProject = "全部" }: { selectedProject?: string }) {
  const [sessions, setSessions] = useState(SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const activeSession = sessions.find(s => s.id === activeSessionId);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogSearchQuery, setDialogSearchQuery] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingSessionTitle, setEditingSessionTitle] = useState("");
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
        setCaptureStep('welcome');
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
  const [captureStep, setCaptureStep] = useState<'welcome' | 'keywords' | 'upload' | 'recognizing' | 'result'>('welcome');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showProjectFileSelector, setShowProjectFileSelector] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Synchronize active session if it doesn't belong to the newly selected project
  React.useEffect(() => {
    if (selectedProject !== "全部" && activeSession && activeSession.project !== selectedProject) {
      setActiveSessionId(null);
      setCaptureStep('welcome');
    }
  }, [selectedProject]);

  React.useEffect(() => {
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

  const handleNewSession = () => {
    setActiveSessionId(null);
    setCaptureStep('keywords');
    setSelectedKeywords([]);
    setUploadedFileName(null);
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setCaptureStep('result');
    setIsSidebarOpen(false); // Auto hide sidebar on session select
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name);
    }
  };

  const startRecognition = () => {
    setCaptureStep('recognizing');
    setProgress(0);
    setIsSidebarOpen(false); // Auto hide sidebar on start
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setCaptureStep('result');
          setActiveSessionId('session-c-1'); // Mock switching to a session
          return 100;
        }
        return p + 15;
      });
    }, 300);
  };

  const SYSTEM_KEYWORDS = ['姓名', '性别', '年龄', '病历号', '婚姻', '民族', '医生', '入院日期', '身高', '体重', '主诉', '现病史', '既往病史'];

  const toggleKeyword = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    } else {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };

  // Filter SESSIONS by project and search query
  const filteredSessions = sessions.filter(session => {
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
    <div className="flex bg-white h-full rounded-xl border border-gray-200 overflow-hidden shadow-sm relative">
      {/* Left Sidebar */}
      <div className={`${isSidebarOpen ? "w-64" : "w-0"} transition-all duration-300 bg-white border-r border-gray-100 flex flex-col shrink-0 relative z-20 overflow-hidden`}>
         <div className="p-4 w-64">
            <button onClick={handleNewSession} className="w-full bg-[#2b64e3] hover:bg-[#1a4eb8] text-white rounded-md py-2.5 text-[14px] font-bold flex items-center justify-center transition-colors shadow-sm">
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
            {sortedSessions.map((item, i) => (
              <div 
                key={item.id} 
                onClick={() => handleSelectSession(item.id)}
                className={`flex flex-col p-2.5 rounded-lg cursor-pointer transition-colors border relative ${item.id === activeSessionId ? 'bg-blue-50/60 border-blue-100' : 'hover:bg-gray-50 border-transparent'}`}
              >
                <div className="flex items-center w-full min-w-0 relative">
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
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.bg} ${item.color} mr-2.5 shrink-0`}>
                         <item.icon className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0 flex-1 pr-1">
                         <div className="flex items-center min-w-0">
                           {(item as any).isPinned && (
                             <Pin className="w-3 h-3 text-[#083190] mr-1 shrink-0 rotate-45" />
                           )}
                           <div className="text-[13px] text-gray-800 font-bold truncate hover:text-[#083190] transition-colors">{item.title}</div>
                         </div>
                         <div className="text-[11px] text-gray-400 truncate mt-0.5">{item.type === 'folder' ? item.size : `pdf ${item.size}`}</div>
                      </div>
                      {item.type === 'folder' && <div className="bg-blue-100 text-[#083190] text-[10px] font-bold px-1.5 py-0.5 rounded ml-2 shrink-0">3</div>}
                      
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
                <div className="flex items-center justify-between w-full mt-1.5 pl-1">
                  <span className="text-[10px] bg-blue-50/85 text-blue-700 px-1.5 py-0.5 rounded font-medium border border-blue-100/30">
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
      <div className="flex-1 flex flex-col bg-white overflow-y-auto relative">
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
                      placeholder="搜索提取内容..."
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
                    title="搜索提取内容"
                  >
                    <Search className="w-[16px] h-[16px]" />
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  if (activeSession) {
                    setShareModalInfo({
                      url: `https://totrial.com/share/capture/${activeSession.id}`,
                      title: activeSession.title
                    });
                  }
                }}
                className="p-1.5 text-gray-500 hover:text-[#083190] hover:bg-white rounded transition-all"
                title="分享提取内容"
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
        {captureStep === 'welcome' && (
           <div className="p-10 pb-32">
             <div className="max-w-4xl mx-auto pt-4">
               <h1 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                 欢迎来到 <span className="text-[#083190] ml-2">AI Capture</span>
               </h1>

               
               <p className="text-[13px] text-gray-700 font-medium mb-4">试试以下例子</p>
               
               <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                     <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-stretch hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="flex-1 pr-6 flex flex-col justify-center">
                           <div className="flex items-center text-blue-700 font-bold mb-3 text-[15px]">
                              <div className="w-6 h-6 bg-blue-50 text-[#083190] rounded flex items-center justify-center mr-2">
                                <FileText className="w-3.5 h-3.5" />
                              </div>
                              单文档解析
                           </div>
                           <div className="text-xs text-gray-500 leading-relaxed flex flex-wrap gap-1.5 items-center">
                              <span className="text-gray-400 whitespace-nowrap mr-1">关键词:</span>
                              {['姓名', '性别', '年龄', '身高', '体重', '体温', '脉搏', '呼吸', '血压', '主述', '现病史', '既往病史'].map(k => (
                                 <span key={k} className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-[4px] text-gray-600">{k}</span>
                              ))}
                           </div>
                        </div>
                        <div className="w-32 shrink-0 flex items-center justify-center border-l border-gray-100 pl-4 relative overflow-hidden">
                           <div className="w-24 h-24 bg-gray-50 border border-gray-200 rounded object-cover shadow-sm group-hover:-rotate-2 transition-transform duration-300 relative flex flex-col p-2 opacity-80">
                              <div className="w-1/2 h-1 bg-gray-300 rounded mb-2"></div>
                              <div className="space-y-1">
                                <div className="w-full h-0.5 bg-gray-200 rounded"></div>
                                <div className="w-5/6 h-0.5 bg-gray-200 rounded"></div>
                                <div className="w-full h-0.5 bg-gray-200 rounded"></div>
                              </div>
                           </div>
                        </div>
                     </div>
                     
                     <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-stretch hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="flex-1 pr-6 flex flex-col justify-center">
                           <div className="flex items-center text-blue-700 font-bold mb-3 text-[15px]">
                              <div className="w-6 h-6 bg-blue-50 text-[#083190] rounded flex items-center justify-center mr-2">
                                <FileText className="w-3.5 h-3.5" />
                              </div>
                              多文档解析
                           </div>
                           <div className="text-xs text-gray-500 leading-relaxed flex flex-wrap gap-1.5 items-center">
                              <span className="text-gray-400 whitespace-nowrap mr-1">关键词:</span>
                              {['姓名', '性别', '年龄', '工作单位', '入院日期', '主述', '现病史', '既往病史', '婚育史', '初步诊断'].map(k => (
                                 <span key={k} className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-[4px] text-gray-600">{k}</span>
                              ))}
                           </div>
                        </div>
                        <div className="w-32 shrink-0 flex items-center justify-center border-l border-gray-100 pl-4 relative">
                           <div className="w-24 h-24 bg-gray-50 border border-gray-200 rounded object-cover shadow-sm group-hover:rotate-2 transition-transform duration-300 relative flex flex-col p-2 opacity-80 ml-2 mt-2 absolute">
                              <div className="w-1/3 h-1 bg-gray-300 rounded mb-2"></div>
                              <div className="space-y-1">
                                <div className="w-4/5 h-0.5 bg-gray-200 rounded"></div>
                                <div className="w-full h-0.5 bg-gray-200 rounded"></div>
                              </div>
                           </div>
                           <div className="w-24 h-24 bg-white border border-gray-200 rounded object-cover shadow-md group-hover:-rotate-3 transition-transform duration-300 relative flex flex-col p-2 z-10">
                              <div className="w-1/2 h-1 bg-gray-300 rounded mb-2"></div>
                              <div className="space-y-1">
                                <div className="w-full h-0.5 bg-gray-200 rounded"></div>
                                <div className="w-5/6 h-0.5 bg-gray-200 rounded"></div>
                                <div className="w-full h-0.5 bg-gray-200 rounded"></div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="w-full lg:w-72 shrink-0 h-[220px] rounded-xl bg-gradient-to-br from-[#ff8c00] to-[#e65100] p-6 text-white flex flex-col items-center justify-center relative overflow-hidden shadow-lg shadow-orange-500/20">
                     <div className="absolute -top-12 -left-12 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                     <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                     
                     <div className="relative z-10 text-center w-full">
                       <div className="text-[22px] font-extrabold mb-2 tracking-wide font-sans text-white drop-shadow-md">医药数据AI结构化</div>
                       <div className="text-3xl font-black mb-6 text-yellow-100 italic drop-shadow-md tracking-wider">全网免费中...</div>
                       <div className="mt-2 bg-gradient-to-b from-white/20 to-white/5 p-4 rounded-full inline-block backdrop-blur-md border border-white/20 shadow-inner">
                          <ImageIcon className="w-12 h-12 text-white opacity-90" />
                       </div>
                     </div>
                  </div>
               </div>
               
               <div onClick={handleNewSession} className="mt-6 border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all group">
                  <div className="bg-[#083190] text-white px-5 py-2.5 rounded-lg font-medium inline-flex items-center mb-3 shadow-md shadow-blue-600/20 group-hover:bg-blue-700 transition-colors">
                     <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} />
                     添加关键词
                  </div>
                  <div className="text-[13px] text-gray-500">整合多篇病历中的数据至表格中，实现病历结构化</div>
               </div>
               
             </div>
           </div>
        )}

        {captureStep === 'keywords' && (
           <div className="flex-1 flex flex-col p-8 bg-[#f8f9fc] h-full items-center justify-center">
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-4xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 font-medium text-[16px] text-gray-800 flex justify-between items-center">
                   选择或新增关键词
                </div>
                <div className="flex h-[400px]">
                   <div className="w-1/2 border-r border-gray-100 p-6 flex flex-col">
                      <div className="text-[13px] text-gray-500 mb-4">系统内设关键词</div>
                      <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                         {SYSTEM_KEYWORDS.map(k => (
                            <label key={k} className="flex items-center space-x-3 cursor-pointer p-2.5 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                               <input type="checkbox" checked={selectedKeywords.includes(k)} onChange={() => toggleKeyword(k)} className="w-4 h-4 text-[#083190] rounded border-gray-300 focus:ring-blue-500" />
                               <span className="text-[14px] text-gray-700">{k}</span>
                            </label>
                         ))}
                      </div>
                   </div>
                   <div className="w-1/2 p-6 flex flex-col bg-gray-50/30">
                      <div className="text-[13px] text-gray-500 mb-4 flex justify-between items-center">
                         已选择关键词
                         <span className="text-[#083190] font-medium">{selectedKeywords.length} 项</span>
                      </div>
                      <div className="flex-1 overflow-y-auto custom-scrollbar">
                         <div className="flex flex-wrap gap-2">
                            {selectedKeywords.map(k => (
                               <span key={k} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-[13px] flex items-center border border-blue-100 shadow-sm animate-in fade-in zoom-in-95">
                                  {k}
                                  <button onClick={() => toggleKeyword(k)} className="ml-2 text-blue-400 hover:text-[#083190] rounded-full hover:bg-blue-100 p-0.5 transition-colors">
                                     <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                               </span>
                            ))}
                            {selectedKeywords.length === 0 && <div className="text-gray-400 text-[13px] w-full text-center mt-10">暂未选择任何关键词</div>}
                         </div>
                      </div>
                   </div>
                </div>
                <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50/50">
                   <button 
                     disabled={selectedKeywords.length === 0}
                     onClick={() => setCaptureStep('upload')}
                     className="px-8 py-2.5 bg-[#083190] text-white rounded-md font-medium shadow-sm hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                   >
                      <UploadCloud className="w-4 h-4 mr-2" /> 上传病历
                   </button>
                </div>
             </div>
           </div>
        )}

        {(captureStep === 'upload' || captureStep === 'recognizing') && (
           <div className="flex-1 flex flex-col p-8 bg-[#f8f9fc] h-full items-center pt-10">
              <div className="w-full max-w-3xl mb-6 animate-in fade-in duration-300">
                 <div className="flex justify-between items-center mb-3">
                    <div className="font-medium text-[15px] text-gray-800 flex items-center">
                       <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />已确定关键词
                    </div>
                    <button onClick={() => setCaptureStep('keywords')} className="text-[#083190] text-[13px] flex items-center hover:text-blue-700 bg-white px-3 py-1.5 rounded-md border border-blue-100 shadow-sm">
                       <Plus className="w-3.5 h-3.5 mr-1" /> 补充关键词
                    </button>
                 </div>
                 <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-2">
                    {selectedKeywords.map(k => (
                       <span key={k} className="bg-gray-50 border border-gray-100 text-gray-700 px-3 py-1 rounded text-[13px]">{k}</span>
                    ))}
                 </div>
              </div>

              <div className="w-full max-w-3xl bg-white rounded-xl shadow-sm border border-gray-200 p-10 flex flex-col items-center justify-center min-h-[300px] relative animate-in fade-in slide-in-from-bottom-4 duration-300">
                 <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf" />
                 
                 {uploadedFileName ? (
                    <div className="flex flex-col items-center animate-in zoom-in-95 duration-200">
                       <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mb-4 border border-rose-100 shadow-sm">
                          <FileText className="w-8 h-8" />
                       </div>
                       <div className="text-[15px] font-medium text-gray-800 mb-1">{uploadedFileName}</div>
                       <div className="text-[13px] text-gray-500 mb-8">准备就绪</div>
                       
                       <button onClick={startRecognition} className="px-8 py-2.5 bg-[#083190] text-white rounded-md font-medium shadow-md hover:bg-[#083190] transition-colors flex items-center hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0">
                          <Sparkles className="w-4 h-4 mr-2" /> 开始识别
                       </button>
                    </div>
                 ) : (
                    <div className="flex flex-col items-center animate-in zoom-in-95 duration-200">
                       <div className="w-20 h-20 bg-blue-50/50 text-[#083190] rounded-full flex items-center justify-center mb-5 border border-blue-100 border-dashed cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all group" onClick={() => fileInputRef.current?.click()}>
                          <UploadCloud className="w-8 h-8 group-hover:scale-110 transition-transform" />
                       </div>
                       <div className="text-[15px] font-medium text-gray-800 mb-2">点击上传病历</div>
                       <div className="text-[13px] text-gray-400 mb-6">请上传pdf格式文件，支持批量上传</div>
                       
                        <div className="flex space-x-2">
                           <button onClick={() => fileInputRef.current?.click()} className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-md font-medium shadow-sm hover:bg-gray-50 transition-colors text-[13px]">
                              浏览文件
                           </button>
                           <button
                              onClick={() => setShowProjectFileSelector(true)}
                              className="px-6 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-md font-medium shadow-sm hover:bg-blue-100/50 transition-colors text-[13px] inline-flex items-center"
                           >
                              <FileText className="w-4 h-4 mr-1.5 text-blue-600" />
                              引用项目文件
                           </button>
                        </div>
                    </div>
                 )}
              </div>
           </div>
        )}

        {captureStep === 'recognizing' && (
           <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-200">
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-96 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                 <div className="w-16 h-16 mb-6 relative">
                    <svg className="animate-spin text-[#083190] w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[#083190] font-bold text-xs">{progress}%</div>
                 </div>
                 <div className="text-[16px] font-bold text-gray-800 mb-2">正在识别中...</div>
                 <div className="text-[13px] text-gray-500 mb-6">AI正在解析病历内容并提取关键信息，请勿关闭页面</div>
                 <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-[#083190] rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                 </div>
                 <button onClick={() => setCaptureStep('upload')} className="text-[13px] text-gray-400 hover:text-gray-600 flex items-center transition-colors">
                    <StopCircle className="w-4 h-4 mr-1" /> 取消识别
                 </button>
              </div>
           </div>
        )}

        {captureStep === 'result' && (
           <div className="h-full flex flex-col pt-6 px-8 pb-6 space-y-4 max-w-full min-h-0 bg-[#f4f6f8] animate-in fade-in duration-300">
              {/* Top Section: Recognition Results Table */}
              <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col shrink-0">
                 <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                       <div className="font-medium text-[15px] text-gray-800 flex items-center">
                          识别结果 <ChevronDown className="w-4 h-4 text-gray-500 ml-1 cursor-pointer" />
                       </div>
                       <button className="text-[#083190] text-[13px] hover:text-blue-700 font-medium">导出数据到excel</button>
                    </div>
                    <div className="flex items-center space-x-3">
                       <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" placeholder="搜索识别结果" className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-md text-[13px] w-64 focus:outline-none focus:border-blue-400" />
                       </div>
                       <button className="text-[#083190] text-[13px] hover:text-blue-700 font-medium">上传病历</button>
                       <button className="text-[#083190] text-[13px] hover:text-blue-700 font-medium flex items-center"><Plus className="w-3.5 h-3.5 mr-0.5" /> 新增关键词</button>
                       <button className="text-gray-400 hover:text-gray-600 ml-2"><span className="text-[16px]">↗</span></button>
                    </div>
                 </div>
                 <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                       <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                             <th className="py-3 px-5 text-[13px] font-medium text-gray-500 whitespace-nowrap">文件名</th>
                             <th className="py-3 px-4 text-[13px] font-medium text-gray-500 whitespace-nowrap">姓名</th>
                             <th className="py-3 px-4 text-[13px] font-medium text-gray-500 whitespace-nowrap">性别</th>
                             <th className="py-3 px-4 text-[13px] font-medium text-gray-500 whitespace-nowrap">年龄</th>
                             <th className="py-3 px-4 text-[13px] font-medium text-gray-500 whitespace-nowrap">身高</th>
                             <th className="py-3 px-4 text-[13px] font-medium text-gray-500 whitespace-nowrap">体重</th>
                             <th className="py-3 px-4 text-[13px] font-medium text-gray-500 whitespace-nowrap">体温</th>
                             <th className="py-3 px-4 text-[13px] font-medium text-gray-500 whitespace-nowrap">脉搏</th>
                             <th className="py-3 px-4 text-[13px] font-medium text-gray-500 whitespace-nowrap">呼吸</th>
                             <th className="py-3 px-4 text-[13px] font-medium text-gray-500 whitespace-nowrap">血压</th>
                             <th className="py-3 px-4 text-[13px] font-medium text-gray-500 whitespace-nowrap min-w-[200px]">主诉</th>
                             <th className="py-3 px-4 text-[13px] font-medium text-gray-500 whitespace-nowrap min-w-[300px]">现病史</th>
                             <th className="py-3 px-4 text-[13px] font-medium text-gray-500 whitespace-nowrap">既往病史</th>
                          </tr>
                       </thead>
                       <tbody>
                          <tr className="hover:bg-blue-50/30 transition-colors">
                             <td className="py-3 px-5 text-[13px] text-[#083190] cursor-pointer whitespace-nowrap border-b-2 border-transparent">演示病历-1.pdf</td>
                             <td className="py-3 px-4 text-[13px] text-gray-800 whitespace-nowrap">李晶晶</td>
                             <td className="py-3 px-4 text-[13px] text-gray-800 whitespace-nowrap">女性</td>
                             <td className="py-3 px-4 text-[13px] text-gray-800 whitespace-nowrap">56岁</td>
                             <td className="py-3 px-4 text-[13px] text-gray-800 whitespace-nowrap">175 cm</td>
                             <td className="py-3 px-4 text-[13px] text-gray-800 whitespace-nowrap">70 kg</td>
                             <td className="py-3 px-4 text-[13px] text-gray-800 whitespace-nowrap">36.5°C</td>
                             <td className="py-3 px-4 text-[13px] text-gray-800 whitespace-nowrap">100次/分</td>
                             <td className="py-3 px-4 text-[13px] text-gray-800 whitespace-nowrap">18次/分</td>
                             <td className="py-3 px-4 text-[13px] text-gray-800 whitespace-nowrap">190/90mmHg</td>
                             <td className="py-3 px-4 text-[13px] text-gray-800 truncate max-w-[200px]">反复头晕 10年，再发 5小时</td>
                             <td className="py-3 px-4 text-[13px] text-gray-800 truncate max-w-[300px]">入院前 10年，无明显诱因，反复感头晕，头重脚轻，...</td>
                             <td className="py-3 px-4 text-[13px] text-gray-800 whitespace-nowrap">否认“冠心病...</td>
                          </tr>
                       </tbody>
                    </table>
                 </div>
              </div>

              {/* Bottom Section: Split View (PDF & Chat) */}
              <div className="flex flex-1 gap-4 min-h-0 overflow-hidden">
                 {/* Left: PDF View */}
                 <div className="w-1/2 bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col">
                    <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                       <div className="font-medium text-[14px] text-gray-800">演示病历-1.pdf</div>
                       <div className="flex items-center space-x-4 text-gray-500">
                          <button className="hover:text-gray-700"><span className="w-4 h-4 block border border-current rounded-sm"></span></button>
                          <button className="hover:text-gray-700"><Search className="w-4 h-4" /></button>
                          <button className="hover:text-gray-700">^</button>
                          <button className="hover:text-gray-700">v</button>
                          <div className="flex items-center text-[13px] space-x-1">
                             <input type="text" defaultValue="1" className="w-8 text-center border border-gray-200 rounded text-[13px] py-0.5" />
                             <span>/ 6</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 flex justify-center custom-scrollbar">
                       <div className="bg-white shadow-sm border border-gray-200 w-full max-w-lg p-8">
                          <h2 className="text-center text-[18px] font-bold tracking-widest mb-6">福州市第一医院住院病历</h2>
                          <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-[13px] mb-4">
                             <div className="flex"><span className="w-16">姓名</span><span>李晶晶</span></div>
                             <div className="flex"><span className="w-16">病区</span><span>3-01</span></div>
                             <div className="flex"><span className="w-16">床号</span><span>1021</span></div>
                             <div className="flex"><span className="w-16">住院号</span><span>793924</span></div>
                          </div>
                          <div className="border-t-2 border-black mb-4"></div>
                          <div className="text-[13px] leading-relaxed space-y-2">
                             <div className="flex"><span className="w-16 shrink-0">姓名</span><span>李晶晶 <span className="ml-8">籍贯：福建省福州市</span></span></div>
                             <div className="flex"><span className="w-16 shrink-0">性别</span><span>女性 <span className="ml-8">住址：福建省福州市大学城科技路1号</span></span></div>
                             <div className="flex"><span className="w-16 shrink-0">年龄</span><span>56岁 <span className="ml-8">工作单位：福州大学</span></span></div>
                             <div className="flex"><span className="w-16 shrink-0">婚姻</span><span>已婚 <span className="ml-8">入院日期：2010年01月05日 17:00时</span></span></div>
                             <div className="flex"><span className="w-16 shrink-0">民族</span><span>畲族 <span className="ml-8">病史采集日期：2010年01月05日 17:00时</span></span></div>
                             <div className="border-t border-black my-2"></div>
                             <div className="flex"><span className="w-16 shrink-0 font-medium">主诉：</span><span>反复头晕 10年，再发 5小时</span></div>
                             <div className="flex items-start mt-3"><span className="w-16 shrink-0 font-medium pt-1">现病史：</span><div className="text-justify text-gray-800 leading-[1.8] tracking-[0.02em]">入院前 10年，无明显诱因，反复感头晕，头重脚轻，持续约半小时，自行缓解，无头痛、视物旋转、视物模糊，无恶心、呕吐，无心悸、面色潮红，无呼吸困难、发热，无咯血、发绀，无胸痛，无耳鸣、眼花，无晕厥、水肿，无四肢无力，无四肢疼痛等，曾多次就诊当地医院，测血压均高于 140/90mmHg，血压最高达 180/105mmHg，诊断为“高血压病”，不规则服用“尼群地平 10mg qd”等治疗，血压控制尚可，波动于正常范围。<br/><br/>入院前5小时，感头晕，头重脚轻，持续性，休息不能缓解...</div></div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Right: Chat Window */}
                 <div className="w-1/2 bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col">
                    <div className="px-5 py-3 border-b border-gray-100 font-medium text-[14px] text-gray-800">
                       对话窗口
                    </div>
                    <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-[#f8f9fc]">
                       <div className="flex space-x-3 max-w-full">
                          <div className="w-8 h-8 shrink-0 bg-[#13316e] rounded text-white flex items-center justify-center font-bold shadow-sm">
                             临
                          </div>
                          <div className="flex-1 min-w-0 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                             <div className="text-[14px] text-gray-800 mb-4">以下是根据您提供的文档及罗列的关键词提取的其对应结果：</div>
                             <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full text-left text-[13px]">
                                   <tbody>
                                      <tr className="border-b border-gray-100"><td className="bg-gray-50 w-32 py-2 px-4 text-gray-500">姓名</td><td className="py-2 px-4">李晶晶</td></tr>
                                      <tr className="border-b border-gray-100"><td className="bg-gray-50 w-32 py-2 px-4 text-gray-500">性别</td><td className="py-2 px-4">女性</td></tr>
                                      <tr className="border-b border-gray-100"><td className="bg-gray-50 w-32 py-2 px-4 text-gray-500">年龄</td><td className="py-2 px-4">56岁</td></tr>
                                      <tr className="border-b border-gray-100"><td className="bg-gray-50 w-32 py-2 px-4 text-gray-500">身高</td><td className="py-2 px-4">175 cm</td></tr>
                                      <tr className="border-b border-gray-100"><td className="bg-gray-50 w-32 py-2 px-4 text-gray-500">体重</td><td className="py-2 px-4">70 kg</td></tr>
                                      <tr className="border-b border-gray-100"><td className="bg-gray-50 w-32 py-2 px-4 text-gray-500">体温</td><td className="py-2 px-4">36.5°C</td></tr>
                                      <tr className="border-b border-gray-100"><td className="bg-gray-50 w-32 py-2 px-4 text-gray-500">脉搏</td><td className="py-2 px-4">100次/分</td></tr>
                                      <tr className="border-b border-gray-100"><td className="bg-gray-50 w-32 py-2 px-4 text-gray-500">呼吸</td><td className="py-2 px-4">18次/分</td></tr>
                                      <tr className="border-b border-gray-100"><td className="bg-gray-50 w-32 py-2 px-4 text-gray-500">血压</td><td className="py-2 px-4">190/90mmHg</td></tr>
                                      <tr className="border-b border-gray-100"><td className="bg-gray-50 w-32 py-2 px-4 text-gray-500 align-top">主诉</td><td className="py-2 px-4">反复头晕 10年，再发 5小时</td></tr>
                                      <tr><td className="bg-gray-50 w-32 py-2 px-4 text-gray-500 align-top">现病史</td><td className="py-2 px-4">入院前 10年，无明显诱因，反复感头晕，头重...</td></tr>
                                   </tbody>
                                </table>
                             </div>
                          </div>
                       </div>
                       {activeSession && (!activeSession.project || activeSession.project === "未归档" || activeSession.project === "未分配") && (
                          <div className="flex justify-center mt-4 animate-in fade-in duration-300">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center justify-between w-full max-w-md shadow-sm">
                              <div className="flex items-center text-[12px] text-gray-700">
                                <FolderOpen className="w-4 h-4 mr-1.5 text-[#083190]" />
                                <span>当前任务为<b>“未归档”</b>状态，是否归档到某个项目中？</span>
                              </div>
                              <button
                                onClick={() => {
                                  setArchiveTargetProject("");
                                  setShowArchiveModal(activeSessionId);
                                }}
                                className="px-3 py-1 bg-[#083190] hover:bg-blue-900 text-white font-bold rounded-lg text-[11px] transition-colors whitespace-nowrap shrink-0 ml-2"
                              >
                                立即归档
                              </button>
                            </div>
                          </div>
                       )}
                    </div>
                    
                    {/* Chat Input */}
                    <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                       <div className="relative bg-white border border-gray-200 rounded-xl shadow-sm focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-all flex flex-col h-[90px]">
                          <textarea 
                            placeholder="请输入你的问题或需求" 
                            className="w-full bg-transparent px-4 py-3 outline-none text-[13px] resize-none h-full placeholder:text-gray-400"
                          ></textarea>
                          <div className="absolute bottom-2 right-2 flex items-center space-x-2">
                             <button className="p-1.5 text-[#083190] hover:text-[#083190] transition-colors bg-blue-50 rounded"><Sparkles className="w-4 h-4" /></button>
                             <button className="px-4 py-1.5 bg-[#083190] text-white rounded hover:bg-[#083190] transition-colors flex items-center shadow-sm">
                               <Send className="w-3.5 h-3.5" />
                             </button>
                          </div>
                       </div>
                       <div className="text-center mt-3 text-[11px] text-gray-400 flex flex-col items-center">
                          <span>内容由临研通大模型3.5生成，基于现有数据与算法，建议结合实际情况和专业判断使用。</span>
                          <div className="mt-0.5 space-x-2"><a href="#" className="text-[#083190] hover:underline">用户协议</a> | <a href="#" className="text-[#083190] hover:underline">隐私协议</a></div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}
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
                  从项目文档引用病历文件
                </h3>
                <button
                  onClick={() => setShowProjectFileSelector(false)}
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
                  {getProjectFiles(selectedProject === '全部' ? '冠心宁片中保临床方案' : selectedProject).map((file) => (
                    <button
                      key={file.name}
                      onClick={() => {
                        setUploadedFileName(file.name);
                        setShowProjectFileSelector(false);
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
                  onClick={() => setShowProjectFileSelector(false)}
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
