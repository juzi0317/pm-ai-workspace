import React, { useState, useEffect } from "react";
import {
  Plus,
  FolderOpen,
  MoreVertical,
  MessageSquare,
  Search,
  FileText,
  Bot,
  FileEdit,
  Crosshair,
  BarChart2,
  Cpu,
  Activity,
  History,
  X,
} from "lucide-react";
import MedicalQA from "../ai/MedicalQA";
import AICapture from "../ai/AICapture";
import AIMonitoring from "../ai/AIMonitoring";
import AIScreening from "../ai/AIScreening";
import AIFeaturePlaceholder from "../ai/AIFeaturePlaceholder";

const AI_TOOLS = [
  { name: "医研千问", icon: Cpu, desc: "医疗法规与专业知识问答" },
  { name: "AI Screening", icon: Search, desc: "高效患者招募与初筛工具" },
  { name: "AI Monitoring", icon: Activity, desc: "临床试验数据智能核查" },
  { name: "AI Capture", icon: Crosshair, desc: "医疗数据结构化提取" },
  { name: "AI Analysis", icon: BarChart2, desc: "临床数据智能统计分析" },
  { name: "AI Draft", icon: FileEdit, desc: "临床试验设计方案生成" },
  { name: "AI-TMF", icon: FolderOpen, desc: "智能项目文件管理与质控" },
];

