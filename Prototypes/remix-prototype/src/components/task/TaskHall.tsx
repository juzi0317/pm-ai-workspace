import { Search, MapPin, Users, ShieldCheck } from 'lucide-react';

export default function TaskHall() {
  return (
    <div className="bg-white min-h-[calc(100vh-100px)] rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[18px] font-bold text-[#083190] flex items-center border-l-4 border-[#083190] pl-3 tracking-tight">
          任务大厅 (公开可接单库)
        </h1>
        <div className="flex w-[400px]">
          <div className="relative flex-1 shadow-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="搜省市、适应症标签..." className="w-full border border-gray-300 border-r-0 rounded-l py-2 pl-9 pr-3 text-[13px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white" />
          </div>
          <button className="bg-blue-700 text-white px-6 rounded-r text-[13px] font-semibold hover:bg-blue-800 transition-colors shadow-sm">检索</button>
        </div>
      </div>
      
      <div className="flex border-b border-gray-200 mb-6 space-x-6 px-1">
        {['全部任务', '肿瘤科', '心血管科', '呼吸科'].map((tab, i) => (
           <div key={tab} className={`pb-2.5 text-[13px] font-semibold tracking-wide cursor-pointer transition-colors relative ${i === 0 ? 'text-[#083190]' : 'text-gray-500 hover:text-gray-900'}`}>
             {tab}
             {i === 0 && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#083190] rounded-t-sm"></div>}
           </div>
        ))}
      </div>
      
      <div className="space-y-3">
         {[
            { tag: '肿瘤科', title: '【肿瘤科】上海市第一肺科医院乳腺癌III期临床试验CRC服务任务包', price: '350.00', pub: '北京国信CRO (平台担保)', cycle: '12个月', visits: '120 例次', loc: '上海市', req: '2名CRC' },
            { tag: '心血管', title: '【心血管】广州市第一人民医院心肌梗死II期临床随访驻场任务', price: '280.00', pub: '奥咨达CRO', cycle: '6个月', visits: '80 例次', loc: '广东省 广州市', req: '1名CRC' },
            { tag: '呼吸科', title: '【呼吸科】四川大学华西第二医院哮喘新药临床试验短期随访任务包', price: '300.00', pub: '中小型新药研发试点企业', cycle: '3个月', visits: '50 例次', loc: '四川省 成都市', req: '个人兼职CRC/团队' },
         ].map((t, i) => (
           <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-300 shadow-sm relative overflow-hidden group">
              <div className="flex justify-between items-start mb-2.5 relative z-10">
                 <div className="flex items-center bg-white pr-4">
                    <span className="text-[#1d4ed8] bg-[#eff6ff] px-2 py-0.5 rounded text-[11px] font-bold border border-[#bfdbfe] mr-3 shadow-sm shrink-0 whitespace-nowrap">优质随访</span>
                    <h3 className="font-bold text-gray-900 text-[15px] hover:text-blue-700 cursor-pointer transition-colors leading-tight line-clamp-1">{t.title}</h3>
                 </div>
                 <div className="text-right shrink-0 bg-white pl-4">
                    <div className="text-[#1d4ed8] font-bold text-lg tracking-tight">￥ {t.price}</div>
                 </div>
              </div>
              
              <div className="text-[12px] text-gray-600 mb-3 flex items-center space-x-4 relative z-10">
                 <span className="font-medium text-gray-700">发布：<span className="text-gray-600 font-normal">{t.pub}</span></span>
                 <span className="text-gray-300">|</span>
                 <span className="font-medium text-gray-700">周期：<span className="text-gray-600 font-normal">{t.cycle}</span></span>
                 <span className="text-gray-300">|</span>
                 <span className="font-medium text-gray-700">随访：<span className="text-gray-600 font-normal">{t.visits}</span></span>
              </div>
              
              <div className="flex items-center justify-between border-t border-gray-100 pt-3 relative z-10">
                 <div className="flex items-center text-[12px] text-gray-600 space-x-5 w-full max-w-2xl px-1">
                    <div className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" strokeWidth={1.5} /> {t.loc}</div>
                    <div className="flex items-center"><Users className="w-3.5 h-3.5 mr-1 text-gray-400" strokeWidth={1.5} /> 需求：{t.req}</div>
                    <div className="flex items-center text-[#059669] font-medium bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-1 rounded shadow-sm">
                       <ShieldCheck className="w-3.5 h-3.5 mr-1" strokeWidth={2} /> 金额托管
                    </div>
                 </div>
                 <button className="bg-[#1e40af] text-white px-5 py-1.5 rounded text-xs font-bold shadow-sm hover:bg-[#083190] transition-all transform group-hover:scale-[1.02] active:scale-95 shrink-0">立即投标</button>
              </div>
              
              {/* Highlight gradient on hover */}
              <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-0 pointer-events-none"></div>
           </div>
         ))}
      </div>
    </div>
  );
}
