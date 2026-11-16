import { useState } from 'react';
import TopNavigation from '../TopNavigation';
import { 
  MonitorPlay, List, Users, CheckSquare, Send, Users2, ListTodo, Wallet, 
  Box, ShieldAlert, Activity, Settings, Eye, Calendar, BookOpen, FolderSync, Handshake, BarChart3
} from 'lucide-react';

export default function OrgSystem({ userRole }: { userRole?: 'sponsor' | 'site' | null }) {
  const [activeMenu, setActiveMenu] = useState('项目列表');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menus = [
    { title: '机构仪表盘', icon: MonitorPlay },
    { title: '项目列表', icon: List },
    { title: '机构成员', icon: Users },
    { title: '审批管理', icon: CheckSquare, hasSub: true },
    { title: '申请递交', icon: Send, hasSub: true },
    { title: '受试者列表', icon: Users2 },
    { title: '机构任务', icon: ListTodo, hasSub: true },
    { title: '机构财务', icon: Wallet, hasSub: true },
    { title: '研究产品管理', icon: Box, hasSub: true },
    { title: '安全性管理', icon: ShieldAlert, hasSub: true },
    { title: 'PD在线汇报', icon: ShieldAlert, hasSub: true },
    { title: '质控管理', icon: Activity, hasSub: true },
    { title: '远程监查', icon: Eye },
    { title: '预约访视', icon: Calendar, hasSub: true },
    { title: '物资管理', icon: Box, hasSub: true },
    { title: '培训管理', icon: BookOpen, hasSub: true },
    { title: '文件夹', icon: FolderSync },
    { title: '授权管理', icon: Handshake, hasSub: true },
  ];

  const tableData = [
    { id: 1, name: '【正式】一类生物新药胰岛素注射液单药及联合二甲双胍给药注册临床研究', sample: 100, s1: '2025-04-17', s2: '2025-04-17', s3: '', s4: '', s5: '', s6: '', s7: '', s8: '', s9: '', s10: '', s11: '', s12: '' },
    { id: 2, name: '阿昔喹仑片治疗阿尔兹海默病', sample: 20, s1: '2022-01-07', s2: '2022-01-07', s3: '', s4: '', s5: '', s6: '', s7: '', s8: '', s9: '', s10: '', s11: '', s12: '' },
    { id: 3, name: '治疗原发性高血压的微孔灌注肾动脉消融导管', sample: 20, s1: '2022-01-07', s2: '2022-02-20', s3: '', s4: '', s5: '', s6: '', s7: '', s8: '', s9: '2021-12-16', s10: '', s11: '', s12: '' },
    { id: 4, name: '缺血性心脏病患者临床研究-LYT', sample: 20, s1: '2022-01-07', s2: '2022-01-07', s3: '2022-01-07', s4: '2022-01-10', s5: '', s6: '', s7: '', s8: '', s9: '', s10: '', s11: '', s12: '' },
    { id: 5, name: '心血管研究', sample: 30, s1: '2022-11-02', s2: '2026-04-08', s3: '2019-08-18', s4: '2019-08-30', s5: '2019-09-18', s6: '2019-10-16', s7: '2020-04-16', s8: '2020-06-30', s9: '2020-10-10', s10: '2021-01-22', s11: '2026-04-02', s12: '2026-04-09' },
  ];

  const DateCell = ({ date }: { date: string }) => {
     if (!date) return <td className="px-3 py-3 text-center border-b border-r border-[#e5e7eb] text-gray-400 text-xs shrink-0 whitespace-nowrap min-w-[100px]">(未设置)</td>;
     return (
       <td className="px-3 py-3 text-center border-b border-r border-[#e5e7eb] text-xs shrink-0 whitespace-nowrap min-w-[100px]">
          <span className="bg-[#10b981] text-white px-2 py-0.5 rounded-sm shadow-sm">{date}</span>
       </td>
     );
  };

  const userName = userRole === 'sponsor' ? '演示厂家' : userRole === 'site' ? '演示中心' : '周会菊';
  const avatarChar = userName.charAt(0);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <TopNavigation 
        userRole={userRole} 
        activeSystem="机构管理" 
        onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        isCollapsed={isCollapsed}
      />
      
      <div className="flex h-full flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className={`relative shrink-0 overflow-visible border-r border-gray-100 bg-white shadow-[1px_0_4px_rgba(0,0,0,0.01)] flex flex-col transition-all duration-300 ${isCollapsed ? 'w-0' : 'w-56'}`}>
          <div className={`h-full flex flex-col overflow-y-auto hide-scrollbar whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
            <div className="flex px-4 py-4 border-b border-gray-100 bg-amber-50/30 items-center">
               <div className="h-10 w-10 rounded-full overflow-hidden mr-3 bg-white shadow-sm border border-gray-200 shrink-0">
                  <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                    <div className="text-xl font-bold text-[#083190]">{avatarChar}</div>
                  </div>
               </div>
               <div>
                 <div className="text-[13px] font-bold text-gray-800">{userName}</div>
                 <div className="text-[11px] text-gray-500 mt-0.5 leading-tight">机构办秘书<br/>CRO-CRA</div>
               </div>
            </div>
            
            <div className="py-2 flex-1">
               {menus.map(m => {
                  const isActive = activeMenu === m.title;
                  return (
                    <button
                      key={m.title}
                      onClick={() => setActiveMenu(m.title)}
                      className={`group flex w-full items-center px-5 py-2.5 text-[13px] font-medium transition-colors ${
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
        <main className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
           {/* Secondary Tabs */}
           <div className="border-b border-gray-100 px-6 flex items-end pt-5 space-x-8 bg-white z-10 relative shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
              <button className="border-b-[3px] border-[#083190] pb-3 text-[#083190] font-semibold flex items-center space-x-1.5 text-sm">
                <BarChart3 className="h-[15px] w-[15px]" strokeWidth={2.5} />
                <span>项目进度</span>
              </button>
              <button className="pb-3 text-gray-500 hover:text-gray-800 font-medium flex items-center space-x-1.5 text-sm transition-colors border-b-[3px] border-transparent">
                <Users className="h-[15px] w-[15px]" strokeWidth={2} />
                <span>入组进度</span>
              </button>
              <button className="pb-3 text-gray-500 hover:text-gray-800 font-medium flex items-center space-x-1.5 text-sm transition-colors border-b-[3px] border-transparent">
                <Activity className="h-[15px] w-[15px]" strokeWidth={2} />
                <span>SDV</span>
              </button>
              <button className="pb-3 text-gray-500 hover:text-gray-800 font-medium flex items-center space-x-1.5 text-sm transition-colors border-b-[3px] border-transparent">
                <ShieldAlert className="h-[15px] w-[15px]" strokeWidth={2} />
                <span>QUERY</span>
              </button>
              <button className="pb-3 text-gray-500 hover:text-gray-800 font-medium flex items-center space-x-1.5 text-sm transition-colors border-b-[3px] border-transparent">
                <Activity className="h-[15px] w-[15px]" strokeWidth={2} />
                <span>ISSUES</span>
              </button>
           </div>
           
           {/* Table Content */}
           <div className="flex-1 overflow-x-auto overflow-y-auto p-4 bg-white relative">
              <div className="min-w-fit pr-16 border border-[#e5e7eb] rounded-lg shadow-sm">
                <table className="w-full text-left text-sm whitespace-nowrap bg-white text-gray-800">
                  <thead className="bg-[#f9fafb] text-[13px] font-bold text-gray-700 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-3 py-3 border-r border-[#e5e7eb]">#</th>
                      <th className="px-4 py-3 border-r border-[#e5e7eb] min-w-[300px]">项目名称</th>
                      <th className="px-3 py-3 border-r border-[#e5e7eb]">计划样本量</th>
                      <th className="px-3 py-3 border-r border-[#e5e7eb] text-center min-w-[100px]">立项提交</th>
                      <th className="px-3 py-3 border-r border-[#e5e7eb] text-center min-w-[100px]">立项批准</th>
                      <th className="px-3 py-3 border-r border-[#e5e7eb] text-center min-w-[100px]">首次伦理递交</th>
                      <th className="px-3 py-3 border-r border-[#e5e7eb] text-center min-w-[100px]">首次伦理批准</th>
                      <th className="px-3 py-3 border-r border-[#e5e7eb] text-center min-w-[100px]">协议签署</th>
                      <th className="px-3 py-3 border-r border-[#e5e7eb] text-center min-w-[100px]">研究启动</th>
                      <th className="px-3 py-3 border-r border-[#e5e7eb] text-center min-w-[100px]">首例入组</th>
                      <th className="px-3 py-3 border-r border-[#e5e7eb] text-center min-w-[100px]">入组30%</th>
                      <th className="px-3 py-3 border-r border-[#e5e7eb] text-center min-w-[100px]">入组50%</th>
                      <th className="px-3 py-3 border-r border-[#e5e7eb] text-center min-w-[100px]">入组75%</th>
                      <th className="px-3 py-3 border-r border-[#e5e7eb] text-center min-w-[100px]">入组100%</th>
                      <th className="px-3 py-3 border-r border-[#e5e7eb] text-center min-w-[100px]">结题质控</th>
                      <th className="px-3 py-3 border-r border-[#e5e7eb] text-center min-w-[100px]">研究关闭</th>
                      <th className="px-4 py-3 text-center sticky right-0 bg-[#f9fafb] border-l border-[#e5e7eb] shadow-[-2px_0_5px_rgba(0,0,0,0.02)]">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-3 py-3 border-b border-r border-[#e5e7eb] text-gray-500 text-xs text-center">{row.id}</td>
                        <td className="px-4 py-3 border-b border-r border-[#e5e7eb] text-gray-800 text-[13px] font-medium truncate max-w-[300px]" title={row.name}>{row.name}</td>
                        <td className="px-3 py-3 border-b border-r border-[#e5e7eb] text-gray-600 text-[13px]">{row.sample}</td>
                        <DateCell date={row.s1} />
                        <DateCell date={row.s2} />
                        <DateCell date={row.s3} />
                        <DateCell date={row.s4} />
                        <DateCell date={row.s5} />
                        <DateCell date={row.s6} />
                        <DateCell date={row.s7} />
                        <DateCell date={row.s8} />
                        <DateCell date={row.s9} />
                        <DateCell date={row.s10} />
                        <DateCell date={row.s11} />
                        <DateCell date={row.s12} />
                        <DateCell date="" />
                        <td className="px-4 py-3 border-b border-[#e5e7eb] text-center sticky right-0 bg-white border-l shadow-[-2px_0_5px_rgba(0,0,0,0.02)] space-x-2 text-xs">
                          <button className="text-[#083190] hover:text-blue-800 hover:underline">最新概况</button>
                          <span className="text-gray-300">|</span>
                          <button className="text-[#083190] hover:text-blue-800 hover:underline">查看</button>
                          <span className="text-gray-300">|</span>
                          <button className="text-[#083190] hover:text-blue-800 hover:underline">更新</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-right pr-4 text-sm text-gray-600">
                第1-5条，共5条数据
              </div>
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
