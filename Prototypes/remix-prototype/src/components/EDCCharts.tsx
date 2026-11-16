import { Mail, Volume2 } from 'lucide-react';

export default function EDCCharts() {
  const projects = [
    '心血管研究',
    'PCI 治疗的稳定型缺血性心脏病患者临床研究-LYT',
    '盐酸多奈哌齐片治疗阿尔茨海默病',
    '缺血性心脏病患者临床研究-LYT',
    '治疗原发性高血压的微孔灌注肾动脉消融导管',
    '阿普唑仑片治疗阿尔茨海默病',
    '圆心研究院测试',
    '研究院测试',
    '枸橼酸莫沙必利分散片（预试验）',
    '布洛芬',
    '舒宁替尼改善恶性肿瘤的随机、双盲、平行对照、多中心的临床研究',
    '产品测试',
    '【正式】一类生物新药胰岛素注射液单药及联合二甲双胍给药注册临床研究',
    '多次CART序贯移植研究',
  ];

  const messages = [
    { title: '【机构邀请】沈艳艳邀请您加入温州医科大学附属第一医院', time: '2026-05-12 17:15:47', icon: Mail },
    { title: '【任务分配】周会菊给你分配了一个新任务', time: '2026-05-06 15:03:52', icon: Mail },
    { title: '【待审批】由机构管理员提交的《立项》需要您审核', time: '2026-04-10 14:07:12', icon: Mail },
    { title: '【待审批】由机构管理员提交的《立项》需要您审核', time: '2026-04-10 12:48:54', icon: Mail },
    { title: '【任务分配】周会菊给你分配了一个新任务', time: '2026-03-18 14:09:11', icon: Mail },
  ];

  const shortcuts = [
    '新增审批>>', '预约访视>>', '培训记录>>', '机构文件夹>>',
    '帮助中心>>', 'FAQ>>', '问题反馈>>', '关于系统>>'
  ];

  return (
    <div className="max-w-[1600px] mx-auto z-10 relative font-sans space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          
          {/* User Card */}
          <div className="bg-white border border-gray-200 rounded-sm p-5 flex items-start justify-between shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Support&backgroundColor=ffd5dc" className="w-full h-full object-cover bg-rose-100" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-[13px] text-gray-800">
                  <span className="font-bold mr-2 text-[14px]">周会菊</span>
                  <span className="text-gray-500">机构办秘书、CRO-CRA</span>
                </div>
                <div className="text-[13px] text-gray-500">北京中医院</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[12px] text-gray-500 mb-1">项目数</div>
              <div className="text-[20px] font-bold text-gray-800 leading-none">15</div>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm flex flex-col h-[280px]">
             <div className="flex border-b border-gray-200 bg-gray-50/50">
               <button className="px-6 py-2.5 text-[14px] font-medium text-[#13316e] border-b-2 border-[#13316e] bg-white">站内信</button>
               <button className="px-6 py-2.5 text-[14px] font-medium text-gray-600 hover:text-gray-800">公告</button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-2 hide-scrollbar">
                {messages.map((m, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center overflow-hidden mr-4">
                      <m.icon className="w-[15px] h-[15px] text-amber-500 mr-2 shrink-0 group-hover:text-[#083190] transition-colors" strokeWidth={2} />
                      <span className="text-[13px] text-gray-700 truncate group-hover:text-[#083190] transition-colors">{m.title}</span>
                    </div>
                    <span className="text-[12px] text-gray-400 shrink-0 tabular-nums">{m.time}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* Project List */}
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm flex flex-col h-[500px]">
             <div className="flex items-center justify-between border-b border-gray-200 p-3 bg-gray-50/50">
               <span className="text-[14px] font-bold text-gray-800 pl-2">项目列表</span>
               <button className="text-[13px] text-[#13316e] hover:underline pr-2 font-medium">查看更多</button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-2.5 hide-scrollbar">
                {projects.map((p, i) => (
                  <div key={i} className="text-[13px] text-gray-700 hover:text-[#13316e] cursor-pointer truncate transition-colors">
                    {p}
                  </div>
                ))}
             </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-4">
          
          {/* Quick Links */}
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-4 min-h-[140px]">
             <div className="text-[14px] font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">快捷入口</div>
             <div className="grid grid-cols-4 gap-y-3 gap-x-2">
                {shortcuts.map(s => (
                  <button key={s} className="text-left text-[13px] text-[#13316e] hover:underline truncate transition-colors">
                    {s}
                  </button>
                ))}
             </div>
          </div>

          {/* Pending Expenses */}
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm flex flex-col h-[280px]">
             <div className="text-[14px] font-bold text-gray-800 p-3 border-b border-gray-200 bg-gray-50/50">待审核费用</div>
             <div className="flex-1 flex text-[13px] text-gray-400 p-4">
               暂无审核费用
             </div>
          </div>

          {/* Todo List */}
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm flex flex-col h-[500px]">
             <div className="text-[14px] font-bold text-gray-800 p-3 border-b border-gray-200 bg-gray-50/50">待办事项</div>
             <div className="flex-1 bg-white">
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
