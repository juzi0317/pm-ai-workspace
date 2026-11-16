import React, { useState, useEffect } from 'react';
import { FileText, Search, ShieldCheck, FileKey } from 'lucide-react';

export default function CreateProject({ 
  setActiveMenu, 
  onCreateProject 
}: { 
  setActiveMenu?: (menu: string) => void;
  onCreateProject?: (projectName: string, toolName: string) => void;
}) {
  const [projectName, setProjectName] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  
  const fullPlaceholder = "请输入项目名称/项目号,例如：阿普唑仑片...";

  useEffect(() => {
    let currentText = '';
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < fullPlaceholder.length) {
        currentText += fullPlaceholder[index];
        setPlaceholder(currentText);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 150);
    
    return () => clearInterval(interval);
  }, []);

  const handleToolClick = (toolName: string) => {
    if (projectName.trim()) {
      if (onCreateProject) {
        onCreateProject(projectName.trim(), toolName);
      } else if (setActiveMenu) {
        setActiveMenu(toolName);
      }
    }
  };

  return (
    <div className="flex bg-white h-full min-h-[calc(100vh-100px)] rounded-xl border border-gray-200 overflow-hidden shadow-sm font-sans relative flex-col">
       <div className="flex-1 flex flex-col pt-24 max-w-3xl mx-auto w-full px-8">
         <div className="flex items-center text-gray-800 mb-8">
           <FileText className="w-5 h-5 mr-2" />
           <span className="text-[15px] font-bold">新建项目</span>
         </div>
         
         <div className="mb-12 border-l-2 border-[#083190] pl-4 py-1 h-12 flex items-center">
           <input 
             type="text" 
             value={projectName}
             onChange={(e) => setProjectName(e.target.value)}
             placeholder={placeholder}
             className="text-3xl font-medium text-gray-800 bg-transparent border-none outline-none w-full placeholder:text-gray-300"
           />
         </div>

         <div className="mb-4">
           <h2 className="text-[15px] font-bold text-gray-800">AI 的工具</h2>
         </div>

         <div className="grid grid-cols-3 gap-4">
           <div 
             onClick={() => handleToolClick('AI Screening')}
             className={`rounded-xl p-5 border transition-colors group ${projectName.trim() ? 'bg-gray-50 border-gray-200 hover:border-gray-400 cursor-pointer' : 'bg-gray-50/50 border-gray-100 opacity-60 cursor-not-allowed'}`}
           >
             <Search className="w-6 h-6 text-gray-800 mb-3" />
             <h3 className="font-medium text-gray-800 mb-2">AI Screening</h3>
             <p className="text-xs text-gray-600 leading-relaxed">智能解析入排标准，筛查患者病历并输出匹配报告。</p>
           </div>
           
           <div 
             onClick={() => handleToolClick('AI Monitoring')}
             className={`rounded-xl p-5 border transition-colors group ${projectName.trim() ? 'bg-gray-50 border-gray-200 hover:border-gray-400 cursor-pointer' : 'bg-gray-50/50 border-gray-100 opacity-60 cursor-not-allowed'}`}
           >
             <ShieldCheck className="w-6 h-6 text-gray-800 mb-3" />
             <h3 className="font-medium text-gray-800 mb-2">AI Monitoring</h3>
             <p className="text-xs text-gray-600 leading-relaxed">自动核查临床数据，识别方案偏离并生成核查报告。</p>
           </div>

           <div 
             onClick={() => handleToolClick('AI Capture')}
             className={`rounded-xl p-5 border transition-colors group ${projectName.trim() ? 'bg-gray-50 border-gray-200 hover:border-gray-400 cursor-pointer' : 'bg-gray-50/50 border-gray-100 opacity-60 cursor-not-allowed'}`}
           >
             <FileKey className="w-6 h-6 text-gray-800 mb-3" />
             <h3 className="font-medium text-gray-800 mb-2">AI Capture</h3>
             <p className="text-xs text-gray-600 leading-relaxed">智能化文档录入，自动提取关键要素并结构化存储。</p>
           </div>
         </div>
       </div>
    </div>
  );
}