export default function ProjectWorkspace({
  projectName,
  initialTool = null,
  onClearInitialTool,
}: {
  projectName: string;
  initialTool?: string | null;
  onClearInitialTool?: () => void;
}) {
  const [internalTool, setInternalTool] = useState<string | null>(initialTool);
  const [showToolSelector, setShowToolSelector] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  useEffect(() => {
    if (initialTool) {
      setInternalTool(initialTool);
      if (onClearInitialTool) {
        onClearInitialTool();
      }
    }
  }, [initialTool]);

  const selectedTool = internalTool;
  
  const handleSelectTool = (t: string) => {
    setInternalTool(t);
  };

  const handleExitTool = () => {
    setInternalTool(null);
  };

  const renderSelectedTool = () => {
    switch (selectedTool) {
      case "医研千问":
        return <MedicalQA />;
      case "AI Capture":
        return <AICapture />;
      case "AI Monitoring":
        return <AIMonitoring />;
      case "AI Screening":
        return <AIScreening />;
      case "AI Analysis":
        return (
          <AIFeaturePlaceholder
            title="AI Analysis"
            description="基于大模型驱动的临床数据智能统计与分析引擎，致力于挖掘深层数据价值并辅助科学决策！"
          />
        );
      case "AI Draft":
        return (
          <AIFeaturePlaceholder
            title="AI Draft"
            description="基于多参照样本的大模型方案生成系统，致力于快速构筑高质量、强合规的临床试验设计方案！"
          />
        );
      case "AI-TMF":
        return (
          <AIFeaturePlaceholder
            title="AI-TMF"
            description="基于大模型赋能的智能项目文件管理平台，致力于实现全生命周期归档的自动化分类与质控验证！"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Compact Project Header */}
      <div className="px-5 py-2.5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FolderOpen className="w-4 h-4 text-[#083190]" />
            <h1 className="text-[15px] font-bold text-gray-800">{projectName}</h1>
          </div>
          <div className="h-4 w-[1px] bg-gray-200"></div>
          <button onClick={() => setShowMemberModal(true)} className="text-[13px] text-gray-500 hover:text-[#083190] flex items-center transition-colors">
            <Users className="w-3.5 h-3.5 mr-1" /> 成员管理
          </button>
          <div className="h-4 w-[1px] bg-gray-200"></div>
          <button onClick={() => setShowDocs(true)} className="text-[13px] text-gray-500 hover:text-[#083190] flex items-center transition-colors">
            <FileText className="w-3.5 h-3.5 mr-1" /> 12 份文档
          </button>
        </div>
        
        {selectedTool && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 bg-blue-50 px-2.5 py-1 rounded-md text-[13px]">
               <Bot className="w-3.5 h-3.5 text-[#083190]" />
               <span className="text-gray-600">当前工具:</span>
               <span className="text-blue-700 font-bold">{selectedTool}</span>
            </div>
            <button onClick={handleExitTool} className="text-[12px] text-gray-500 hover:text-gray-800 bg-white border border-gray-200 px-2.5 py-1 rounded shadow-sm hover:shadow transition-all">
              退出工具
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden relative bg-[#f4f6f8]">
        {selectedTool ? (
           <div className="h-full w-full">
              {renderSelectedTool()}
           </div>
        ) : (
          <div className="max-w-4xl mx-auto flex flex-col items-center pt-12 pb-20">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {projectName}
            </h2>
            <p className="text-gray-500 mb-12">您想从哪里开始？</p>

            {/* Tool Selector Trigger */}
            <div className="relative mb-16 w-full max-w-2xl">
              <div className="flex items-center space-x-3 w-full bg-white border border-gray-200 rounded-full shadow-sm p-2 pr-4 hover:shadow-md transition-shadow relative">
                <button
                  onClick={() => setShowToolSelector(!showToolSelector)}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-full transition-colors shrink-0"
                >
                  <Plus className="w-5 h-5 text-[#083190]" />
                  <span className="text-sm font-medium">选择AI工具</span>
                </button>

                <div className="flex-1 text-gray-400 text-sm pl-2 pointer-events-none">
                  点击左侧按钮选择工具，开始对话或分析...
                </div>
              </div>

              {/* Tool Selector Dropdown */}
              {showToolSelector && (
                <div className="absolute top-full left-0 mt-3 w-[400px] bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                    <span className="text-sm font-medium text-gray-700">
                      可用的 AI 工具
                    </span>
                  </div>
                  <div className="p-2 max-h-[300px] overflow-y-auto">
                    {AI_TOOLS.map((tool) => (
                      <button
                        key={tool.name}
                        onClick={() => {
                          handleSelectTool(tool.name);
                          setShowToolSelector(false);
                        }}
                        className="w-full flex items-center space-x-3 p-3 hover:bg-blue-50 rounded-lg text-left transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-50 group-hover:bg-white border border-gray-100 flex items-center justify-center shrink-0">
                          <tool.icon className="w-5 h-5 text-gray-500 group-hover:text-[#083190]" />
                        </div>
                        <div>
                          <div className="text-[14px] font-medium text-gray-800 group-hover:text-blue-700">
                            {tool.name}
                          </div>
                          <div className="text-[12px] text-gray-500">
                            {tool.desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Past Conversations / History */}
            <div className="w-full max-w-2xl">
              <h3 className="text-[15px] font-bold text-gray-800 mb-4 flex items-center">
                <History className="w-4 h-4 mr-2 text-gray-400" />
                项目过往对话
              </h3>

              <div className="space-y-3">
                <div className="bg-white border border-gray-100 rounded-lg p-4 flex items-start hover:shadow-sm transition-shadow cursor-pointer" onClick={() => handleSelectTool('AI Screening')}>
                  <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center mr-3 mt-0.5">
                    <Search className="w-4 h-4 text-[#083190]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-medium text-gray-800 mb-1">
                      受试者招募标准初筛分析
                    </div>
                    <div className="text-[12px] text-gray-500 line-clamp-1">
                      使用了 <span className="font-medium text-[#083190]">AI Screening</span> 分析了15份潜在受试者病历...
                    </div>
                  </div>
                  <div className="text-[12px] text-gray-400 shrink-0 ml-4">
                    6月3日
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-lg p-4 flex items-start hover:shadow-sm transition-shadow cursor-pointer" onClick={() => handleSelectTool('AI Monitoring')}>
                  <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center mr-3 mt-0.5">
                    <Activity className="w-4 h-4 text-[#083190]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-medium text-gray-800 mb-1">
                      第三期随访数据质量核查
                    </div>
                    <div className="text-[12px] text-gray-500 line-clamp-1">
                      使用了 <span className="font-medium text-[#083190]">AI Monitoring</span> 发现了3处方案偏离...
                    </div>
                  </div>
                  <div className="text-[12px] text-gray-400 shrink-0 ml-4">
                    6月2日
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-lg p-4 flex items-start hover:shadow-sm transition-shadow cursor-pointer" onClick={() => handleSelectTool('医研千问')}>
                  <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center mr-3 mt-0.5">
                    <Cpu className="w-4 h-4 text-[#083190]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-medium text-gray-800 mb-1">
                      关于严重不良事件报告时限法规查询
                    </div>
                    <div className="text-[12px] text-gray-500 line-clamp-1">
                      使用了 <span className="font-medium text-[#083190]">医研千问</span> 总结了2025版GCP的相关要求...
                    </div>
                  </div>
                  <div className="text-[12px] text-gray-400 shrink-0 ml-4">
                    5月28日
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Project Documents Modal */}
      {showDocs && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                 <div>
                   <h3 className="text-lg font-bold text-gray-800">项目文档</h3>
                 </div>
                 <button onClick={() => setShowDocs(false)} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 overflow-y-auto bg-gray-50/50 flex-1">
                 {/* Upload Button */}
                 <div className="mb-8">
                   <h4 className="text-[13px] font-bold text-gray-700 mb-3">项目知识</h4>
                   <div className="flex gap-4 flex-wrap">
                      <button className="flex flex-col items-center justify-center w-32 h-32 bg-white border border-gray-200 border-dashed rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-500 hover:text-[#083190] shadow-sm">
                         <Plus className="w-6 h-6 mb-2" />
                         <span className="text-[13px] font-medium">添加知识</span>
                      </button>
                      
                      <div className="flex flex-col items-start justify-between w-32 h-32 bg-white border border-gray-100 rounded-xl p-3 shadow-sm group">
                         <div className="w-8 h-8 bg-red-50 text-red-500 rounded flex items-center justify-center"><FileText className="w-4 h-4" /></div>
                         <div className="text-[12px] font-medium text-gray-800 line-clamp-2 mt-2" title="冠心宁01002(OCR).pdf">冠心宁01002(OCR).pdf</div>
                         <div className="text-[10px] text-gray-400 mt-1 w-full flex justify-between"><span>PDF</span><span>241KB</span></div>
                      </div>
                      
                      <div className="flex flex-col items-start justify-between w-32 h-32 bg-white border border-gray-100 rounded-xl p-3 shadow-sm group">
                         <div className="w-8 h-8 bg-green-50 text-green-600 rounded flex items-center justify-center"><FileText className="w-4 h-4" /></div>
                         <div className="text-[12px] font-medium text-gray-800 line-clamp-2 mt-2" title="E-CRF-11-01002.csv">E-CRF-11-01002.csv</div>
                         <div className="text-[10px] text-gray-400 mt-1 w-full flex justify-between"><span>CSV</span><span>1.2MB</span></div>
                      </div>
                   </div>
                 </div>
                 
                 <div>
                   <h4 className="text-[13px] font-bold text-gray-700 mb-3">AI 产物 (系统生成)</h4>
                   <div className="flex gap-4 flex-wrap">
                      <div className="flex flex-col items-start justify-between w-32 h-32 bg-blue-50/30 border border-blue-100 rounded-xl p-3 shadow-sm group relative overflow-hidden">
                         <div className="absolute top-0 right-0 bg-[#083190] text-white text-[9px] px-1.5 py-0.5 rounded-bl font-medium shadow-sm">AI 生成</div>
                         <div className="w-8 h-8 bg-blue-100 text-[#083190] rounded flex items-center justify-center"><FileText className="w-4 h-4" /></div>
                         <div className="text-[12px] font-medium text-gray-800 line-clamp-2 mt-2">方案偏离问题清单.xlsx</div>
                         <div className="text-[10px] text-[#083190] mt-1 font-medium">AI Monitoring</div>
                      </div>
                      <div className="flex flex-col items-start justify-between w-32 h-32 bg-blue-50/30 border border-blue-100 rounded-xl p-3 shadow-sm group relative overflow-hidden">
                         <div className="absolute top-0 right-0 bg-[#083190] text-white text-[9px] px-1.5 py-0.5 rounded-bl font-medium shadow-sm">AI 生成</div>
                         <div className="w-8 h-8 bg-blue-100 text-[#083190] rounded flex items-center justify-center"><FileText className="w-4 h-4" /></div>
                         <div className="text-[12px] font-medium text-gray-800 line-clamp-2 mt-2">受试者关键项提取结果.xlsx</div>
                         <div className="text-[10px] text-[#083190] mt-1 font-medium">AI Capture</div>
                      </div>
                   </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
