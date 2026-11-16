import MedicalQA from './ai/MedicalQA';
import AICapture from './ai/AICapture';
import AIMonitoring from './ai/AIMonitoring';
import AIFeaturePlaceholder from './ai/AIFeaturePlaceholder';
import ComingSoon from './ai/ComingSoon';
import TaskHall from './task/TaskHall';
import AcademicLibrary from './task/AcademicLibrary';
import { motion } from 'motion/react';
import SponsorCenter from './personal/SponsorCenter';
import SiteCenter from './personal/SiteCenter';
import ProjectLibrary from './personal/ProjectLibrary';
import AIScreening from './ai/AIScreening';
import AIDraft from './ai/AIDraft';
import PersonalWorkspace from './personal/PersonalWorkspace';
import PricingSystem from './operations/PricingSystem';
import UserFeedback from './operations/UserFeedback';
import BehaviorTracking from './operations/BehaviorTracking';
import { Building2, UserSquare, ShieldAlert, FolderOpen, ChevronDown, Plus, FileText, Bot, X, Check, Edit2, Trash2, Users } from 'lucide-react';
import ProjectWorkspace from './project/ProjectWorkspace';
import CreateProject from './project/CreateProject';
import { MemberManagementModal } from './ai/ShareConversationPrototype';
import React, { useState, useEffect } from 'react';

const InteractivePlaceholder = ({ title }: { title: string }) => {
  return (
    <div className="flex bg-white h-full min-h-[calc(100vh-100px)] rounded-xl border border-gray-100 overflow-hidden shadow-sm font-sans items-center justify-center relative">
      <div className="max-w-xl text-center px-10">
        <div className="w-20 h-20 bg-blue-50 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-sm border border-blue-100">
          {title === '找医院' && <Building2 className="w-10 h-10 text-[#13316e]" />}
          {title === '找厂家' && <UserSquare className="w-10 h-10 text-[#13316e]" />}
          {title === '找SMO' && <ShieldAlert className="w-10 h-10 text-[#13316e]" />}
        </div>
        <h1 className="text-[32px] font-bold text-gray-800 tracking-tight mb-5">{title}</h1>
        <p className="text-[15px] text-gray-500 leading-relaxed mb-10 max-w-lg mx-auto">
          该功能模块正在研发设计中，未来将为您提供更高效、便捷的机构与资源匹配服务。
        </p>
        <div className="inline-flex items-center justify-center px-5 py-2.5 bg-gray-100/80 text-gray-500 rounded-full text-[13px] font-medium">
          研发设计中 · 敬请期待
        </div>
      </div>
    </div>
  );
};

const AI_TOOLS = ['医研千问', 'AI Capture', 'AI Monitoring', 'AI Screening', 'AI Analysis', 'AI Draft', 'AI CRF', 'AI-TMF', 'AI Coding'];

