import { Sparkles } from 'lucide-react';

export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex bg-white h-[calc(100vh-100px)] rounded-xl border border-gray-200 items-center justify-center flex-col shadow-sm">
       <div className="relative mb-8">
          <div className="w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center z-10 relative border border-blue-100 shadow-inner">
             <Sparkles className="w-10 h-10 text-[#083190]" strokeWidth={1.5} />
          </div>
          <div className="absolute inset-0 bg-blue-100/30 blur-2xl transform scale-150 rounded-full z-0"></div>
       </div>
       <h2 className="text-2xl font-bold text-gray-800 mb-4">{title} 设计中</h2>
       <p className="text-gray-500 text-sm max-w-sm text-center leading-relaxed">
         我们正在利用最新的 AI 技术为您构建此模块的高保真原型，预计将在下个版本中与您见面，敬请期待！
       </p>
       <div className="mt-8 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs font-medium text-gray-500">
         正在积极研发中...
       </div>
    </div>
  );
}
