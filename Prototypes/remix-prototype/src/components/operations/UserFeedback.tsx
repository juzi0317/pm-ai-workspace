import React, { useState } from "react";
import { MessageSquare, Check, AlertCircle, FileText, Send, MessageCircle } from "lucide-react";

export default function UserFeedback() {
  const [formData, setFormData] = useState({
    title: "",
    category: "functional",
    content: "",
    contact: "coquiprendergast517@gmail.com",
    screenshotName: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    setIsSubmitting(true);
    
    // Track feature usage frequency
    try {
      const stats = localStorage.getItem("totrial_behavior_stats");
      const parsed = stats ? JSON.parse(stats) : { registrations: 342, usages: {}, dwellTime: 0 };
      parsed.usages["提交用户反馈"] = (parsed.usages["提交用户反馈"] || 0) + 1;
      localStorage.setItem("totrial_behavior_stats", JSON.stringify(parsed));
      window.dispatchEvent(new Event("totrial_behavior_updated"));
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => {
      // Clear form
      setFormData({
        title: "",
        category: "functional",
        content: "",
        contact: "coquiprendergast517@gmail.com",
        screenshotName: ""
      });

      setIsSubmitting(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3500);

      // Auto-open chatbot with a pre-filled user issue so they can chat with the robot immediately
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('totrial_toggle_microchat', { 
          detail: { 
            contactId: 'ai-bot',
            message: `您好！我刚刚提交了一个反馈意见。我们希望能够了解一下修复进度和大概耗时。`
          } 
        }));
      }, 1500);

    }, 1000);
  };

  const handleOpenAiBot = () => {
    window.dispatchEvent(new CustomEvent('totrial_toggle_microchat', { 
      detail: { contactId: 'ai-bot' } 
    }));
  };

  return (
    <div className="flex-1 bg-gray-50/50 flex flex-col font-sans h-full overflow-y-auto pb-12">
      
      {/* Top Banner section */}
      <div className="bg-gradient-to-r from-blue-50/80 to-white text-gray-900 py-8 px-8 shrink-0 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(59,130,246,0.08),transparent)] pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-1.5 bg-blue-100/50 px-3 py-1 rounded-full text-blue-700 text-xs font-bold border border-blue-200 backdrop-blur-sm mb-3">
            <MessageSquare className="w-3.5 h-3.5 text-[#2b64e3]" />
            <span>用户反馈通道</span>
          </div>
          <h1 className="text-[22px] font-black tracking-tight text-gray-900 mb-2">
            我们倾听您的每一个建议
          </h1>
          <p className="text-[12.5px] text-gray-500 max-w-xl leading-relaxed">
            您在使用 ToTrial 临研通中遇到的任何异常或好建议，欢迎随时提交。我们技术团队将极速回复并解决。
          </p>
        </div>
        <div className="mt-4 md:mt-0 relative z-10 text-[11px] bg-white text-gray-700 shadow-sm px-4 py-2 rounded-lg border border-gray-200 font-bold flex items-center">
          <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
          24小时人工专线在线
        </div>
      </div>

      {/* Main Single Column Form Grid */}
      <div className="max-w-2xl mx-auto w-full px-4 mt-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <h2 className="text-[15px] font-black text-gray-800 flex items-center">
              <AlertCircle className="w-4 h-4 text-[#083190] mr-1.5" />
              填写反馈表单
            </h2>
            <span className="text-[11px] text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded border border-gray-100/50">
              极速响应通道
            </span>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase">反馈类型</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-gray-150 rounded-xl px-3.5 py-2.5 text-xs bg-white outline-none focus:border-[#083190] transition-colors"
              >
                <option value="functional">🐞 功能性问题 / 系统报错</option>
                <option value="suggestion">💡 功能优化 / 新需求建议</option>
                <option value="performance">⚡ 性能卡顿 / 加速体验</option>
                <option value="other">💬 其他咨询或反馈</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase">问题主题</label>
              <input
                type="text"
                required
                placeholder="一句话简要概括您遇到的问题"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-150 rounded-xl px-3.5 py-2.5 text-xs bg-white outline-none focus:border-[#083190] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase">详情说明</label>
              <textarea
                required
                rows={5}
                placeholder="请详细描述异常发生所在的模块、您的具体需求，或可提供相关的药理/参考文献背景信息，以便我们专家组快速核对复现..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full border border-gray-150 rounded-xl px-3.5 py-2.5 text-xs bg-white outline-none focus:border-[#083190] transition-colors resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase">截图/底稿图片（支持点击或拖拽上传）</label>
              <div className="border border-gray-150 border-dashed rounded-xl p-4 text-center bg-gray-50/30 hover:bg-gray-50 transition-colors cursor-pointer relative group">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, screenshotName: file.name });
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <FileText className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                <span className="text-[11px] text-gray-400 block font-bold">
                  {formData.screenshotName || "点击上传或将问题图片拖拽至此"}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase">联系方式</label>
              <input
                type="text"
                required
                placeholder="您的邮箱或联系电话 (自动绑定账号)"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full border border-gray-150 rounded-xl px-3.5 py-2.5 text-xs bg-white outline-none focus:border-[#083190] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#083190] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-1"
            >
              {isSubmitting ? (
                <span>正在投递到反馈中心...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>提交反馈反馈单</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Dynamic AI Bot Promo Banner */}
        <div className="mt-6 bg-[#083190]/5 rounded-2xl border border-[#083190]/10 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-12 h-12 bg-white rounded-xl border border-[#083190]/10 flex items-center justify-center text-2xl shadow-sm shrink-0">
            🤖
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h4 className="text-xs font-black text-gray-800">
              需要即时智能解答？欢迎调遣「临研通AI智能助手」
            </h4>
            <p className="text-[11.5px] text-gray-500 mt-1 leading-relaxed">
              我们已将大模型解答功能统一迁移至右下角的微聊群组中。我们的 **临研通智能客服机器人** 全天候 24h 在线，可立即帮您起草解答、处理BUG跟进和演示VIP产品。
            </p>
            <button
              onClick={handleOpenAiBot}
              className="mt-3 inline-flex items-center space-x-1 px-3 py-1.5 bg-white border border-[#083190]/20 text-[#083190] hover:bg-blue-50/50 rounded-lg text-[11px] font-bold transition-all shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>立即与 临研通AI助手 开启对话</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast alert */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 z-[120] bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Check className="w-4 h-4 mr-2" />
          <span>反馈提交成功！客服机器人已在右下角微聊群中为您建立会话并即刻开启智能分析。</span>
        </div>
      )}
    </div>
  );
}