export default function ContentDIP({ userRole, activeMenu, setActiveMenu }: { userRole: 'sponsor' | 'site', activeMenu: string, setActiveMenu: (menu: string) => void }) {
  const [currentProject, setCurrentProject] = useState<string | null>(null);

  // Load and manage project state
  const [projects, setProjects] = useState<string[]>(() => {
    const saved = localStorage.getItem("totrial_projects");
    return saved ? JSON.parse(saved) : ["全部", "冠心宁片中保临床方案", "盐酸安罗替尼胶囊"];
  });

  const [selectedProject, setSelectedProject] = useState<string>(() => {
    const saved = localStorage.getItem("totrial_selected_project");
    return saved || "全部";
  });

  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editProjectName, setEditProjectName] = useState<string>("");
  const [showMemberModal, setShowMemberModal] = useState(false);

  const handleRenameProject = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingProjectId(null);
      return;
    }
    if (projects.includes(trimmed)) {
      alert("项目号或项目名称已存在！");
      return;
    }
    const updated = projects.map(p => p === oldName ? trimmed : p);
    setProjects(updated);
    localStorage.setItem("totrial_projects", JSON.stringify(updated));
    if (selectedProject === oldName) {
      setSelectedProject(trimmed);
      localStorage.setItem("totrial_selected_project", trimmed);
    }
    localStorage.setItem("totrial_rename_project_action", JSON.stringify({ oldName, newName }));
    window.dispatchEvent(new Event('totrial_project_renamed'));
    window.dispatchEvent(new Event('totrial_project_changed'));
    setEditingProjectId(null);
  };

  const handleDeleteProject = (projName: string) => {
    if (confirm(`确定要删除项目 [${projName}] 吗？\n删除后，该项目下的会话将解除归档，可在“全部”中重新归档。`)) {
      const updated = projects.filter(p => p !== projName);
      setProjects(updated);
      localStorage.setItem("totrial_projects", JSON.stringify(updated));
      if (selectedProject === projName) {
        setSelectedProject("全部");
        localStorage.setItem("totrial_selected_project", "全部");
      }
      localStorage.setItem("totrial_delete_project_action", JSON.stringify({ projName }));
      window.dispatchEvent(new Event('totrial_project_deleted'));
      window.dispatchEvent(new Event('totrial_project_changed'));
    }
  };

  useEffect(() => {
    if (activeMenu === '冠心宁片中保临床方案' || activeMenu === '盐酸安罗替尼胶囊') {
      setCurrentProject(activeMenu);
      setSelectedProject(activeMenu);
      localStorage.setItem("totrial_selected_project", activeMenu);
    } else if (!AI_TOOLS.includes(activeMenu) && activeMenu !== '个人工作台') {
      setCurrentProject(null);
    }
  }, [activeMenu]);

  const handleSelectProject = (proj: string) => {
    setSelectedProject(proj);
    localStorage.setItem("totrial_selected_project", proj);
    setShowProjectDropdown(false);
    
    // Also trigger custom storage event to notify child components immediately
    window.dispatchEvent(new Event('totrial_project_changed'));
  };

  const handleAddProject = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newProjectName.trim();
    if (!trimmed) return;
    if (!projects.includes(trimmed)) {
      const updated = [...projects, trimmed];
      setProjects(updated);
      localStorage.setItem("totrial_projects", JSON.stringify(updated));
    }
    setSelectedProject(trimmed);
    localStorage.setItem("totrial_selected_project", trimmed);
    setNewProjectName("");
    setShowNewProjectModal(false);
    setShowProjectDropdown(false);
    
    window.dispatchEvent(new Event('totrial_project_changed'));
  };

  const getDocCount = (proj: string) => {
    let customCount = 0;
    try {
      const saved = localStorage.getItem("totrial_custom_generated_docs");
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered = parsed.filter((d: any) => d.project === proj || proj === "全部" || !proj);
        customCount = filtered.length;
      }
    } catch (e) {
      console.error(e);
    }

    let defaultCount = 0;
    if (window.PROJECT_KNOWLEDGE_STORE) {
      if (proj === "全部" || !proj) {
        Object.values(window.PROJECT_KNOWLEDGE_STORE).forEach(p => {
          defaultCount += p.kb_files.length + p.ai_products.length;
        });
      } else {
        const p = Object.values(window.PROJECT_KNOWLEDGE_STORE).find(p => p.name === proj);
        if (p) {
          defaultCount = p.kb_files.length + p.ai_products.length;
        }
      }
    }

    if (defaultCount === 0) {
      if (proj === "全部") return 24 + customCount;
      if (proj === "冠心宁片中保临床方案" || proj === "盐酸安罗替尼胶囊") return 12 + customCount;
      return 3 + customCount;
    }

    return defaultCount + customCount;
  };

  const renderTool = (toolName: string) => {
    switch (toolName) {
      case '医研千问': return <div className="h-full bg-white overflow-hidden"><MedicalQA selectedProject={selectedProject} /></div>;
      case 'AI Capture': return <div className="h-full bg-white overflow-hidden"><AICapture selectedProject={selectedProject} /></div>;
      case 'AI Monitoring': return <div className="h-full bg-white overflow-hidden"><AIMonitoring selectedProject={selectedProject} /></div>;
      case 'AI Screening': return <div className="h-full bg-white overflow-hidden"><AIScreening selectedProject={selectedProject} /></div>;
      case 'AI Analysis': return <AIFeaturePlaceholder title="AI Analysis" description="基于大模型驱动的临床数据智能统计与分析引擎，致力于挖掘深层数据价值并辅助科学决策！" />;
      case 'AI Draft': return <div className="h-full bg-white overflow-hidden"><AIDraft selectedProject={selectedProject} /></div>;
      case 'AI CRF': return <AIFeaturePlaceholder title="AI CRF" description="实现从项目方案到受试者CRF生成，自动化提取关键变量并生成标准数据采集表！" />;
      case 'AI-TMF': return <AIFeaturePlaceholder title="AI-TMF" description="基于大模型赋能的智能项目文件管理平台，致力于实现全生命周期归档的自动化分类与质控验证！" />;
      case 'AI Coding': return <AIFeaturePlaceholder title="AI Coding" description="实现基于AI的药物与疾病智能编码，自动映射MedDRA与WHODrug标准词典！" />;
      default: return null;
    }
  };

  const renderContent = () => {
    // If it's an AI tool, we now ALWAYS render it wrapped inside the top project partition selector
    if (AI_TOOLS.includes(activeMenu)) {
      return (
        <div className="h-full flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Top Project Partition Selection Bar */}
          <div className="px-5 py-2.5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center space-x-4">
              {/* Project Dropdown Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                  className="flex items-center space-x-2 text-gray-800 hover:text-[#083190] font-bold transition-colors py-1 px-2 hover:bg-gray-50 rounded-lg text-left"
                >
                  <FolderOpen className="w-4.5 h-4.5 text-[#083190] shrink-0" />
                  <span className="text-[15px] truncate max-w-[240px]">{selectedProject}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                </button>

                {showProjectDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProjectDropdown(false)}></div>
                    <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-gray-150 z-50 py-1.5 overflow-hidden">
                      <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        选择项目
                      </div>
                      <div className="max-h-[220px] overflow-y-auto">
                        {projects.map((proj) => (
                          <div
                            key={proj}
                            className="group w-full flex items-center justify-between px-3.5 py-1 text-[13px] text-gray-700 hover:bg-blue-50/50 transition-colors font-medium relative"
                          >
                            {editingProjectId === proj ? (
                              <div className="flex items-center space-x-1 w-full" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={editProjectName}
                                  onChange={(e) => setEditProjectName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleRenameProject(proj, editProjectName);
                                    if (e.key === "Escape") setEditingProjectId(null);
                                  }}
                                  className="flex-1 px-1.5 py-0.5 border border-blue-400 rounded bg-white text-[12px] outline-none"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleRenameProject(proj, editProjectName)}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                  title="保存"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingProjectId(null)}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                                  title="取消"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleSelectProject(proj)}
                                  className="flex-1 text-left truncate py-1.5 text-gray-700 hover:text-[#083190]"
                                >
                                  {proj}
                                </button>
                                <div className="flex items-center space-x-0.5 shrink-0">
                                  {proj !== "全部" && (
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingProjectId(proj);
                                          setEditProjectName(proj);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-[#083190] hover:bg-gray-100 rounded transition-opacity"
                                        title="重命名项目"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteProject(proj);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-opacity"
                                        title="删除项目"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                  {selectedProject === proj && (
                                    <Check className="w-4 h-4 text-[#083190] shrink-0" />
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 mt-1.5 pt-1.5 px-2">
                        <button
                          onClick={() => {
                            setShowNewProjectModal(true);
                            setShowProjectDropdown(false);
                          }}
                          className="w-full flex items-center justify-center space-x-1 py-1.5 bg-gray-50 hover:bg-gray-100 text-[#083190] rounded-lg text-[12px] font-bold transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>新建项目</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Left side only contains selected project dropdown now */}
            </div>

            {/* Right side: Moved Document Count Trigger here, replacing the old '项目文档' button */}
            <div className="flex items-center space-x-3">
              {selectedProject === "全部" || !selectedProject ? (
                <div className="flex items-center space-x-1.5 text-gray-500 px-3.5 py-1.5 text-[13px]">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span>
                    {window.PROJECT_KNOWLEDGE_STORE ? Object.keys(window.PROJECT_KNOWLEDGE_STORE).length : 1} 个项目，共 {getDocCount(selectedProject)} 份文档
                  </span>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowMemberModal(true)}
                    className="flex items-center space-x-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-[#083190] px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all border border-gray-200"
                  >
                    <Users className="w-4 h-4" />
                    <span>成员管理</span>
                  </button>
                  <button
                    onClick={() => window.dispatchEvent(new Event('totrial_toggle_artifacts'))}
                    className="flex items-center space-x-1.5 bg-blue-50/70 hover:bg-blue-100/80 text-[#083190] px-3.5 py-1.5 rounded-lg text-[13px] font-bold transition-all shadow-sm border border-[#083190]/10"
                  >
                    <FileText className="w-4 h-4 text-[#083190]" />
                    <span>{getDocCount(selectedProject)} 份文档</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Actual Tool Content */}
          <div className="flex-1 overflow-hidden">
            {renderTool(activeMenu)}
          </div>
        </div>
      );
    }

    switch (activeMenu) {
      case '个人工作台': return <PersonalWorkspace />;
      case '订阅计划': return <PricingSystem />;
      case '用户反馈': return <UserFeedback />;
      case '行为追踪': return <BehaviorTracking />;
      case '新建项目': return <CreateProject 
        setActiveMenu={(tool) => {
          setActiveMenu(tool);
        }}
        onCreateProject={(projectName, toolName) => {
          if (!projects.includes(projectName)) {
            const updated = [...projects, projectName];
            setProjects(updated);
            localStorage.setItem("totrial_projects", JSON.stringify(updated));
          }
          setSelectedProject(projectName);
          localStorage.setItem("totrial_selected_project", projectName);
          setActiveMenu(toolName);
        }}
      />;
      
      // Projects
      case '冠心宁片中保临床方案':
      case '盐酸安罗替尼胶囊':
        return <ProjectWorkspace 
           projectName={activeMenu} 
           initialTool={undefined} 
        />;

      // Interaction Platform
      case '找医院': return <InteractivePlaceholder title="找医院" />;
      case '找厂家': return <InteractivePlaceholder title="找厂家" />;
      case '找SMO': return <InteractivePlaceholder title="找SMO" />;
      
      case '任务大厅': return <TaskHall />;
      case '学术文库': return <AcademicLibrary />;
      
      case '我的项目': 
      case '中心管理':
      case '人员列表':
      case '公司介绍':
          return userRole === 'sponsor' ? <SponsorCenter activeTab={activeMenu} /> : <SiteCenter activeTab={activeMenu} />;
      case '协同中心库':
      case '公开项目库':
          return <ProjectLibrary isPublic={activeMenu === '公开项目库'} />;
          
      default: return <ComingSoon title={activeMenu} />;
    }
  };

  return (
    <div className="relative w-full h-full">
      <motion.div 
        key={activeMenu}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="max-w-[1600px] w-full h-full mx-auto"
      >
        {renderContent()}
      </motion.div>

      {/* New Project Partition Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-bold text-gray-800 flex items-center">
                <FolderOpen className="w-5 h-5 mr-2 text-[#083190]" />
                新建项目
              </h3>
              <button onClick={() => setShowNewProjectModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1.5 uppercase">项目名称/项目号</label>
                <input
                  type="text"
                  required
                  placeholder="请输入项目名称/项目号,例如：阿普唑仑片..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-[13px] text-gray-500 hover:bg-gray-50 font-bold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#083190] hover:bg-blue-900 text-white rounded-xl text-[13px] font-bold shadow-md transition-colors"
                >
                  确认创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Documents & AI Products Modal */}
      {showDocsModal && (
        <div className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
              <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                 <div>
                   <h3 className="text-[16px] font-bold text-gray-800 flex items-center">
                     <FolderOpen className="w-5 h-5 text-[#083190] mr-2" />
                     {selectedProject} - 项目产物与文档
                   </h3>
                   <p className="text-[12px] text-gray-400 mt-0.5">管理和查看该项目的所有上传原件和 AI 生成报告</p>
                 </div>
                 <button onClick={() => setShowDocsModal(false)} className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                   <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="p-6 overflow-y-auto bg-white flex-1 space-y-8">
                 {/* Upload Button */}
                 <div>
                   <h4 className="text-[13px] font-bold text-gray-700 mb-3 flex items-center">
                     <span className="w-1.5 h-3.5 bg-[#083190] rounded-full mr-2"></span>
                     来源文档 (用户上传)
                   </h4>
                   <div className="flex gap-4 flex-wrap">
                      <button className="flex flex-col items-center justify-center w-32 h-32 bg-gray-50 border border-gray-200 border-dashed rounded-xl hover:border-[#083190] hover:bg-blue-50/30 transition-all text-gray-400 hover:text-[#083190] shadow-sm group">
                         <Plus className="w-6 h-6 mb-1.5 group-hover:scale-110 transition-transform" />
                         <span className="text-[12px] font-bold">上传原件</span>
                      </button>
                      
                      {selectedProject !== "盐酸安罗替尼胶囊" && (
                        <div className="flex flex-col items-start justify-between w-32 h-32 bg-white border border-gray-150 rounded-xl p-3 shadow-sm hover:shadow transition-shadow group relative">
                           <div className="w-8 h-8 bg-red-50 text-red-500 rounded flex items-center justify-center"><FileText className="w-4 h-4" /></div>
                           <div className="text-[12px] font-bold text-gray-800 line-clamp-2 mt-2" title="冠心宁01002(OCR).pdf">冠心宁01002(OCR).pdf</div>
                           <div className="text-[10px] text-gray-400 mt-1 w-full flex justify-between font-mono"><span>PDF</span><span>241KB</span></div>
                        </div>
                      )}

                      {selectedProject !== "冠心宁片中保临床方案" && (
                        <div className="flex flex-col items-start justify-between w-32 h-32 bg-white border border-gray-150 rounded-xl p-3 shadow-sm hover:shadow transition-shadow group relative">
                           <div className="w-8 h-8 bg-red-50 text-red-500 rounded flex items-center justify-center"><FileText className="w-4 h-4" /></div>
                           <div className="text-[12px] font-bold text-gray-800 line-clamp-2 mt-2" title="盐酸安罗替尼临床试验方案.pdf">安罗替尼方案.pdf</div>
                           <div className="text-[10px] text-gray-400 mt-1 w-full flex justify-between font-mono"><span>PDF</span><span>4.1MB</span></div>
                        </div>
                      )}
                      
                      <div className="flex flex-col items-start justify-between w-32 h-32 bg-white border border-gray-150 rounded-xl p-3 shadow-sm hover:shadow transition-shadow group relative">
                         <div className="w-8 h-8 bg-green-50 text-green-600 rounded flex items-center justify-center"><FileText className="w-4 h-4" /></div>
                         <div className="text-[12px] font-bold text-gray-800 line-clamp-2 mt-2" title="E-CRF-11-01002.csv">E-CRF-11-01002.csv</div>
                         <div className="text-[10px] text-gray-400 mt-1 w-full flex justify-between font-mono"><span>CSV</span><span>1.2MB</span></div>
                      </div>
                   </div>
                 </div>
                 
                 <div>
                   <h4 className="text-[13px] font-bold text-gray-700 mb-3 flex items-center">
                     <span className="w-1.5 h-3.5 bg-green-600 rounded-full mr-2"></span>
                     AI 产物 (系统生成)
                   </h4>
                   <div className="flex gap-4 flex-wrap">
                      <div className="flex flex-col items-start justify-between w-32 h-32 bg-blue-50/20 border border-blue-100 rounded-xl p-3 shadow-sm group relative overflow-hidden">
                         <div className="absolute top-0 right-0 bg-[#083190] text-white text-[9px] px-1.5 py-0.5 rounded-bl font-medium shadow-sm">AI 生成</div>
                         <div className="w-8 h-8 bg-blue-100 text-[#083190] rounded flex items-center justify-center"><FileText className="w-4 h-4" /></div>
                         <div className="text-[12px] font-bold text-gray-800 line-clamp-2 mt-2">方案偏离问题清单.xlsx</div>
                         <div className="text-[10px] text-[#083190] mt-1 font-bold">AI Monitoring</div>
                      </div>
                      <div className="flex flex-col items-start justify-between w-32 h-32 bg-blue-50/20 border border-blue-100 rounded-xl p-3 shadow-sm group relative overflow-hidden">
                         <div className="absolute top-0 right-0 bg-[#083190] text-white text-[9px] px-1.5 py-0.5 rounded-bl font-medium shadow-sm">AI 生成</div>
                         <div className="w-8 h-8 bg-blue-100 text-[#083190] rounded flex items-center justify-center"><FileText className="w-4 h-4" /></div>
                         <div className="text-[12px] font-bold text-gray-800 line-clamp-2 mt-2">受试者关键项提取结果.xlsx</div>
                         <div className="text-[10px] text-[#083190] mt-1 font-bold">AI Capture</div>
                      </div>
                      <div className="flex flex-col items-start justify-between w-32 h-32 bg-blue-50/20 border border-blue-100 rounded-xl p-3 shadow-sm group relative overflow-hidden">
                         <div className="absolute top-0 right-0 bg-[#083190] text-white text-[9px] px-1.5 py-0.5 rounded-bl font-medium shadow-sm">AI 生成</div>
                         <div className="w-8 h-8 bg-blue-100 text-[#083190] rounded flex items-center justify-center"><FileText className="w-4 h-4" /></div>
                         <div className="text-[12px] font-bold text-gray-800 line-clamp-2 mt-2">入排指标智能比对表.docx</div>
                         <div className="text-[10px] text-[#083190] mt-1 font-bold">AI Screening</div>
                      </div>
                   </div>
                 </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50/30">
                <button
                  onClick={() => setShowDocsModal(false)}
                  className="px-5 py-2 bg-[#083190] hover:bg-blue-900 text-white rounded-xl text-[13px] font-bold shadow-md transition-colors"
                >
                  关闭
                </button>
              </div>
           </div>
        </div>
      )}

      {/* 成员管理弹窗 */}
      {showMemberModal && (
        <MemberManagementModal
          isOpen={showMemberModal}
          onClose={() => setShowMemberModal(false)}
          projectName={selectedProject === "全部" ? "冠心宁片中保临床方案" : selectedProject}
          isCreator={true}
          members={[
            { id: "1", name: "小雨滴", avatar: "小", role: "创建者", joinDate: "2026-08-20" },
            { id: "2", name: "张医生", avatar: "张", role: "成员", joinDate: "2026-08-22" },
            { id: "3", name: "李护士", avatar: "李", role: "成员", joinDate: "2026-08-23" },
          ]}
          onInvite={(phone) => {
            console.log("邀请手机号：", phone);
          }}
          onRemove={(id) => {
            console.log("移除成员ID：", id);
          }}
        />
      )}
    </div>
  );
}


