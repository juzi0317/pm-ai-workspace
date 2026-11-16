import { useState, useEffect } from 'react';
import { User, Edit2, LogOut, Search } from 'lucide-react';

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

export default function SponsorCenter({ activeTab: initialTab = '项目列表' }: { activeTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab === '我的项目' ? '项目列表' : initialTab);

  useEffect(() => {
    if (initialTab === '我的项目') {
       setActiveTab('项目列表');
    } else if (['项目列表', '人员列表', '公司介绍'].includes(initialTab)) {
       setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Let's create sub-views for each tab
  const renderProjects = () => (
    <div className="animation-fade-in">
       <div className="flex items-center space-x-3 mb-6">
        <div className="w-1 h-4 bg-[#083190] rounded-sm"></div>
        <h2 className="text-[15px] font-bold text-gray-800">项目列表</h2>
        <button className="ml-4 bg-[#083190] hover:bg-[#083190] text-white text-[12px] px-4 py-1.5 rounded shadow-sm transition-colors">添加项目</button>
      </div>

      <table className="w-full text-left text-[13px] border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="py-3 px-4 font-medium text-gray-600 w-32">方案/项目号</th>
            <th className="py-3 px-4 font-medium text-gray-600">项目名称</th>
            <th className="py-3 px-4 font-medium text-gray-600 w-32 text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          {[
            '噻托溴铵吸入粉雾剂在慢性阻塞性肺疾病（COPD）患者中的单次给药、两制剂、两周...',
            'ZG006在晚期小细胞肺癌或神经内分泌癌患者中的耐受性、安全性、有效性和药代动力...',
            '一项在晚期实体瘤患者中评价GenSci143的安全性、耐受性、药代动力学特征及初步抗...',
            'HH2853对照西达本胺治疗复发/难治性外周T细胞淋巴瘤的随机、双盲、对照III期临床研究',
            '评价注射用伐欣奇拜单抗在结缔组织病相关间质性肺病患者中的安全性、耐受性、有效...',
            '一项评估BDB-001注射液在ANCA相关性血管炎患者中有效性和安全性的多中心、随机...'
          ].map((title, i) => (
             <tr key={i} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
               <td className="py-4 px-4 text-gray-500">-</td>
               <td className="py-4 px-4 text-[#083190] hover:text-blue-700 cursor-pointer">{title}</td>
               <td className="py-4 px-4 text-gray-500 text-center">-</td>
             </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderMembers = () => (
    <div className="animation-fade-in">
       <div className="flex items-center space-x-6 mb-6">
         <div className="flex items-center space-x-3">
           <span className="text-[13px] text-gray-600 whitespace-nowrap">成员名称:</span>
           <input type="text" placeholder="请输入" className="w-48 px-3 py-1.5 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-blue-500" />
         </div>
         <div className="flex items-center space-x-3">
           <span className="text-[13px] text-gray-600 whitespace-nowrap">联系方式:</span>
           <input type="text" placeholder="请输入" className="w-48 px-3 py-1.5 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-blue-500" />
         </div>
         <div className="flex items-center space-x-3">
           <span className="text-[13px] text-gray-600 whitespace-nowrap">职务:</span>
           <input type="text" placeholder="请输入" className="w-48 px-3 py-1.5 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-blue-500" />
         </div>
       </div>
       <div className="flex items-center space-x-6 mb-6">
         <div className="flex items-center space-x-3">
           <span className="text-[13px] text-gray-600 whitespace-nowrap ml-4">身份:</span>
           <select className="w-48 px-3 py-1.5 border border-gray-300 rounded text-[13px] text-gray-400 focus:outline-none focus:border-blue-500 bg-white">
             <option>请选择</option>
           </select>
         </div>
         <button className="bg-[#083190] hover:bg-[#083190] text-white text-[13px] px-5 py-1.5 rounded shadow-sm transition-colors flex items-center justify-center space-x-1">
           <Search className="w-3.5 h-3.5" />
           <span>搜索</span>
         </button>
         <button className="border border-gray-300 hover:bg-gray-50 text-gray-600 text-[13px] px-5 py-1.5 rounded transition-colors flex items-center justify-center space-x-1">
           <span className="text-gray-400">↻</span>
           <span>重置</span>
         </button>
       </div>

       <div className="flex space-x-3 mb-4">
         <button className="bg-[#083190] hover:bg-[#083190] text-white text-[13px] px-4 py-1.5 rounded shadow-sm transition-colors">添加成员</button>
         <button className="bg-indigo-500 hover:bg-indigo-600 text-white text-[13px] px-4 py-1.5 rounded shadow-sm transition-colors">邀请人员</button>
         <button className="bg-[#083190] hover:bg-[#083190] text-white text-[13px] px-4 py-1.5 rounded shadow-sm transition-colors flex items-center space-x-1">
           <span>↓↑</span>
           <span>切换至申请记录</span>
         </button>
       </div>

       <table className="w-full text-left text-[13px] border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="py-3 px-4 font-medium text-gray-600 text-center">成员名称</th>
            <th className="py-3 px-4 font-medium text-gray-600 text-center">用户名</th>
            <th className="py-3 px-4 font-medium text-gray-600 text-center">联系方式</th>
            <th className="py-3 px-4 font-medium text-gray-600 text-center">邮箱</th>
            <th className="py-3 px-4 font-medium text-gray-600 text-center">职务</th>
            <th className="py-3 px-4 font-medium text-gray-600 text-center">职责范围</th>
            <th className="py-3 px-4 font-medium text-gray-600 text-center">身份</th>
            <th className="py-3 px-4 font-medium text-gray-600 text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          {[
            { name: '演示厂家', username: 'totrial_155****1111', phone: '15511111111', email: '-', role: '助理', scope: '-', identity: '管理员' },
            { name: '李静', username: 'totrial_186****53...', phone: '18602185367', email: '-', role: '医学研究', scope: '-', identity: '成员' },
            { name: '朱世文', username: 'totrial_130****75...', phone: '13030007507', email: 'shiwen.zhu@tot...', role: '-', scope: '-', identity: '成员' }
          ].map((m, i) => (
             <tr key={i} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors text-center text-gray-600">
               <td className="py-3 px-4">{m.name}</td>
               <td className="py-3 px-4">{m.username}</td>
               <td className="py-3 px-4">{m.phone}</td>
               <td className="py-3 px-4">{m.email}</td>
               <td className="py-3 px-4">{m.role}</td>
               <td className="py-3 px-4">{m.scope}</td>
               <td className="py-3 px-4">{m.identity}</td>
               <td className="py-3 px-4 flex items-center justify-center space-x-2 text-[#083190]">
                 <button className="flex items-center hover:text-blue-700 transition-colors"><Edit2 className="w-3 h-3 mr-1"/> 编辑</button>
                 {m.identity !== '管理员' && <button className="flex items-center hover:text-blue-700 transition-colors"><span className="mr-1">+</span> 身份</button>}
               </td>
             </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderCompany = () => (
    <div className="animation-fade-in max-w-4xl pt-4">
      <div className="flex justify-between items-start mb-8">
         <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-800 text-white flex items-center justify-center font-bold text-xl rounded">临</div>
            <div className="flex flex-col">
              <span className="text-gray-500 text-[13px]">公司名称：</span>
              <span className="text-[14px] text-gray-800 font-medium">临研通(天津)科技有限公司 (组织码:)</span>
            </div>
         </div>
         <div className="flex items-center space-x-4 text-[13px] text-gray-500">
            <button className="flex items-center hover:text-[#083190] transition-colors"><Edit2 className="w-3.5 h-3.5 mr-1"/>编辑</button>
            <button className="flex items-center hover:text-red-500 transition-colors"><LogOut className="w-3.5 h-3.5 mr-1"/>退出组织</button>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-y-6 text-[13px]">
        <div className="flex">
          <span className="text-gray-500 w-28 shrink-0">联系人：</span>
          <span className="text-gray-800">沈艳艳</span>
        </div>
        <div className="flex">
          <span className="text-gray-500 w-28 shrink-0">手机号码：</span>
          <span className="text-gray-800">18736199128</span>
        </div>
        <div className="flex">
          <span className="text-gray-500 w-28 shrink-0">联系人职务：</span>
          <span className="text-gray-800">总监</span>
        </div>
        <div className="flex">
          <span className="text-gray-500 w-28 shrink-0">联系人邮箱：</span>
          <span className="text-gray-800">-</span>
        </div>
        <div className="flex">
          <span className="text-gray-500 w-28 shrink-0">公司邮箱：</span>
          <span className="text-gray-800">-</span>
        </div>
        <div className="flex">
          <span className="text-gray-500 w-28 shrink-0">官网地址：</span>
          <span className="text-gray-400">https://www.totrial.com</span>
        </div>
        <div className="flex">
          <span className="text-gray-500 w-28 shrink-0">注册资金：</span>
          <span className="text-gray-400">1,133.3万</span>
        </div>
        <div className="flex">
          <span className="text-gray-500 w-28 shrink-0">员工数：</span>
          <span className="text-gray-800">-</span>
        </div>
        <div className="flex">
          <span className="text-gray-500 w-28 shrink-0">企业性质：</span>
          <span className="text-gray-800">有限合伙企业</span>
        </div>
        <div className="flex">
          <span className="text-gray-500 w-28 shrink-0">成立年份：</span>
          <span className="text-gray-400">2018</span>
        </div>
        <div className="flex">
          <span className="text-gray-500 w-28 shrink-0">信用代码：</span>
          <span className="text-gray-800">-</span>
        </div>
        <div className="flex">
          <span className="text-gray-500 w-28 shrink-0">所在城市：</span>
          <span className="text-gray-400">/</span>
        </div>
        <div className="flex">
          <span className="text-gray-500 w-28 shrink-0">注册地址：</span>
          <span className="text-gray-800">-</span>
        </div>
        <div className="flex">
          <span className="text-gray-500 w-28 shrink-0">详细地址：</span>
          <span className="text-gray-800">-</span>
        </div>
      </div>
      <div className="mt-6 flex">
         <span className="text-gray-500 w-28 shrink-0 text-[13px]">企业营业执照：</span>
         <div className="w-32 h-24 border-2 border-dashed border-blue-200 bg-blue-50/50 flex flex-col items-center justify-center text-blue-300 relative">
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-blue-500"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-blue-500"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-blue-500"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-blue-500"></div>
            <div className="w-10 h-10 rounded-full bg-gray-200/50 flex items-center justify-center">📷</div>
         </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans min-h-[calc(100vh-8rem)] flex flex-col">
      <ProfileHeader 
        name="演示厂家" 
        email="" 
        username="totrial_155****1111" 
        phone="15511111111" 
        avatarChar="演" 
      />

      <div className="bg-white rounded p-6 shadow-sm border border-gray-100 flex-1">
        <div className="flex justify-center border-b border-gray-200 mb-6">
          <div className="flex space-x-16">
            {['项目列表', '人员列表', '公司介绍'].map(t => (
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
        
        {activeTab === '项目列表' && renderProjects()}
        {activeTab === '人员列表' && renderMembers()}
        {activeTab === '公司介绍' && renderCompany()}
      </div>
    </div>
  );
}
