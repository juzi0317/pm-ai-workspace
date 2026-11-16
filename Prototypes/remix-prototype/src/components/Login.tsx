import { useState } from 'react';
import { User, Lock, Phone } from 'lucide-react';

export default function Login({ onLogin }: { onLogin: (role: 'sponsor' | 'site') => void }) {
  const [activeTab, setActiveTab] = useState('account');

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f2f5] font-sans">
      {/* Header */}
      <div className="bg-white h-20 px-10 flex items-center justify-between shadow-sm relative z-10">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="flex flex-col items-center gap-[3px] mt-1 w-[15px]">
              <div className="flex justify-between w-full">
                <div className="bg-[#f59e0b] rounded-[2px] w-[6px] h-[6px]" />
                <div className="bg-[#10b981] rounded-[2px] w-[6px] h-[6px]" />
              </div>
              <div className="bg-[#3b82f6] rounded-[2px] w-[6px] h-[6px]" />
            </div>
            <span className="text-[#083190] text-2xl font-bold ml-3 tracking-tight">ToTrial 临研通</span>
          </div>
          <div className="h-8 w-px bg-gray-300"></div>
          <div>
            <div className="text-[#083190] font-bold text-[15px] tracking-wide">临研通临床研究智能监测系统</div>
            <div className="text-[#083190] text-[10px] font-medium uppercase tracking-widest">ToTrial Clinical Trial Intelligent Detection System</div>
          </div>
        </div>
        <div className="flex items-center text-[#083190] font-medium text-lg">
          <Phone className="w-5 h-5 mr-2" />
          400-8080-355
        </div>
      </div>

      {/* Main Content with Background */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* Placeholder for background image */}
        <div className="absolute inset-0 bg-[#083190] overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1532187863486-abf9db09dffa?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#083190]/90 to-transparent"></div>
        </div>

        {/* Login Box */}
        <div className="relative z-10 bg-white w-[380px] rounded shadow-2xl overflow-hidden mr-[-400px]">
          <div className="flex border-b border-gray-200">
            <button 
              onClick={() => setActiveTab('account')}
              className={`flex-1 py-4 text-[15px] font-bold transition-colors ${activeTab === 'account' ? 'text-gray-800 border-b-2 border-[#083190]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              账号登录
            </button>
            <button 
              onClick={() => setActiveTab('wechat')}
              className={`flex-1 py-4 text-[15px] font-bold transition-colors relative ${activeTab === 'wechat' ? 'text-gray-800 border-b-2 border-[#083190]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              微信扫码
              <div className="absolute top-0 right-0 w-8 h-8 bg-gray-100 transform rotate-45 translate-x-4 -translate-y-4"></div>
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'account' ? (
              <div className="space-y-5">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="请输入账号" 
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 bg-blue-50/30 text-[13px] rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    type="password" 
                    placeholder="请输入密码" 
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 bg-blue-50/30 text-[13px] rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                
                <div className="pt-2">
                  <div className="text-[13px] text-gray-500 mb-3 text-center">模拟登录身份选择</div>
                  <div className="flex space-x-3">
                     <button 
                       onClick={() => onLogin('sponsor')}
                       className="flex-1 bg-[#083190] text-white py-2.5 rounded text-[13px] font-medium hover:bg-blue-800 transition-colors shadow-sm"
                     >
                       申办方登录
                     </button>
                     <button 
                       onClick={() => onLogin('site')}
                       className="flex-1 bg-teal-600 text-white py-2.5 rounded text-[13px] font-medium hover:bg-teal-700 transition-colors shadow-sm"
                     >
                       研究中心登录
                     </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <a href="#" className="text-[#083190] text-[12px] hover:underline">重置密码</a>
                </div>
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-gray-500 text-sm">
                <div className="w-32 h-32 border border-gray-200 bg-gray-50 mb-4 flex items-center justify-center">
                  二维码占位
                </div>
                请使用微信扫一扫登录
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#f0f2f5] py-6 text-center text-[12px] text-gray-500">
        <div className="mb-2">📞 400-8080-355 ✉ BD@totrial.com</div>
        <div>© 2018 - 2026 临研通(天津)医疗科技集团有限公司 All Rights Reserved 津ICP备202100721号-3</div>
      </div>
    </div>
  );
}
