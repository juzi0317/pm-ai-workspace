import { ChevronRight, FileText } from 'lucide-react';

export default function AcademicLibrary() {
  const docs = [
    '药物临床试验数据递交指导原则(征求意见稿)',
    '数据管理的相关文件及记录清单',
    '新规亮点解读:《药物临床试验质量管理规范》2020年版',
    '药物临床试验安全评价-广东共识(2020)',
    '药物临床试验的一般考虑指导原则',
    '临床试验数据管理工作技术指南',
    '医疗器械临床试验设计指导原则(2018年第6号)',
    '药物临床试验数据管理与统计分析的计划和报告指导原则',
    '药物临床试验必备文件保存指导原则',
    '药物临床试验的电子数据采集技术指导原则'
  ];

  return (
    <div className="bg-white min-h-[calc(100vh-100px)] rounded-xl border border-gray-200 p-10 shadow-sm relative overflow-hidden">
      {/* Background decoration pattern */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-gray-50 to-white -z-10 pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-10 pb-4 border-b border-gray-100 mt-2">
        <div className="flex items-center">
           <div className="w-1 h-6 bg-red-600 rounded-sm mr-3"></div>
           <h1 className="text-[22px] font-bold text-gray-800 tracking-wide">
             热门文档
           </h1>
        </div>
        <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 hover:border-gray-300 transition-all text-gray-500 shadow-sm">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-12">
        {docs.map((d, i) => (
           <div key={i} className="group cursor-pointer flex flex-col justify-start">
              {/* Document Thumbnail Cover */}
              <div className="border border-gray-200 rounded-lg bg-gray-50 aspect-[1/1.3] mb-4 overflow-hidden p-3 md:p-4 shadow-sm group-hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] group-hover:-translate-y-1 group-hover:border-blue-300 transition-all duration-300 flex items-center justify-center relative">
                 
                 {/* Internal Page Mockup */}
                 <div className="w-full h-full bg-white shadow-md border border-gray-200 flex flex-col p-4 md:p-5 opacity-90 group-hover:opacity-100 transition-opacity relative z-10 overflow-hidden transform scale-95 origin-center group-hover:scale-100 duration-300">
                    <div className="w-2/3 h-1.5 bg-gray-300 rounded mx-auto mb-6"></div>
                    <div className="space-y-3 opacity-60">
                       <div className="w-full h-1 bg-gray-200 rounded"></div>
                       <div className="w-5/6 h-1 bg-gray-200 rounded"></div>
                       <div className="w-full h-1 bg-gray-200 rounded"></div>
                       <div className="w-4/5 h-1 bg-gray-200 rounded"></div>
                       <div className="w-full h-1 bg-gray-200 rounded"></div>
                       <div className="w-11/12 h-1 bg-gray-200 rounded"></div>
                       <div className="w-2/3 h-1 bg-gray-200 rounded"></div>
                    </div>
                    {/* Watermark stamp mock - only some have it or make it subtle */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                       <span className="text-[80px] font-serif text-black border-[5px] border-black rounded-full p-6 transform -rotate-45 block leading-none font-black tracking-widest uppercase">GCP</span>
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-[#083190]/0 group-hover:bg-[#083190]/5 transition-colors duration-300 pointer-events-none flex items-center justify-center">
                       <div className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 text-[#083190]">
                          <FileText className="w-5 h-5" />
                       </div>
                    </div>
                 </div>
              </div>
              
              {/* Document Title */}
              <h3 className="text-[14px] text-gray-700 text-center leading-relaxed font-medium group-hover:text-blue-700 transition-colors line-clamp-2 px-1">
                {d}
              </h3>
           </div>
        ))}
      </div>
    </div>
  );
}
