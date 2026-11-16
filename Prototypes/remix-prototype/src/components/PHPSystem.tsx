import { useState } from 'react';
import TopNavigation from './TopNavigation';
import { 
  MonitorPlay, Users, FolderKanban, CheckSquare, Users2, DatabaseZap, 
  ShieldAlert, Activity, BarChart3, FolderSync, Share2, 
  FlaskConical, Handshake, Box, ChevronLeft, ChevronRight
} from 'lucide-react';
import EDCCharts from './EDCCharts';
import PersonalWorkspace from './personal/PersonalWorkspace';

export default function PHPSystem({ systemName, userRole, showWorkbench = false }: { systemName: string, userRole?: 'sponsor' | 'site' | null, showWorkbench?: boolean }) {
  const [activeMenu, setActiveMenu] = useState('项目仪表盘');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menus = [
    { title: '项目仪表盘', icon: MonitorPlay },
    { title: '项目与组织', icon: FolderKanban },
    { title: '团队成员', icon: Users },
    { title: '审批管理', icon: CheckSquare, hasSub: true },
    { title: '受试者管理', icon: Users2, hasSub: true },
    { title: '二次数据录入', icon: DatabaseZap, hasSub: true },
    { title: '安全性管理', icon: ShieldAlert, hasSub: true },
    { title: 'SDV管理', icon: Activity, hasSub: true },
    { title: '录入&SDV情况统计', icon: BarChart3, hasSub: true },
    { title: '数据疑问', icon: FolderSync, hasSub: true },
    { title: '研究者文件夹', icon: FolderKanban },
    { title: '项目库存', icon: Box, hasSub: true },
    { title: '数据导出', icon: Share2 },
    { title: '数据库设计', icon: DatabaseZap, hasSub: true },
    { title: '实验室管理', icon: FlaskConical, hasSub: true },
    { title: '数据管理', icon: DatabaseZap, hasSub: true },
    { title: '审批配置', icon: CheckSquare, hasSub: true },
    { title: '项目授权', icon: Handshake, hasSub: true },
  ];

  const userName = userRole === 'sponsor' ? '演示厂家' : userRole === 'site' ? '演示中心' : '韩俊阳';
  const avatarChar = userName.charAt(0);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <TopNavigation 
        userRole={userRole} 
        activeSystem={systemName === 'EDC' ? 'EDC' : systemName} 
        onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        isCollapsed={isCollapsed}
      />
      
      {/* Environment Banner */}
      <div className="flex bg-amber-50 py-1.5 px-4 text-xs justify-center font-medium text-amber-800 border-b border-amber-200">
        正式环境
      </div>
      
      <div className="flex h-full flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className={`relative shrink-0 overflow-visible border-r border-gray-200 bg-white shadow-[1px_0_4px_rgba(0,0,0,0.02)] flex flex-col transition-all duration-300 ${isCollapsed ? 'w-0' : 'w-56'}`}>
          
          <div className={`h-full flex flex-col overflow-y-auto hide-scrollbar whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
            <div className="flex px-4 py-4 border-b border-gray-100 bg-amber-50/30 items-center justify-between shrink-0">
               <div className="flex items-center">
                 <div className="h-10 w-10 rounded-full overflow-hidden mr-3 bg-white shadow-sm border border-gray-200 shrink-0">
                    <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                      <div className="text-xl font-bold text-[#083190]">{avatarChar}</div>
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
                    onClick={() => {
                      setActiveMenu(m.title);
                      if (showWorkbench) {
                         window.location.hash = '#/edc';
                      }
                    }}
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
           {showWorkbench ? (
             <div className="flex-1 overflow-y-auto bg-[#f4f6f8] pt-6 p-8">
               <PersonalWorkspace />
             </div>
           ) : (
             <>
               {/* Secondary Tabs */}
               <div className={`border-b border-gray-200 px-6 flex items-end pt-5 space-x-8 bg-white z-10 relative shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${activeMenu === '项目仪表盘' ? 'hidden' : ''}`}>
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
               <div className={`flex-1 overflow-y-auto relative ${activeMenu === '项目仪表盘' ? 'bg-[#f4f6f8] p-4' : 'bg-white p-8'}`}>
                 <EDCCharts />
               </div>

               {/* Watermark Matrix */}
               <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.02] flex flex-wrap justify-center items-center">
                  {Array.from({length: 80}).map((_, i) => (
                    <div key={i} className="text-xl font-bold transform -rotate-[25deg] text-gray-900 m-8 whitespace-nowrap select-none">
                      韩俊阳7114
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
             </>
           )}
        </main>
      </div>
    </div>
  );
}
