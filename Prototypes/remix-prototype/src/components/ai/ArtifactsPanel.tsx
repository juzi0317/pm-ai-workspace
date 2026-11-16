import { useState, useEffect } from "react";
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Download,
  Share2,
  Eye,
  X,
  CheckCircle2,
  Copy,
  FileArchive,
  PanelRightClose,
  PanelRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Search,
  Clock,
  Maximize2,
  Minimize2,
  Sparkles,
  ArrowUpRight,
  FolderOpen,
  Plus,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export type Artifact = {
  id: string;
  name: string;
  type: "pdf" | "xlsx" | "docx" | "png" | "zip";
  size?: string;
  uploadTime?: string;
  isVectorized?: boolean;
  isArchived?: boolean;
};

export type SessionArtifacts = {
  uploaded: Artifact[];
  generated: Artifact[];
};

const getProjectDocuments = (project: string | null): SessionArtifacts => {
  let customGenerated: Artifact[] = [];
  let customUploaded: Artifact[] = [];
  try {
    const savedGen = localStorage.getItem("totrial_custom_generated_docs");
    if (savedGen) {
      const parsed = JSON.parse(savedGen);
      customGenerated = parsed.filter((d: any) => d.project === project || project === "全部" || !project);
    }
    const savedUp = localStorage.getItem("totrial_custom_kb_docs");
    if (savedUp) {
      const parsed = JSON.parse(savedUp);
      customUploaded = parsed.filter((d: any) => d.project === project || project === "全部" || !project);
    }
  } catch (e) {
    console.error(e);
  }

  let allUploaded: Artifact[] = [];
  let allGenerated: Artifact[] = [];
  const store = window.PROJECT_KNOWLEDGE_STORE;

  if (store) {
    for (const key in store) {
      const projData = store[key];
      if (project === "全部" || !project || projData.name === project) {
        const mappedKb: Artifact[] = projData.kb_files.map(f => ({
          id: f.id,
          name: f.name,
          type: (f.name.split('.').pop() as any) || "pdf",
          size: f.size,
          uploadTime: f.date,
          isVectorized: f.status === "已向量化"
        }));
        
        const mappedProducts: Artifact[] = projData.ai_products.map(p => ({
          id: p.id,
          name: p.name,
          type: (p.name.split('.').pop() as any) || "docx",
          size: p.size,
          uploadTime: p.date,
          isArchived: p.is_archived
        }));

        allUploaded = [...allUploaded, ...mappedKb];
        allGenerated = [...allGenerated, ...mappedProducts];
      }
    }
  }

  return {
    uploaded: [...allUploaded, ...customUploaded],
    generated: [...allGenerated, ...customGenerated]
  };
};

