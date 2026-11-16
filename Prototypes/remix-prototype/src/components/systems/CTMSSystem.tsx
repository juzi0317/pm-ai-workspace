import { useState } from 'react';
import TopNavigation from '../TopNavigation';
import { 
  MonitorPlay, Users, FolderKanban, CheckSquare, Users2, DatabaseZap, 
  ShieldAlert, Activity, BarChart3, FolderSync, Share2, 
  FlaskConical, Handshake, Box, Map, ListTodo, Wallet, CalendarRange, FileText, Settings
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const dataPlanned = [
  { name: '东莞市妇幼保健院', value: 400, color: '#dc2626' }
];

export default function CTMSSystem({ userRole }: { userRole?: 'sponsor' | 'site' | null }) {
  const [activeMenu, setActiveMenu] = useState('我的任务');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menus = [
    { title: '项目仪表盘', icon: MonitorPlay },
    { title: '项目与组织', icon: FolderKanban },
    { title: '团队成员', icon: Users },
    { title: '审批管理', icon: CheckSquare, hasSub: true },
    { title: '我的任务', icon: ListTodo, hasSub: true },
    { title: '项目任务', icon: FolderKanban, hasSub: true },
    { title: '预算管理', icon: Wallet, hasSub: true },
    { title: '项目财务', icon: DatabaseZap, hasSub: true },
    { title: '周月报统计', icon: CalendarRange, hasSub: true },
    { title: 'PD在线汇报', icon: ShieldAlert, hasSub: true },
    { title: '访视报告', icon: FileText, hasSub: true },
    { title: '机构质控', icon: Activity, hasSub: true },
    { title: '统计图表', icon: BarChart3, hasSub: true },
    { title: '审批配置', icon: Settings, hasSub: true },
    { title: '库存管理', icon: Box, hasSub: true },
    { title: '供应商管理', icon: Handshake, hasSub: true },
    { title: '研究文件夹', icon: FolderSync, hasSub: true },
    { title: '项目授权', icon: Handshake, hasSub: true },
  ];

  const userName = userRole === 'sponsor' ? '演示厂家' : userRole === 'site' ? '演示中心' : '周会菊';
  const avatarChar = userName.charAt(0);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <TopNavigation 
        userRole={userRole} 
        activeSystem="CTMS" 
        onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        isCollapsed={isCollapsed}
      />
      
      {/* Environment Banner */}
      <div className="flex bg-amber-50 py-1.5 px-4 text-xs justify-center font-medium text-amber-800 border-b border-amber-200">
        测试环境
      </div>
      
      <div className="flex h-full flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className={`relative shrink-0 overflow-visible border-r border-gray-100 bg-white shadow-[1px_0_4px_rgba(0,0,0,0.01)] flex flex-col transition-all duration-300 ${isCollapsed ? 'w-0' : 'w-56'}`}>
          <div className={`h-full flex flex-col overflow-y-auto hide-scrollbar whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
            <div className="flex px-4 py-4 border-b border-gray-100 bg-amber-50/30 items-center justify-between shrink-0">
               <div className="flex items-center">
                 <div className="h-10 w-10 rounded-full overflow-hidden mr-3 bg-white shadow-sm border border-gray-200 shrink-0">
                    <div className="w-full h-full rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
                      <div className="text-xl font-bold text-orange-600">{avatarChar}</div>
                    </div>
                 </div>
                 <div>
                   <div className="text-[13px] font-bold text-gray-800">{userName}</div>
                   <div className="text-[11px] text-gray-500 mt-0.5 leading-tight">DM</div>
                 </div>
               </div>
            </div>
            
            <div className="py-2 flex-1">
               {menus.map(m => {
                  const isActive = activeMenu === m.title;
                  return (
                    <button
                      key={m.title}
                      onClick={() => setActiveMenu(m.title)}
                      className={`group flex w-full items-center px-5 py-3 text-[13px] font-medium transition-colors ${
                        isActive 
                          ? 'bg-[#083190] text-white border-l-4 border-l-[#3b82f6]' 
                          : 'text-gray-700 hover:bg-blue-50/50 hover:text-[#083190] border-l-4 border-l-transparent'
                      }`}
                    >
                      <m.icon className={`mr-3 h-[18px] w-[18px] ${isActive ? 'text-blue-200' : 'text-gray-400 group-hover:text-[#083190]'}`} strokeWidth={isActive ? 2 : 1.5} />
                      <span className="flex-1 text-left tracking-wide">{m.title}</span>
                      {m.hasSub && (
                        <span className={`text-[10px] ${isActive ? 'text-blue-300' : 'text-gray-300 group-hover:text-blue-300'}`}>&gt;</span>
                      )}
                    </button>
                  );
               })}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
           {/* Secondary Tabs */}
           <div className="border-b border-gray-100 px-6 flex items-end pt-5 space-x-8 bg-white z-10 relative shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
              <button className="border-b-[3px] border-[#083190] pb-3 text-[#083190] font-semibold flex items-center space-x-1.5 text-sm">
                <Activity className="h-[15px] w-[15px]" strokeWidth={2.5} />
                <span>受试者概况</span>
              </button>
              <button className="pb-3 text-gray-500 hover:text-gray-800 font-medium flex items-center space-x-1.5 text-sm transition-colors border-b-[3px] border-transparent">
                <BarChart3 className="h-[15px] w-[15px]" strokeWidth={2} />
                <span>研究进度</span>
              </button>
              <button className="pb-3 text-gray-500 hover:text-gray-800 font-medium flex items-center space-x-1.5 text-sm transition-colors border-b-[3px] border-transparent">
                <FolderSync className="h-[15px] w-[15px]" strokeWidth={2} />
                <span>疑问统计</span>
              </button>
              <button className="pb-3 text-gray-500 hover:text-gray-800 font-medium flex items-center space-x-1.5 text-sm transition-colors border-b-[3px] border-transparent">
                <CheckSquare className="h-[15px] w-[15px]" strokeWidth={2} />
                <span>SDV操作</span>
              </button>
              <button className="pb-3 text-gray-500 hover:text-gray-800 font-medium flex items-center space-x-1.5 text-sm transition-colors border-b-[3px] border-transparent">
                <ShieldAlert className="h-[15px] w-[15px]" strokeWidth={2} />
                <span>ISSUES</span>
              </button>
           </div>
           
           {/* Scrollable Content */}
           <div className="flex-1 overflow-y-auto p-8 relative">
              <div className="space-y-16 pb-20 max-w-[1200px] mx-auto z-10 relative">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-full h-[400px]">
                    <h3 className="text-center font-bold text-gray-800 mb-6 text-lg tracking-wide">各中心计划病例数构成</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dataPlanned}
                          cx="50%"
                          cy="50%"
                          labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                          label={({ name }) => `${name}`}
                          outerRadius={150}
                          innerRadius={0}
                          dataKey="value"
                          className="text-[13px] font-medium fill-gray-600 focus:outline-none"
                        >
                          {dataPlanned.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="w-full h-[400px]">
                    <h3 className="text-center font-bold text-gray-800 mb-6 text-lg tracking-wide">各中心入组构成</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dataPlanned}
                          cx="50%"
                          cy="50%"
                          labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                          label={({ name }) => `${name}`}
                          outerRadius={150}
                          innerRadius={0}
                          dataKey="value"
                          className="text-[13px] font-medium fill-gray-600 focus:outline-none"
                        >
                          {dataPlanned.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
           </div>

           {/* Watermark Matrix */}
           <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.02] flex flex-wrap justify-center items-center">
              {Array.from({length: 80}).map((_, i) => (
                <div key={i} className="text-xl font-bold transform -rotate-[25deg] text-gray-900 m-8 whitespace-nowrap select-none">
                  周会菊3186
                </div>
              ))}
           </div>
           
           {/* Right Side Fixed Tools */}
           <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col space-y-px z-20">
              <button className="bg-[#083190] text-white p-2.5 rounded-l-md shadow-lg hover:bg-blue-800 transition-colors flex flex-col items-center justify-center space-y-1">
                 <div className="font-bold text-xs">临</div>
                 <div className="text-[10px] leading-tight text-blue-100">AI<br/>助手</div>
              </button>
              <button className="bg-[#083190] text-white p-2.5 rounded-l-md shadow-lg hover:bg-blue-800 transition-colors flex flex-col items-center justify-center mt-1">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Support&backgroundColor=transparent" className="h-6 w-6 mb-1 filter drop-shadow-sm brightness-110" alt="客服" />
                 <div className="text-[10px] leading-tight text-blue-100">咨询<br/>客服</div>
              </button>
           </div>
        </main>
      </div>
    </div>
  );
}
