import { useState } from "react";
import { Check, HelpCircle, Sparkles, Star, Zap, Info, CreditCard } from "lucide-react";

interface PlanFeature {
  name: string;
  free: string | boolean;
  basic: string | boolean;
  advanced: string | boolean;
  category: string;
}

export default function PricingSystem() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    name: string;
    price: string;
    trialPrice: string;
    desc: string;
  } | null>(null);
  const [payMethod, setPayMethod] = useState<"wechat" | "alipay">("wechat");
  const [isPaid, setIsPaid] = useState<string | null>(() => {
    return localStorage.getItem("totrial_vip_tier") || null;
  });
  const [paySuccess, setPaySuccess] = useState(false);

  // Features list for comparison
  const features: PlanFeature[] = [
    { name: "单日AI对话额度", free: "5 次", basic: "200 次", advanced: "无限制 (专属并发通道)", category: "AI 基础功能" },
    { name: "文献智能分析 (MedicalQA)", free: "仅支持 200KB 以内", basic: "支持 10MB，每次最多 5 篇", advanced: "支持 50MB，每次最多 50 篇", category: "AI 基础功能" },
    { name: "AI Capture (数据自动提取)", free: "❌ 不支持", basic: "✓ 基础批处理", advanced: "✓ 高速高精度 OCR 引擎", category: "数据自动提取" },
    { name: "AI Screening (智能入排筛查)", free: "❌ 不支持", basic: "✓ 50 人/次", advanced: "✓ 无限制 + 批量多中心对比", category: "入排筛查" },
    { name: "AI Analysis (智能数据分析)", free: "❌ 不支持", basic: "✓ 基础分析模板", advanced: "✓ 高级统计分析 + 一键生成报告", category: "增值功能 (Paid Only)" },
    { name: "AI Draft (临床方案自动起草)", free: "❌ 不支持", basic: "✓ 支持 4 大核心章节起草", advanced: "✓ 全套方案 12 章节自动生成", category: "增值功能 (Paid Only)" },
    { name: "导出 Word/Excel", free: "❌ 不支持", basic: "✓ 基础格式", advanced: "✓ 精美无水印排版，100% 格式对齐", category: "系统与交付" },
    { name: "AI 方案质控批注 (实时修正)", free: "❌ 不支持", basic: "✓ 基础合规审查", advanced: "✓ 12项深度医学逻辑校验", category: "系统与交付" },
    { name: "专属客服与医学专家支持", free: "❌ 不支持", basic: "❌ 不支持", advanced: "✓ 24小时专属绿色通道", category: "系统与交付" },
  ];

  const handleSubscribe = (plan: { name: string; price: string; trialPrice: string; desc: string }) => {
    setSelectedPlan(plan);
    setShowPayModal(true);
  };

  const handleConfirmPay = () => {
    setPaySuccess(true);
    setTimeout(() => {
      localStorage.setItem("totrial_vip_tier", selectedPlan?.name || "基础版");
      setIsPaid(selectedPlan?.name || "基础版");
      setShowPayModal(false);
      setPaySuccess(false);
      // Trigger update event
      window.dispatchEvent(new Event("totrial_user_vip_updated"));
    }, 1800);
  };

  const handleResetVip = () => {
    localStorage.removeItem("totrial_vip_tier");
    setIsPaid(null);
    window.dispatchEvent(new Event("totrial_user_vip_updated"));
  };

  return (
    <div className="flex-1 bg-gray-50/50 pb-12 font-sans overflow-y-auto">
      {/* Header section with modern background */}
      <div className="bg-gradient-to-r from-blue-50/80 to-white text-gray-900 py-10 px-8 text-center relative overflow-hidden rounded-b-2xl border-b border-gray-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08),transparent)] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-1.5 bg-blue-100/50 px-3.5 py-1 rounded-full text-blue-700 text-xs font-bold border border-blue-200 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#2b64e3]" />
            <span>ToTrial 订阅计划 · 高效赋能临床研究</span>
          </div>
          <h1 className="text-[28px] font-black tracking-tight text-gray-900">
            ToTrial 临研通个人订阅方案
          </h1>
          <p className="text-[13px] text-gray-500 max-w-xl mx-auto leading-relaxed">
            专为临床科研学者、临床研究协调员（CRC）、主要研究者（PI）打造。高性价比个人套餐，助力全流程提速降本。
          </p>

          {/* User VIP State Badge */}
          {isPaid && (
            <div className="inline-flex items-center space-x-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-2 text-xs font-bold mt-4 shadow-sm backdrop-blur-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>您当前已激活：ToTrial 【{isPaid}】 会员权益</span>
              <button 
                onClick={handleResetVip} 
                className="underline text-emerald-600 hover:text-emerald-800 ml-2 transition-colors"
                title="重置为免费体验版"
              >
                重置权益
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-6 mt-8 space-y-10">
        
        {/* Toggle navigation for billing period */}
        <div className="flex flex-col items-center space-y-3">
          <div className="bg-gray-100 border border-gray-150 p-1 rounded-full flex items-center space-x-1 shadow-xs">
            <button 
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${billingPeriod === "monthly" ? "bg-white text-[#083190] shadow-xs" : "text-gray-500 hover:text-gray-800"}`}
            >
              连续包月
            </button>
            <button 
              onClick={() => setBillingPeriod("yearly")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1 ${billingPeriod === "yearly" ? "bg-white text-amber-700 shadow-xs border border-amber-100/30" : "text-gray-500 hover:text-gray-800"}`}
            >
              <span>连续包年</span>
              <span className="text-[9px] bg-amber-100 text-amber-700 px-1 py-0.2 rounded font-black">7.5折</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* 免费版 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-sm transition-all flex flex-col overflow-hidden relative">
            <div className="p-6 pb-4 border-b border-gray-100/70">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                STARTER
              </span>
              <h3 className="text-base font-black text-gray-800">个人免费版</h3>
              <p className="text-[11px] text-gray-400 mt-1 min-h-[32px]">
                满足基础医学问答及小规模文献检索。
              </p>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-black text-gray-900">¥0</span>
                <span className="text-xs text-gray-400 ml-1.5 font-bold">/ 永久免费</span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <ul className="space-y-3">
                <li className="flex items-start text-xs text-gray-600">
                  <Check className="w-4 h-4 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                  <span>每天支持 5 次 AI 文献解析 & 问答</span>
                </li>
                <li className="flex items-start text-xs text-gray-600">
                  <Check className="w-4 h-4 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                  <span>单次文献上传限制 200KB</span>
                </li>
                <li className="flex items-start text-xs text-gray-600">
                  <Check className="w-4 h-4 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                  <span>1 个本地项目数据归档</span>
                </li>
                <li className="flex items-start text-xs text-gray-400 line-through">
                  <span>AI Analysis (智能分析模板)</span>
                </li>
                <li className="flex items-start text-xs text-gray-400 line-through">
                  <span>AI Draft (方案自动起草)</span>
                </li>
              </ul>

              <button 
                disabled={!isPaid}
                onClick={() => handleSubscribe({ name: "免费版", price: "0", trialPrice: "0", desc: "基础套餐" })}
                className={`w-full py-2.5 rounded-xl text-xs font-bold mt-8 transition-all ${
                  !isPaid 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {!isPaid ? "当前正在使用" : "降级至免费版"}
              </button>
            </div>
          </div>

          {/* 基础版 */}
          <div className="bg-white rounded-2xl border-2 border-[#083190]/15 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden relative">
            <div className="absolute top-0 right-0 bg-blue-50 text-[#083190] text-[9.5px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-blue-100/50">
              ★ 7天免费试用
            </div>
            <div className="p-6 pb-4 border-b border-gray-100/70 bg-[#083190]/3">
              <span className="text-[10px] font-bold text-[#083190] uppercase tracking-widest block mb-1">
                PROFESSIONAL
              </span>
              <h3 className="text-base font-black text-[#083190] flex items-center">
                个人基础版
              </h3>
              <p className="text-[11px] text-gray-500 mt-1 min-h-[32px]">
                解锁高价值 AI 临床方案起草与高频数据分析。
              </p>
              <div className="mt-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-black text-[#083190]">
                    ¥19
                  </span>
                  <span className="text-xs text-[#083190] ml-1 font-bold">首月体验价</span>
                  <span className="text-xs text-gray-400 line-through ml-2">原价 ¥39/月</span>
                </div>
                <div className="text-[9.5px] text-gray-400 font-bold mt-1">
                  次月起续费金额：¥34/月
                </div>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <ul className="space-y-3">
                <li className="flex items-start text-xs text-gray-600">
                  <Check className="w-4 h-4 text-blue-600 mr-2 shrink-0 mt-0.5" />
                  <span><b>AI Analysis (智能数据分析)</b> 基础统计模板</span>
                </li>
                <li className="flex items-start text-xs text-gray-600">
                  <Check className="w-4 h-4 text-blue-600 mr-2 shrink-0 mt-0.5" />
                  <span><b>AI Draft</b> 支持 4 大核心章节一键生成</span>
                </li>
                <li className="flex items-start text-xs text-gray-600">
                  <Check className="w-4 h-4 text-blue-600 mr-2 shrink-0 mt-0.5" />
                  <span>单日 200 次 AI 问答/文献提取额度</span>
                </li>
                <li className="flex items-start text-xs text-gray-600">
                  <Check className="w-4 h-4 text-blue-600 mr-2 shrink-0 mt-0.5" />
                  <span>单次最大 10MB 关联医学底稿上传</span>
                </li>
                <li className="flex items-start text-xs text-gray-600">
                  <Check className="w-4 h-4 text-blue-600 mr-2 shrink-0 mt-0.5" />
                  <span>优先合规审查与质控批注通道</span>
                </li>
              </ul>

              <button 
                onClick={() => handleSubscribe({ name: "基础版", price: "39", trialPrice: "19", desc: "首月特惠 + 7天免费试用" })}
                className="w-full py-2.5 bg-[#083190] hover:bg-blue-900 text-white rounded-xl text-xs font-bold mt-8 shadow-xs transition-all hover:scale-[1.01]"
              >
                {isPaid === "基础版" ? "您已激活此权益" : "立即 7 天免费试用"}
              </button>
            </div>
          </div>

          {/* 高级版 */}
          <div className="bg-white rounded-2xl border-2 border-amber-400/70 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden relative">
            <div className="absolute top-0 right-0 bg-amber-400 text-white text-[9.5px] font-black px-3 py-1 rounded-bl-xl shadow-xs">
              🔥 推荐·高级专宠
            </div>
            <div className="p-6 pb-4 border-b border-gray-100 bg-amber-50/10">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block mb-1">
                ULTIMATE EXPERT
              </span>
              <h3 className="text-base font-black text-amber-700 flex items-center">
                个人高级版
              </h3>
              <p className="text-[11px] text-gray-500 mt-1 min-h-[32px]">
                面向复杂、多中心的临床科研项目，全能力无阻碍。
              </p>
              <div className="mt-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-black text-amber-600">
                    ¥49
                  </span>
                  <span className="text-xs text-amber-600 ml-1 font-bold">首月体验价</span>
                  <span className="text-xs text-gray-400 line-through ml-2">原价 ¥99/月</span>
                </div>
                <div className="text-[9.5px] text-gray-400 font-bold mt-1">
                  次月起续费金额：¥89/月
                </div>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <ul className="space-y-3">
                <li className="flex items-start text-xs text-gray-600">
                  <Check className="w-4 h-4 text-amber-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-amber-800 font-bold">解锁全套 12 大章节方案自动起草</span>
                </li>
                <li className="flex items-start text-xs text-gray-600">
                  <Check className="w-4 h-4 text-amber-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-amber-800 font-bold">AI Analysis 动态高级数据分析</span>
                </li>
                <li className="flex items-start text-xs text-gray-600">
                  <Check className="w-4 h-4 text-amber-500 mr-2 shrink-0 mt-0.5" />
                  <span>AI 对话/文献问答无限制额度 (专属超高速并发)</span>
                </li>
                <li className="flex items-start text-xs text-gray-600">
                  <Check className="w-4 h-4 text-amber-500 mr-2 shrink-0 mt-0.5" />
                  <span>支持单次 50MB 药理方案底稿超大批处理</span>
                </li>
                <li className="flex items-start text-xs text-gray-600">
                  <Check className="w-4 h-4 text-amber-500 mr-2 shrink-0 mt-0.5" />
                  <span>Word 一键无水印导出 (100% 样式排版对齐)</span>
                </li>
              </ul>

              <button 
                onClick={() => handleSubscribe({ name: "高级版", price: "99", trialPrice: "49", desc: "高级特惠 + 7天免费试用" })}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold mt-8 shadow-sm transition-all hover:scale-[1.01]"
              >
                {isPaid === "高级版" ? "您已激活此权益" : "立即 7 天免费试用"}
              </button>
            </div>
          </div>
        </div>

        {/* Feature Comparison Table Title */}
        <div className="space-y-4 pt-2">
          <div className="text-center">
            <h2 className="text-[17px] font-black text-gray-800 flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-500 mr-1.5" />
              个人版三大套餐 权益全面对比
            </h2>
            <p className="text-xs text-gray-400 mt-1 font-medium">
              清晰直观展示不同会员版本的额外增值，点击问号可获取功能详细说明
            </p>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-bold text-gray-700 w-1/3">功能模块</th>
                  <th className="p-4 font-bold text-gray-500 text-center w-1/5">个人免费版</th>
                  <th className="p-4 font-bold text-[#083190] text-center w-1/5 bg-[#083190]/3">
                    个人基础版
                  </th>
                  <th className="p-4 font-bold text-amber-700 text-center w-1/5">个人高级版</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {features.map((feat, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-800">
                      <div className="flex items-center space-x-1.5">
                        <span>{feat.name}</span>
                        <span 
                          className="text-gray-400 hover:text-[#083190] cursor-pointer"
                          title={`${feat.name}：ToTrial 系统运营说明。`}
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      <span className="text-[9.5px] text-gray-400 font-medium block mt-0.5">
                        {feat.category}
                      </span>
                    </td>
                    <td className="p-4 text-center text-gray-500">
                      {typeof feat.free === "boolean" ? (
                        feat.free ? "✓" : "❌"
                      ) : (
                        feat.free
                      )}
                    </td>
                    <td className="p-4 text-center font-bold text-[#083190] bg-[#083190]/3">
                      {typeof feat.basic === "boolean" ? (
                        feat.basic ? "✓" : "❌"
                      ) : (
                        feat.basic
                      )}
                    </td>
                    <td className="p-4 text-center font-bold text-amber-600 bg-amber-50/5">
                      {typeof feat.advanced === "boolean" ? (
                        feat.advanced ? "✓" : "❌"
                      ) : (
                        feat.advanced
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ with extra info */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
          <h4 className="text-[12.5px] font-black text-gray-800 mb-4 flex items-center">
            <Info className="w-4 h-4 text-[#083190] mr-1.5" />
            订阅套餐及支付说明
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px] text-gray-500 leading-relaxed">
            <div className="space-y-1">
              <span className="font-bold text-gray-700 block">Q: 7天免费试用期是如何运作的？</span>
              <p>
                选择基础版或高级版订阅，点击“试用”即可模拟激活会员资格。自您激活时刻起 7 天内为纯粹试用阶段，不产生任何账单。
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-gray-700 block">Q: 订阅可以随时取消或变更吗？</span>
              <p>
                可以。您随时可以通过本“订阅计划”面板进行降级、重置或变更订阅方案，更改后将实时更新本地存储的状态并同步到相应工具。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Payment Modal */}
      {showPayModal && selectedPlan && (
        <div className="fixed inset-0 z-[110] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 border border-gray-100 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-[13px] font-black text-gray-800 flex items-center">
                <CreditCard className="w-4 h-4 mr-1.5 text-[#083190]" />
                ToTrial 智能收银台
              </h3>
              <button 
                onClick={() => setShowPayModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            {paySuccess ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100 animate-bounce">
                  <Check className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">模拟支付已完成！</h4>
                  <p className="text-[11px] text-gray-400 mt-1">
                    系统正为您激活【ToTrial {selectedPlan.name}】高级特权
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Plan Info */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-bold">订单内容</span>
                    <span className="text-xs font-black text-gray-800">{selectedPlan.name} · {selectedPlan.desc}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block font-bold">应付金额</span>
                    <span className="text-base font-black text-[#083190]">¥{selectedPlan.trialPrice}</span>
                    <span className="text-[9.5px] text-gray-400 block line-through">原价 ¥{selectedPlan.price}</span>
                  </div>
                </div>

                {/* QR Code and Simulator Notice */}
                <div className="flex flex-col items-center py-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-150">
                  <div className="w-36 h-36 bg-white p-2 rounded-lg border border-gray-100 shadow-sm flex items-center justify-center relative group">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://ai.studio/build?plan=${selectedPlan.name}`}
                      alt="Payment QR" 
                      className="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-white/95 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center">
                      <span className="text-[10px] font-bold text-gray-500">
                        由于此为演示环境，您可以直接点击下方“模拟扫码成功”完成模拟。
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 font-bold">
                    微信/支付宝模拟扫描上方二维码支付
                  </p>

                  {/* Payment selection */}
                  <div className="flex space-x-4 mt-3">
                    <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-bold text-gray-600">
                      <input 
                        type="radio" 
                        name="pay" 
                        checked={payMethod === "wechat"}
                        onChange={() => setPayMethod("wechat")}
                        className="text-[#083190] focus:ring-0"
                      />
                      <span>微信支付</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-bold text-gray-600">
                      <input 
                        type="radio" 
                        name="pay" 
                        checked={payMethod === "alipay"} 
                        onChange={() => setPayMethod("alipay")}
                        className="text-[#083190] focus:ring-0"
                      />
                      <span>支付宝支付</span>
                    </label>
                  </div>
                </div>

                <div className="text-[10px] text-amber-600 font-bold bg-amber-50 rounded p-2.5 leading-relaxed">
                  📢 <b>演示说明：</b>本收银台运行于 Sandbox 沙箱，支付结果和权益存储于本地缓存，<b>不需要</b>任何真实资金支付。
                </div>

                {/* Confirm mock button */}
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => setShowPayModal(false)}
                    className="flex-1 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50"
                  >
                    取消支付
                  </button>
                  <button
                    onClick={handleConfirmPay}
                    className="flex-1 py-2 bg-[#083190] hover:bg-blue-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                  >
                    模拟扫码成功
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
