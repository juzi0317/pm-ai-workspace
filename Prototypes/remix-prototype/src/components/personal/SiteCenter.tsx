import { useState, useEffect } from 'react';

interface ProfileHeaderProps {
  name: string;
  email: string;
  username: string;
  phone: string;
  avatarChar: string;
}

function ProfileHeader({ name, email, username, phone, avatarChar }: ProfileHeaderProps) {
// ... existing code ...
  return (
    <div className="bg-white rounded mb-6 p-6 flex flex-wrap items-center gap-y-4 gap-x-12 shadow-sm border border-gray-100 font-sans">
      <div className="flex items-center space-x-4 min-w-[200px]">
        <div className="w-12 h-12 bg-blue-100 text-[#083190] rounded-full flex items-center justify-center text-xl font-bold shadow-inner">
          {avatarChar}
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 text-[13px] mb-1">姓名：</span>
          <span className="text-gray-800 text-[14px] font-medium">{name}</span>
        </div>
      </div>
      <div className="flex flex-col min-w-[200px]">
        <span className="text-gray-500 text-[13px] mb-1">用户邮箱：</span>
        <span className="text-gray-800 text-[14px] font-medium">{email || '-'}</span>
      </div>
      <div className="flex flex-col min-w-[200px]">
        <span className="text-gray-500 text-[13px] mb-1">用户名：</span>
        <span className="text-gray-800 text-[14px] font-medium">{username}</span>
      </div>
      <div className="flex flex-col min-w-[200px]">
        <span className="text-gray-500 text-[13px] mb-1">手机号码：</span>
        <span className="text-gray-800 text-[14px] font-medium">{phone}</span>
      </div>
    </div>
  );
}

export default function SiteCenter({ activeTab: initialTab = '我的项目' }: { activeTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab === '中心管理' ? '个人资料' : initialTab);

  useEffect(() => {
    if (initialTab === '中心管理') {
       setActiveTab('个人资料');
    } else if (['个人资料', '我的项目', '患者数量'].includes(initialTab)) {
       setActiveTab(initialTab);
    }
  }, [initialTab]);

  const renderProjects = () => (
    <div className="animation-fade-in">
       <table className="w-full text-left text-[13px] border-collapse mt-2">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/50">
            <th className="py-3 px-4 text-center font-medium text-gray-600">方案/项目号</th>
            <th className="py-3 px-4 text-center font-medium text-gray-600">项目名称</th>
            <th className="py-3 px-4 text-center font-medium text-gray-600">申办方</th>
            <th className="py-3 px-4 text-center font-medium text-gray-600">申办方联系人</th>
            <th className="py-3 px-4 text-center font-medium text-gray-600">联系电话</th>
            <th className="py-3 px-4 text-center font-medium text-gray-600">创建日期</th>
            <th className="py-3 px-4 text-center font-medium text-gray-600">操作</th>
          </tr>
        </thead>
        <tbody>
          {[
            { id: 'STSP-0601-04', title: '多中心、开放评价注...', sponsor: '舒泰神 (北京) 生物...', contact: '王雅丽', phone: '010-67519614', date: '2024-02-28 11:05' },
            { id: 'ACE-536-LTFU-001', title: '一项在既往参与罗特...', sponsor: 'Celgene Corporation', contact: '黑红亚', phone: '13585826468', date: '2024-01-15 14:43' },
            { id: 'GNC-035-104', title: '评估GNC-035四特...', sponsor: '成都百利多特生物药...', contact: '丁寒', phone: '18036618159', date: '2024-01-08 12:18' },
            { id: 'KN057-A-302', title: '在伴抑制物的血友病...', sponsor: '苏州康宁杰瑞生物科...', contact: '杨岚', phone: '17502202987', date: '2024-01-04 11:16' },
            { id: 'KN057-A-301', title: '在伴抑制物的血友病...', sponsor: '苏州康宁杰瑞生物科...', contact: '杨岚', phone: '17502202987', date: '2024-01-04 09:44' }
          ].map((p, i) => (
             <tr key={i} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors text-center text-gray-500">
               <td className="py-4 px-4">{p.id}</td>
               <td className="py-4 px-4 text-[#083190] hover:text-blue-700 cursor-pointer">{p.title}</td>
               <td className="py-4 px-4">{p.sponsor}</td>
               <td className="py-4 px-4">{p.contact}</td>
               <td className="py-4 px-4">{p.phone}</td>
               <td className="py-4 px-4">{p.date}</td>
               <td className="py-4 px-4 text-[#083190] hover:text-blue-700 cursor-pointer">查看</td>
             </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end items-center mt-6 text-[13px] text-gray-500 space-x-4">
         <span>共 11 条</span>
         <select className="border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none">
            <option>10条/页</option>
         </select>
         <div className="flex space-x-1">
            <button className="px-2 py-1 rounded bg-gray-100 text-gray-400 cursor-not-allowed">{'<'}</button>
            <button className="px-3 py-1 rounded bg-[#083190] text-white">1</button>
            <button className="px-3 py-1 rounded hover:bg-gray-100 transition-colors">2</button>
            <button className="px-2 py-1 rounded hover:bg-gray-100 transition-colors">{'>'}</button>
         </div>
         <div className="flex items-center space-x-2">
            <span>前往</span>
            <input type="text" defaultValue="1" className="w-10 text-center border border-gray-300 rounded py-1 focus:outline-none focus:border-blue-500" />
            <span>页</span>
         </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans min-h-[calc(100vh-8rem)] flex flex-col">
      <ProfileHeader 
        name="演示中心" 
        email="" 
        username="totrial_155****2222" 
        phone="15522222222" 
        avatarChar="演" 
      />

      <div className="bg-white rounded p-6 shadow-sm border border-gray-100 flex-1">
        <div className="flex justify-center border-b border-gray-200 mb-6">
          <div className="flex space-x-16">
            {['个人资料', '我的项目', '患者数量'].map(t => (
              <button 
                key={t}
                onClick={() => setActiveTab(t)}
                className={`pb-3 text-[14px] transition-colors relative ${activeTab === t ? 'text-[#083190] font-medium' : 'text-gray-500 hover:text-gray-800'}`}
              >
                {t}
                {activeTab === t && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#083190]"></div>}
              </button>
            ))}
          </div>
        </div>
        
        {activeTab === '我的项目' && renderProjects()}
        {activeTab === '个人资料' && <div className="text-gray-400 text-center py-10">个人资料模块建设中...</div>}
        {activeTab === '患者数量' && <div className="text-gray-400 text-center py-10">患者数量模块建设中...</div>}
      </div>
    </div>
  );
}
