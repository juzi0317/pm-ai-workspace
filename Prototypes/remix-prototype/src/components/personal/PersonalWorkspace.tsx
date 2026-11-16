import { 
  Database, LayoutGrid, Building2, Stethoscope,
  FolderKanban, CheckSquare, Users2, Activity, DatabaseZap,
  ListTodo, Wallet, FileText, BarChart3,
  Calendar, Eye, Box, Heart, ClipboardCheck, Activity as ActivityIcon, Ruler,
  Mail, ChevronRight
} from 'lucide-react';
import { useState } from 'react';

export default function PersonalWorkspace() {
  const [activeTab, setActiveTab] = useState<'messages' | 'announcements'>('messages');

  const messages = [
    { title: '【机构邀请】沈艳艳邀请您加入温州医科大学附属第一医院', date: '2026-05-12 17:15:47', unread: true },
    { title: '【任务分配】周会菊给你分配了一个新任务', date: '2026-05-06 15:03:52', unread: false },
    { title: '【待审批】由机构管理员提交的《立项》需要您审核', date: '2026-04-10 14:07:12', unread: false },
    { title: '【待审批】由机构管理员提交的《立项》需要您审核', date: '2026-04-10 12:48:54', unread: false },
    { title: '【任务分配】周会菊给你分配了一个新任务', date: '2026-03-18 14:09:11', unread: false },
  ];

  const projects = [
    '心血管研究',
    'PCI 治疗的稳定型缺血性心脏病患者临床研究-LYT',
    '盐酸多奈哌齐片治疗阿尔茨海默病',
    '缺血性心脏病患者临床研究-LYT',
    '治疗原发性高血压的微孔灌注肾动脉消融导管',
    '阿昔匹林片治疗阿尔茨海默病',
    '圆心研究院测试',
    '研究院测试',
    '枸橼酸莫沙必利分散片（预试验）',
    '布洛芬',
    '舒宁替尼改善恶性肿瘤的随机、双盲、平行对照、多中心的临床研究',
    '产品测试',
    '【正式】一类生物新药胰岛素注射液单药及联合二甲双胍给药注册临床研究',
    '多次CART序贯移植研究',
    'NO治疗后桥接二次/三次移植的疗效分析'
  ];

  const quickLinks = [
    { name: '新增审批>>', link: '#' },
    { name: '预约访视>>', link: '#' },
    { name: '培训记录>>', link: '#' },
    { name: '机构文件夹>>', link: '#' },
    { name: '帮助中心>>', link: '#' },
    { name: 'FAQ>>', link: '#' },
    { name: '问题反馈>>', link: '#' },
    { name: '关于系统>>', link: '#' },
  ];

  const edcItems = [
    { name: '项目与组织', icon: FolderKanban, color: 'text-[#083190]', bg: 'bg-blue-50' },
    { name: '审批管理', icon: CheckSquare, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { name: '受试者管理', icon: Users2, color: 'text-[#083190]', bg: 'bg-blue-50' },
    { name: 'SDV管理', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { name: '数据管理', icon: DatabaseZap, color: 'text-[#083190]', bg: 'bg-blue-50' },
  ];

  const ctmsItems = [
    { name: '我的任务', icon: ListTodo, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { name: '预算管理', icon: Wallet, color: 'text-[#083190]', bg: 'bg-blue-50' },
    { name: '项目财务', icon: DatabaseZap, color: 'text-[#083190]', bg: 'bg-blue-50' },
    { name: '访视报告', icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { name: '统计图表', icon: BarChart3, color: 'text-[#083190]', bg: 'bg-blue-50' },
  ];

  const orgItems = [
    { name: '机构任务', icon: ListTodo, color: 'text-[#083190]', bg: 'bg-blue-50' },
    { name: '机构财务', icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { name: '远程监查', icon: Eye, color: 'text-[#083190]', bg: 'bg-blue-50' },
    { name: '预约访视', icon: Calendar, color: 'text-[#083190]', bg: 'bg-blue-50' },
    { name: '物资管理', icon: Box, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  const diseaseItems = [
    { name: '患者管理', icon: Heart, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { name: '随访计划', icon: Calendar, color: 'text-[#083190]', bg: 'bg-blue-50' },
    { name: '自测问卷', icon: ClipboardCheck, color: 'text-[#083190]', bg: 'bg-blue-50' },
    { name: '体征监测', icon: ActivityIcon, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { name: '量表管理', icon: Ruler, color: 'text-[#083190]', bg: 'bg-blue-50' },
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-20 space-y-6">
      
      {/* --- Personal Dashboard Section --- */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column (User, Messages, Projects) */}
        <div className="col-span-7 space-y-6">
          {/* Messages & Announcements */}
          <div className="bg-white rounded border border-gray-200 shadow-sm flex flex-col h-[280px]">
             <div className="flex border-b border-gray-100 px-2 pt-2">
                <button 
                  onClick={() => setActiveTab('messages')}
                  className={`px-6 py-3 text-[14px] font-medium border-b-2 transition-colors ${activeTab === 'messages' ? 'border-[#13316e] text-[#13316e]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                >
                  站内信
                </button>
                <button 
                  onClick={() => setActiveTab('announcements')}
                  className={`px-6 py-3 text-[14px] font-medium border-b-2 transition-colors ${activeTab === 'announcements' ? 'border-[#13316e] text-[#13316e]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                >
                  公告
                </button>
             </div>
             <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'messages' ? (
                  <div className="space-y-4">
                    {messages.map((msg, idx) => (
                      <div key={idx} className="flex justify-between items-center group cursor-pointer">
                        <div className="flex items-center space-x-2 truncate">
                          <Mail className={`w-4 h-4 shrink-0 ${msg.unread ? 'text-amber-500' : 'text-gray-400'}`} />
                          <span className={`text-[13px] truncate ${msg.unread ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>{msg.title}</span>
                        </div>
                        <span className="text-[12px] text-gray-400 shrink-0 ml-4 group-hover:text-[#13316e]">{msg.date}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">暂无公告</div>
                )}
             </div>
          </div>

          {/* Project List */}
          <div className="bg-white rounded border border-gray-200 shadow-sm flex flex-col h-[400px]">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
               <span className="text-[15px] font-bold text-gray-800">项目列表</span>
               <button className="text-[13px] text-[#13316e] hover:underline">查看更多</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 py-2">
              <div className="space-y-3">
                {projects.map((proj, idx) => (
                  <div key={idx} className="text-[13px] text-gray-700 hover:text-[#13316e] cursor-pointer truncate">
                    {proj}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Quick Links, Expenses, To-dos) */}
        <div className="col-span-5 space-y-6">
          {/* Quick Links */}
          <div className="bg-white rounded border border-gray-200 shadow-sm flex flex-col h-[200px]">
            <div className="p-4 border-b border-gray-100 font-bold text-gray-800 text-[15px]">快捷入口</div>
            <div className="flex-1 p-4">
               <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                 {quickLinks.map((link, idx) => (
                   <a key={idx} href={link.link} className="text-[13px] text-[#13316e] hover:underline flex items-center">
                     {link.name}
                   </a>
                 ))}
               </div>
            </div>
          </div>

          {/* Pending Expenses */}
          <div className="bg-white rounded border border-gray-200 shadow-sm flex flex-col h-[200px]">
            <div className="p-4 border-b border-gray-100 font-bold text-gray-800 text-[15px]">待审核费用</div>
            <div className="flex-1 p-4 text-[13px] text-gray-600">
               暂无审核费用
            </div>
          </div>

          {/* To-Do List */}
          <div className="bg-white rounded border border-gray-200 shadow-sm flex flex-col h-[384px]">
            <div className="p-4 border-b border-gray-100 font-bold text-gray-800 text-[15px]">待办事项</div>
            <div className="flex-1 flex items-center justify-center p-4">
                <span className="text-[13px] text-gray-400">暂无待办事项</span>
            </div>
          </div>
        </div>
        
      </div>


      {/* --- App Module Grids Section --- */}
      <div className="grid grid-cols-12 gap-6 mt-8 border-t border-gray-200 pt-8">
         {/* EDC Section */}
         <div className="col-span-6 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
             <div className="flex items-center text-[16px] font-bold text-gray-800 mb-8 border-b border-gray-50 pb-4">
                <Database className="w-5 h-5 mr-2 text-[#13316e]" /> 
                EDC 常用模块
             </div>
             <div className="grid grid-cols-5 gap-y-10 gap-x-4">
                {edcItems.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center cursor-pointer group">
                     <div className={`w-14 h-14 ${item.bg} rounded-full flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200 shadow-sm border border-black/5`}>
                        <item.icon className={`w-6 h-6 ${item.color} stroke-[1.5px]`} />
                     </div>
                     <span className="text-[13px] text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                       {item.name}
                     </span>
                  </div>
                ))}
             </div>
         </div>

         {/* CTMS Section */}
         <div className="col-span-6 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
             <div className="flex items-center text-[16px] font-bold text-gray-800 mb-8 border-b border-gray-50 pb-4">
                <LayoutGrid className="w-5 h-5 mr-2 text-[#13316e]" /> 
                CTMS 常用模块
             </div>
             <div className="grid grid-cols-5 gap-y-10 gap-x-4">
                {ctmsItems.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center cursor-pointer group">
                     <div className={`w-14 h-14 ${item.bg} rounded-full flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200 shadow-sm border border-black/5`}>
                        <item.icon className={`w-6 h-6 ${item.color} stroke-[1.5px]`} />
                     </div>
                     <span className="text-[13px] text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                       {item.name}
                     </span>
                  </div>
                ))}
             </div>
         </div>
      </div>

      <div className="grid grid-cols-12 gap-6 pb-8">
         {/* ORG Section */}
         <div className="col-span-6 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
             <div className="flex items-center text-[16px] font-bold text-gray-800 mb-8 border-b border-gray-50 pb-4">
                <Building2 className="w-5 h-5 mr-2 text-[#13316e]" /> 
                机构管理 常用模块
             </div>
             <div className="grid grid-cols-5 gap-y-10 gap-x-4">
                {orgItems.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center cursor-pointer group">
                     <div className={`w-14 h-14 ${item.bg} rounded-full flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200 shadow-sm border border-black/5`}>
                        <item.icon className={`w-6 h-6 ${item.color} stroke-[1.5px]`} />
                     </div>
                     <span className="text-[13px] text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                       {item.name}
                     </span>
                  </div>
                ))}
             </div>
         </div>

         {/* Disease Section */}
         <div className="col-span-6 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
             <div className="flex items-center text-[16px] font-bold text-gray-800 mb-8 border-b border-gray-50 pb-4">
                <Stethoscope className="w-5 h-5 mr-2 text-[#13316e]" /> 
                专病管理 常用模块
             </div>
             <div className="grid grid-cols-5 gap-y-10 gap-x-4">
                {diseaseItems.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center cursor-pointer group">
                     <div className={`w-14 h-14 ${item.bg} rounded-full flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200 shadow-sm border border-black/5`}>
                        <item.icon className={`w-6 h-6 ${item.color} stroke-[1.5px]`} />
                     </div>
                     <span className="text-[13px] text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                       {item.name}
                     </span>
                  </div>
                ))}
             </div>
         </div>
      </div>
    </div>
  );
}
