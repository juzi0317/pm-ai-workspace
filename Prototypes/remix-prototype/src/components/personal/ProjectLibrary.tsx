import { useState } from 'react';
import { Search } from 'lucide-react';

interface ProjectLibraryProps {
  isPublic: boolean;
}

export default function ProjectLibrary({ isPublic }: ProjectLibraryProps) {
  const [activeTab, setActiveTab] = useState('全部');
  const tabs = isPublic ? ['全部', '拟开展', '招募中', '暂停入组'] : ['全部', '北京', '上海', '广州', '其他'];

  const projects = [
    {
      title: 'APG-2575 联合阿可替尼对比免疫化疗治疗初治CLL/SLL的III期研究',
      status: '拟开展',
      tags: ['药物', 'III期', '淋巴瘤-慢性淋巴细胞白血病'],
      sponsor: '苏州亚盛药业有限公司',
      contact: '郭**/152****9234'
    },
    {
      title: '评价ZS802注射液治疗重度血友病A患者I/II期临床研究',
      status: '招募中',
      tags: ['药物', 'I期+II期', '出血疾病-血友病'],
      sponsor: '四川至善唯新生物科技有限公司',
      contact: '吴*/138****3140'
    },
    {
      title: '注射用STSP-0601在血友病患者中的IIb期临床试验',
      status: '拟开展',
      tags: ['药物', 'II期', '出血疾病-血友病'],
      sponsor: '舒泰神（北京）生物制药股份有限...',
      contact: '王**/010****9614'
    },
    {
      title: '既往参与罗特西普(ACE-536)其他临床试验的受试者中评价长期安全性的 IIIb 期研究',
      status: '拟开展',
      tags: ['药物', 'III期', '骨髓增殖性疾病-骨髓增生异常综合征 (MDS)'],
      sponsor: 'Celgene Corporation',
      contact: '黑**/135****6468'
    },
    {
      title: '评估GNC-035四特异性抗体注射液在复发或难治性非霍奇金淋巴瘤等血液系统恶性肿瘤I/II期临床研究',
      status: '招募中',
      tags: ['药物', 'I期+II期', '淋巴瘤-边缘区B细胞淋巴瘤', '淋巴瘤-弥漫大B细胞淋巴瘤'],
      sponsor: '成都百利多特生物药业有限责任公司',
      contact: '丁*/180****8159'
    }
  ];

  const hospitals = [
    {
      name: '北京大学第一医院',
      level: '三级甲等',
      type: '综合医院',
      region: '北京',
      trialsCount: 342,
      contact: '李主任 / 010-8357****'
    },
    {
      name: '复旦大学附属中山医院',
      level: '三级甲等',
      type: '综合医院',
      region: '上海',
      trialsCount: 289,
      contact: '张老师 / 021-6404****'
    },
    {
      name: '四川大学华西医院',
      level: '三级甲等',
      type: '综合医院',
      region: '四川成都',
      trialsCount: 415,
      contact: '王医生 / 028-8542****'
    },
    {
      name: '中山大学肿瘤防治中心',
      level: '三级甲等',
      type: '专科医院',
      region: '广东广州',
      trialsCount: 312,
      contact: '陈主任 / 020-8734****'
    }
  ];

  const statusColors: any = {
    '拟开展': 'bg-orange-400 text-white',
    '招募中': 'bg-orange-400 text-white',
    '暂停入组': 'bg-gray-400 text-white'
  };

  return (
    <div className="bg-white min-h-[calc(100vh-8rem)] rounded shadow-sm border border-gray-100 p-6 flex flex-col font-sans">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-1 h-5 bg-[#083190] rounded-sm"></div>
        <h2 className="text-[17px] font-bold text-gray-800">{isPublic ? '项目库' : '协同中心库'}</h2>
        <span className="text-gray-400 text-sm font-normal">{isPublic ? '10137个在研项目' : '2345家认证机构'}</span>
      </div>

      <div className="flex space-x-1 mb-5">
        {tabs.map(t => (
          <button 
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-6 py-2 text-[13px] rounded transition-colors ${activeTab === t ? 'bg-[#083190] text-white font-medium shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex mb-6 space-x-3">
        <div className="flex flex-1 border border-blue-500 rounded overflow-hidden shadow-sm">
          <input 
            type="text" 
            placeholder={isPublic ? "请输入关键词，如：项目名称、研究产品、适应症、申办方、组长单位" : "请输入医院名称、医生姓名、优势科室等关键词"} 
            className="flex-1 px-4 py-2 text-[13px] focus:outline-none"
          />
          <button className="bg-[#083190] w-12 flex items-center justify-center hover:bg-blue-700 transition-colors">
            <Search className="w-4 h-4 text-white" />
          </button>
        </div>
        <button className="px-4 py-2 border border-blue-100 text-[#083190] text-[13px] rounded flex items-center space-x-2 bg-blue-50/50 hover:bg-blue-50 transition-colors shadow-sm">
          <div className="w-4 h-3 bg-[#083190]/20 flex flex-col justify-between">
             <div className="w-full h-px bg-[#083190]"></div>
             <div className="w-full h-px bg-[#083190]"></div>
             <div className="w-full h-px bg-[#083190]"></div>
          </div>
          <span>高级筛选</span>
        </button>
      </div>

      <div className="space-y-4">
        {isPublic ? projects.map((p, i) => (
          <div key={i} className="border border-gray-100 rounded bg-white hover:border-blue-200 transition-colors relative shadow-sm">
             <div className="flex">
               <div className="flex-1 p-5">
                  <h3 className="text-[15px] font-bold text-gray-800 mb-3 cursor-pointer hover:text-[#083190] transition-colors">{p.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                     {p.tags.map((tag, idx) => (
                        <span key={idx} className={`px-2 py-0.5 text-[11px] rounded ${idx === 0 ? 'bg-green-100 text-green-600' : idx === 1 ? 'bg-orange-100 text-orange-600' : 'bg-[#083190] text-white'}`}>
                          {tag}
                        </span>
                     ))}
                  </div>
                  <div className="flex items-center text-[13px] text-gray-500 space-x-8">
                     <div>申办方：{p.sponsor}</div>
                     <div>联系人：{p.contact}</div>
                  </div>
               </div>
               <div className="w-32 flex flex-col relative items-end">
                  <div className={`absolute top-0 right-0 px-4 py-1 text-[12px] font-medium rounded-bl ${statusColors[p.status]}`}>
                    {p.status}
                  </div>
                  <div className="flex flex-1 items-end justify-end p-4 space-x-3 text-blue-400">
                    <button className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-blue-50 transition-colors">💬</button>
                    <button className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-blue-50 transition-colors">📄</button>
                    <button className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-blue-50 transition-colors">⭐</button>
                  </div>
               </div>
             </div>
          </div>
        )) : hospitals.map((h, i) => (
          <div key={i} className="border border-gray-100 rounded bg-white hover:border-blue-200 transition-colors relative shadow-sm">
             <div className="flex">
               <div className="flex-1 p-5">
                  <h3 className="text-[15px] font-bold text-gray-800 mb-3 cursor-pointer hover:text-[#083190] transition-colors">{h.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2 py-0.5 text-[11px] rounded bg-green-100 text-green-600">{h.level}</span>
                      <span className="px-2 py-0.5 text-[11px] rounded bg-blue-100 text-[#083190]">{h.type}</span>
                      <span className="px-2 py-0.5 text-[11px] rounded bg-gray-100 text-gray-600">{h.region}</span>
                  </div>
                  <div className="flex items-center text-[13px] text-gray-500 space-x-8">
                     <div>目前在研项目：<span className="text-[#083190] font-medium">{h.trialsCount}</span> 个</div>
                     <div>GCP办联系人：{h.contact}</div>
                  </div>
               </div>
               <div className="w-32 flex flex-col items-end">
                  <div className="flex flex-1 items-center justify-end p-4 space-x-3 text-blue-400">
                    <button className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-blue-50 transition-colors">💬</button>
                    <button className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-blue-50 transition-colors">📄</button>
                    <button className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-blue-50 transition-colors">⭐</button>
                  </div>
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