export default function ArtifactsPanel({
  artifacts,
  searchQuery = "",
  onSearchChange,
  isChatting = false,
  isExpanded = false,
  onToggleExpand,
  onClose,
}: {
  artifacts?: SessionArtifacts | null;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  isChatting?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onClose?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"generated" | "uploaded">("uploaded");
  const [toast, setToast] = useState("");
  const [showShare, setShowShare] = useState<Artifact | null>(null);
  const [showPreview, setShowPreview] = useState<Artifact | null>(null);
  const [isArtifactsOpen, setIsArtifactsOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [inlinePreview, setInlinePreview] = useState<Artifact | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [selectedProj, setSelectedProj] = useState(() => 
    localStorage.getItem("totrial_selected_project") || "全部"
  );

  // Initialize on mount
  useEffect(() => {
    const currentProj = localStorage.getItem("totrial_selected_project") || "全部";
    setSelectedProj(currentProj);
    
    // Auto-preview logic on mount (fixes first-click white screen)
    const docs = getProjectDocuments(currentProj);
    if (docs.uploaded && docs.uploaded.length > 0) {
      // Don't auto-preview for knowledge base as per usual KB behavior
    }
  }, []);

  useEffect(() => {
    const handleProjectChange = () => {
      const newProj = localStorage.getItem("totrial_selected_project") || "全部";
      setSelectedProj(newProj);
      setInlinePreview(null);
    };
    window.addEventListener("totrial_project_changed", handleProjectChange);
    return () => {
      window.removeEventListener("totrial_project_changed", handleProjectChange);
    };
  }, []);

  useEffect(() => {
    const handleHighlight = (e: any) => {
      const { artifactId, page } = e.detail;
      const currentProj = localStorage.getItem("totrial_selected_project") || "全部";
      const allDocs = getProjectDocuments(currentProj);
      const doc = allDocs.uploaded.find((d: any) => d.id === artifactId) || 
                  allDocs.generated.find((d: any) => d.id === artifactId) || 
                  { id: artifactId, name: "引用文档.pdf", type: "pdf", size: "1.2 MB" };
      
      setActiveTab("uploaded");
      setInlinePreview(doc as any);
      // We can use a custom event or state to scroll. For now let's just highlight it.
      setTimeout(() => {
        const el = document.getElementById("preview-highlight");
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    };
    window.addEventListener('totrial_highlight_artifact', handleHighlight);
    return () => window.removeEventListener('totrial_highlight_artifact', handleHighlight);
  }, []);

  useEffect(() => {
    const handleOpen = () => {
      const currentProj = localStorage.getItem("totrial_selected_project") || "全部";
      setSelectedProj(currentProj);
      setActiveTab("uploaded"); 
    };
    window.addEventListener('totrial_open_artifacts', handleOpen);
    return () => {
      window.removeEventListener('totrial_open_artifacts', handleOpen);
    };
  }, []);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            const newDoc: Artifact = {
              id: `custom-up-${Date.now()}`,
              name: "上传测试文档_" + (new Date().toLocaleTimeString()) + ".pdf",
              type: "pdf",
              size: "1.5 MB",
              uploadTime: new Date().toISOString().split('T')[0],
              isVectorized: true
            };
            const saved = localStorage.getItem("totrial_custom_kb_docs") || "[]";
            const parsed = JSON.parse(saved);
            parsed.push({ ...newDoc, project: selectedProj });
            localStorage.setItem("totrial_custom_kb_docs", JSON.stringify(parsed));
            
            // Trigger refresh
            setSelectedProj(prevProj => {
              const p = prevProj;
              return p;
            });
            triggerToast("文档已上传并完成向量化解析");
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const handleArchive = (item: Artifact) => {
    const savedKb = localStorage.getItem("totrial_custom_kb_docs") || "[]";
    const parsedKb = JSON.parse(savedKb);
    
    const archivedItem: Artifact = {
      ...item,
      id: `archived-${item.id}`,
      uploadTime: new Date().toISOString().split('T')[0],
      isVectorized: true,
      isArchived: true
    };
    
    parsedKb.push({ ...archivedItem, project: selectedProj });
    localStorage.setItem("totrial_custom_kb_docs", JSON.stringify(parsedKb));

    // Update the generated docs list to mark as archived
    const savedGen = localStorage.getItem("totrial_custom_generated_docs") || "[]";
    const parsedGen = JSON.parse(savedGen);
    // Note: The mock generated items are not in localstorage by default, 
    // so we just add to KB and show toast.
    
    triggerToast("产物已成功归档至项目知识库");
    // Trigger re-render by refreshing state
    setSelectedProj(prev => prev);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "pdf":
      case "md":
        return <FileText className="w-5 h-5 text-rose-500" />;
      case "xlsx":
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case "docx":
        return <FileText className="w-5 h-5 text-[#083190]" />;
      case "png":
        return <ImageIcon className="w-5 h-5 text-purple-500" />;
      default:
        return <FileArchive className="w-5 h-5 text-gray-500" />;
    }
  };

  const displayArtifacts = artifacts || getProjectDocuments(selectedProj);

  if (searchQuery) {
    // optional filter logic
  }

  return (
    <>
      <div className="bg-white flex flex-col font-sans relative z-10 w-full h-full overflow-hidden">
        <div className="flex items-center px-6 border-b border-gray-100 bg-white shrink-0">
          <div className="flex space-x-6 h-full">
          <button 
            onClick={() => {
              setActiveTab("uploaded");
              setInlinePreview(null);
            }}
            className={`h-full py-4 border-b-2 transition-all text-xs font-bold ${activeTab === 'uploaded' ? 'border-[#083190] text-[#083190]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            项目知识库
          </button>
          <button 
            onClick={() => {
              setActiveTab("generated");
              setInlinePreview(null);
            }}
            className={`h-full py-4 border-b-2 transition-all text-xs font-bold ${activeTab === 'generated' && !inlinePreview ? 'border-[#083190] text-[#083190]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            AI 产物
          </button>
        </div>

        <div className="flex-1" />
        
        <div className="flex items-center space-x-2">
          {isExpanded && (
            <button
              onClick={() => {
                if (onToggleExpand) onToggleExpand();
              }}
              className="flex items-center text-xs font-medium text-gray-500 hover:text-[#083190] hover:bg-slate-50 px-2 py-1.5 rounded transition-colors"
            >
              <Minimize2 className="w-3.5 h-3.5 mr-1" />
              收起
            </button>
          )}
          {!isExpanded && (
            <button
              onClick={() => {
                if (onToggleExpand) onToggleExpand();
              }}
              className="p-1.5 text-gray-400 hover:text-[#083190] hover:bg-slate-100 rounded-lg transition-colors"
              title="全屏放大"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={() => {
              setInlinePreview(null);
              if (onClose) onClose();
              window.dispatchEvent(new CustomEvent('totrial_artifacts_closed'));
            }}
            className={`transition-colors ${isExpanded ? 'flex items-center text-xs font-medium text-gray-500 hover:text-rose-600 hover:bg-rose-50 px-2 py-1.5 rounded' : 'p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg'}`}
          >
            <X className={isExpanded ? "w-3.5 h-3.5 mr-1" : "w-4 h-4"} />
            {isExpanded && "关闭"}
          </button>
        </div>
      </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar bg-white">
          {inlinePreview ? (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <button 
                  onClick={() => setInlinePreview(null)}
                  className="flex items-center text-xs text-gray-500 hover:text-gray-900 font-medium"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  返回
                </button>
                <div className="flex items-center space-x-2">
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2 mb-10">
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                    {inlinePreview.name.replace(/\.[^/.]+$/, "")}
                  </h2>
                  <div className="flex items-center space-x-2 text-[11px] text-gray-400 font-medium">
                    <span>医学 AI 助手</span>
                    <span>•</span>
                    <span>2026-07-15</span>
                  </div>
                </div>

                <div className="space-y-6 text-[13.5px] text-gray-700 leading-relaxed text-justify">
                  <div className="bg-blue-50/50 border border-blue-100/50 p-4 rounded-xl space-y-2">
                    <h3 className="font-bold text-[#083190] flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      核心结论摘要
                    </h3>
                    <p className="text-gray-600">
                      经深度文本提取病历特征并对照临床试验方案，受试者符合率为 98.7%。核心入组指标全量对齐，未触及排斥性阈值，判定为：<b>推荐申报入组</b>。
                    </p>
                  </div>

                  <section className="space-y-3">
                    <h3 className="text-[14px] font-bold text-gray-900 border-l-4 border-[#083190] pl-3 py-0.5">一、 受试者临床画像结构化描述</h3>
                    <p>
                      受试者郝彬（男，62岁），临床诊断为“稳定性心绞痛”。主诉阵发性胸痛近3年。
                      脱敏分析显示：静息心电图示 V4-V6 导联 ST 段压低 0.15mV。
                      肝肾功能化验结果均在安全基准线内（ALT 28 U/L，Cr 76 umol/L）。
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-[14px] font-bold text-gray-900 border-l-4 border-[#083190] pl-3 py-0.5">二、 临床试验协议(Protocol)契合度分析</h3>
                    <p>
                      对照《冠心宁片中保临床方案》，入选标准 1-4 项均有明确病历证据支撑：
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-600">
                      <li>年龄 72 岁（符合 18-75 岁区间限制）；</li>
                      <li id="preview-highlight" className="bg-blue-100/50 p-1 rounded font-bold text-blue-900 ring-2 ring-blue-200 transition-all">
                        确诊病史 3 年（满足 6 月以上稳定期要求）；[定位到此处]
                      </li>
                      <li>ST段压低事実（满足心电图诊断标准）。</li>
                    </ul>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-[14px] font-bold text-gray-900 border-l-4 border-[#083190] pl-3 py-0.5">三、 安全性风险及排除因子审计</h3>
                    <p>
                      特别核查了 NYHA 心功能分级，患者为 II 级，未触发 III 级及以上的排除红线。
                      近 6 个月内无不稳定性心绞痛及 PCI 手术记录，排除项审计通过。
                    </p>
                  </section>

                  <div className="pt-8 text-center text-[10px] text-gray-400 border-t border-gray-50 italic">
                    -- 文档结束，由智能助手于 2026-07-15 编译完成 --
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {activeTab === "uploaded" && (
                <div className="p-4 border-b border-gray-50 flex items-center justify-between shrink-0">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {selectedProj} 知识库
                  </span>
                  <button 
                    disabled={isUploading}
                    onClick={handleUpload}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#083190] hover:bg-blue-800 text-white rounded-md text-[11px] font-bold transition-all disabled:opacity-50"
                  >
                    {isUploading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploading ? "向量化中..." : "添加知识"}</span>
                  </button>
                </div>
              )}

              {isUploading && activeTab === "uploaded" && (
                <div className="px-6 py-4 bg-blue-50/50 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600 mr-2" />
                      <span className="text-[12px] font-bold text-blue-900">文本切片与向量化解析中...</span>
                    </div>
                    <span className="text-[11px] font-bold text-blue-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="bg-blue-600 h-full"
                    />
                  </div>
                </div>
              )}

              <div className="p-2 space-y-2 flex-1">
                {activeTab === "generated" && (
                  <div className="space-y-1">
                    {(displayArtifacts?.generated || []).length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <MessageSquare className="w-10 h-10 mb-3 opacity-20" />
                        <p className="text-xs">暂无对话生成的产物</p>
                      </div>
                    ) : (
                      (displayArtifacts?.generated || []).map((item, idx) => (
                        <div
                          key={`${item.id}-${idx}`}
                          className="group flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
                        >
                          <div 
                            onClick={() => setInlinePreview(item)}
                            className="p-2 bg-rose-50 rounded text-rose-600 mr-3 cursor-pointer"
                          >
                            {getIcon(item.type)}
                          </div>
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setInlinePreview(item)}>
                            <p className="text-[13px] font-medium text-gray-800 truncate">{item.name}</p>
                            <p className="text-[11px] text-gray-400">已生成 • {item.size || "1.2 MB"}</p>
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleArchive(item)}
                              className="p-1.5 text-gray-400 hover:text-[#083190] hover:bg-white rounded border border-transparent hover:border-gray-200"
                              title="归档至知识库"
                            >
                              <FolderOpen className="w-4 h-4" />
                            </button>
                            <ArrowUpRight className="w-4 h-4 text-gray-300" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "uploaded" && (
                  <div className="space-y-1">
                    {(displayArtifacts?.uploaded || []).map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        onClick={() => setInlinePreview(item)}
                        className={`group flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all cursor-pointer border ${highlightedId === item.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'border-transparent'}`}
                      >
                        <div className="p-2 bg-gray-50 rounded text-gray-400 mr-3 group-hover:bg-white transition-colors">
                          {getIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-[13px] font-medium text-gray-800 truncate">{item.name}</p>
                            {item.isVectorized && (
                              <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1 py-0.5 rounded border border-emerald-100 font-bold">已向量化</span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 flex items-center mt-0.5">
                            {item.size || "1.2 MB"} 
                            <span className="mx-1.5 opacity-30">•</span> 
                            {item.uploadTime || "2026-07-01"}
                            {item.isArchived && <span className="ml-2 text-blue-500 font-bold">来自产物归档</span>}
                          </p>
                        </div>
                        <Download className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Global Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-10 left-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center text-[14px] font-medium"
          >
            <CheckCircle2 className="w-5 h-5 text-green-400 mr-2" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShare && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
              onClick={() => setShowShare(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
              animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
              exit={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
              className="fixed top-1/2 left-1/2 z-50 bg-white rounded-xl shadow-2xl p-6 w-[400px]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-bold text-gray-800">
                  分享文件
                </h3>
                <button
                  onClick={() => setShowShare(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                {getIcon(showShare.type)}
                <span className="ml-2 text-[14px] text-gray-800 font-medium truncate">
                  {showShare.name}
                </span>
              </div>
              <div className="text-[13px] text-gray-500 mb-2">
                生成分享链接：
              </div>
              <div className="flex items-center">
                <input
                  readOnly
                  value={`https://lintong.app/share/${showShare.id}`}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-l-md px-3 py-2 text-[13px] text-gray-600 outline-none"
                />
                <button
                  onClick={() => {
                    triggerToast("链接已复制，可分享给协同人员");
                    setShowShare(null);
                  }}
                  className="bg-[#083190] text-white px-4 py-2 rounded-r-md text-[13px] font-medium flex items-center hover:bg-blue-700 transition-colors"
                >
                  <Copy className="w-4 h-4 mr-1.5" /> 复制链接
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setShowPreview(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: "50%", x: "-50%" }}
              animate={{ opacity: 1, y: "-50%", x: "-50%" }}
              exit={{ opacity: 0, y: "50%", x: "-50%" }}
              className="fixed top-1/2 left-1/2 z-50 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col w-[800px] h-[85vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center">
                  {getIcon(showPreview.type)}
                  <h3 className="ml-2 text-[16px] font-bold text-gray-800">
                    {showPreview.name}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      triggerToast(
                        `[${showPreview.name}] 正在导出并下载成功...`,
                      );
                    }}
                    className="p-1.5 text-gray-500 hover:text-[#083190] hover:bg-blue-50 rounded transition-colors"
                    title="下载"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowPreview(null)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-gray-100 p-8 overflow-y-auto">
                {/* High fidelity mock content based on type */}
                <div className="bg-white shadow-sm border border-gray-200 max-w-2xl mx-auto min-h-full p-10">
                  <div className="text-center mb-8 border-b border-gray-200 pb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {showPreview.name.replace(/\.[^/.]+$/, "")}
                    </h1>
                    <p className="text-gray-500 text-sm">
                      由智能评估平台生成
                    </p>
                  </div>

                  {showPreview.type === "xlsx" ? (
                    <table className="w-full text-left border-collapse text-[13px]">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 p-2 font-semibold">
                            项目
                          </th>
                          <th className="border border-gray-200 p-2 font-semibold">
                            提取结果 / 状态
                          </th>
                          <th className="border border-gray-200 p-2 font-semibold">
                            置信度
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <tr key={i}>
                            <td className="border border-gray-200 p-2 text-gray-600">
                              数据项 {i}
                            </td>
                            <td className="border border-gray-200 p-2 text-gray-800 font-medium">
                              自动识别结果...
                            </td>
                            <td className="border border-gray-200 p-2 text-green-600">
                              99.%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="space-y-4 text-[14px] text-gray-700 leading-relaxed">
                      <p>
                        <strong>摘要：</strong>
                        根据您上传的文件，我们进行了深度的内容解析与智能重构。以下是核心要点内容。
                      </p>
                      <h3 className="font-bold text-gray-900 mt-6 mb-2">
                        一、 核心发现
                      </h3>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                          实现了对受试者临床记录的高效特征提取，误差率控制在
                          0.1% 内。
                        </li>
                        <li>自动校验了数据逻辑完整性，未发现明显偏离项。</li>
                        <li>符合最新 GCP 临床试验合规审查标准。</li>
                      </ul>
                      <h3 className="font-bold text-gray-900 mt-6 mb-2">
                        二、 详细内容
                      </h3>
                      <p className="text-justify text-gray-600">
                        此处为高保真的占位文本，用于展示长文档预览效果。在实际业务中，此处将渲染真实的
                        PDF 渲染器、Word 转码结果或高清图片。AI Monitoring
                        自动核查了各项参数，确认数据完整。
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg mt-4 border border-gray-100">
                    <span className="text-[#083190] font-bold">
                          智能批注：
                        </span>{" "}
                        此段落关键信息已提炼，可以直接用于报告生成或导出分享。
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-10 left-1/2 z-[100] bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg text-[14px] font-medium flex items-center"
          >
            <CheckCircle2 className="w-5 h-5 mr-2 text-green-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  function handleShare(item: Artifact) {
    setShowShare(item);
  }
}
