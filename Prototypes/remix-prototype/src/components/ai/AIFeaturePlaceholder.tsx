import { Sparkles, Bot } from 'lucide-react';

export default function AIFeaturePlaceholder({ title, description }: { title: string, description: string }) {
  return (
    <div className="flex bg-white h-[calc(100vh-80px)] rounded-xl border border-gray-200 overflow-hidden shadow-sm font-sans items-center justify-center relative">
      {/* decorative background element */}
      <div className="absolute right-0 top-1/4 w-[400px] h-[600px] pointer-events-none opacity-[0.03] overflow-hidden -z-10">
         <div className="w-[800px] h-[800px] border-[120px] border-blue-900 rounded-full absolute top-0 -right-[400px]"></div>
      </div>
      
      <div className="max-w-2xl text-center px-10">
         <div className="w-20 h-20 bg-blue-50 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-sm border border-blue-100">
           <Bot className="w-10 h-10 text-[#13316e]" />
         </div>
         <h1 className="text-[32px] font-bold text-gray-800 tracking-tight mb-5">{title}</h1>
         <div className="flex items-start justify-center text-[15px] text-gray-500 leading-relaxed mb-10 max-w-lg mx-auto">
            <Sparkles className="w-5 h-5 text-[#13316e] shrink-0 mr-2.5 mt-0.5 opacity-60" />
            <p className="text-left">{description}</p>
         </div>
         <div className="inline-flex items-center justify-center px-5 py-2.5 bg-gray-100/80 text-gray-500 rounded-full text-[13px] font-medium">
            研发设计中 · 敬请期待
         </div>
      </div>
    </div>
  );
}
