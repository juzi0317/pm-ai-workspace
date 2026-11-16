import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Copy, 
  Check, 
  Send, 
  Search, 
  Users, 
  User, 
  MessageSquare, 
  CheckSquare, 
  Square,
  AlertCircle
} from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  title: string;
  messages?: { role: string; content: React.ReactNode }[];
}

const DEFAULT_TARGETS = [
  { id: "g1", name: "冠心宁中保临床试验协同群", type: "group", members: 8, subtitle: "申办方、各中心PI、CRC/CRA及机构" },
  { id: "g2", name: "申办方医学与数据协同群", type: "group", members: 5, subtitle: "申办方内部医学专员、数据管理员等" },
  { id: "g3", name: "甘肃省人民医院 GCP 沟通群", type: "group", members: 12, subtitle: "该中心GCP办公室、研究者交流群" },
  { id: "u1", name: "李静", type: "user", role: "申办方医学研究专员", avatar: "李" },
  { id: "u2", name: "朱世文", type: "user", role: "临床协调监查员 CRA", avatar: "朱" },
  { id: "u3", name: "周会菊", type: "user", role: "临床研究协调员 CRC (甘肃省医)", avatar: "周" },
  { id: "u4", name: "韩俊阳", type: "user", role: "主要研究者PI助理", avatar: "韩" },
];

export default function ShareModal({ isOpen, onClose, shareUrl, title, messages = [] }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sentIds, setSentIds] = useState<string[]>([]);
  const [isBatchSending, setIsBatchSending] = useState(false);
  const [shareScope, setShareScope] = useState<"all" | "partial" | "result">("all");

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredTargets = DEFAULT_TARGETS.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.subtitle && t.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (t.role && t.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleSelect = (id: string) => {
    if (sentIds.includes(id)) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSendSingle = (id: string, name: string) => {
    if (sentIds.includes(id)) return;
    setSentIds((prev) => [...prev, id]);
    // Remove from selection if there
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    
    // Simulate IM notification / Toast
    const sound = new Audio(); // optional placeholder
    alert(`已将“${title}”的分享链接直接发送至: ${name}`);
  };

  const handleBatchSend = () => {
    if (selectedIds.length === 0) return;
    setIsBatchSending(true);
    
    setTimeout(() => {
      setSentIds((prev) => [...prev, ...selectedIds]);
      const names = DEFAULT_TARGETS.filter(t => selectedIds.includes(t.id)).map(t => t.name).join('、');
      setSelectedIds([]);
      setIsBatchSending(false);
      alert(`已批量将分享链接直接发送至：\n${names}`);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[150] font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-2xl shadow-2xl border border-gray-150 w-[540px] max-w-[95%] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-[15px] font-bold text-gray-800 flex items-center">
              <MessageSquare className="w-4.5 h-4.5 mr-2 text-[#083190]" />
              分享并推送协同任务
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              分享内容: <strong className="text-gray-600">{title}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-all"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto max-h-[450px]">
                    {/* Share Scope Selection */}
          <div className="space-y-2.5">
            <label className="text-[12px] font-bold text-gray-500">选择分享内容范围</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setShareScope("all")}
                className={`py-2 px-3 rounded-lg text-[12px] font-medium transition-all border ${
                  shareScope === "all" 
                    ? "bg-blue-50 border-[#083190] text-[#083190] shadow-sm" 
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                全部完整记录
              </button>
              <button
                onClick={() => setShareScope("partial")}
                className={`py-2 px-3 rounded-lg text-[12px] font-medium transition-all border flex items-center justify-center space-x-1 ${
                  shareScope === "partial" 
                    ? "bg-blue-50 border-[#083190] text-[#083190] shadow-sm" 
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>自定义勾选部分</span>
              </button>
              <button
                onClick={() => setShareScope("result")}
                className={`py-2 px-3 rounded-lg text-[12px] font-medium transition-all border ${
                  shareScope === "result" 
                    ? "bg-blue-50 border-[#083190] text-[#083190] shadow-sm" 
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                仅最终研报/结论
              </button>
            </div>
            {shareScope === "partial" && (
              <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden mb-4">
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex justify-between items-center">
                  <span className="text-[11px] font-bold text-gray-500">请勾选要分享的对话块</span>
                  <button className="text-[11px] text-[#083190] hover:underline">全选</button>
                </div>
                <div className="max-h-32 overflow-y-auto divide-y divide-gray-100 bg-white">
                  {messages && messages.length > 0 ? (
                    messages.map((msg, idx) => (
                      <label key={idx} className="flex items-start px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors space-x-3">
                        <input type="checkbox" className="mt-0.5 rounded text-[#083190] focus:ring-[#083190]" defaultChecked />
                        <div className="flex-1">
                          <div className="text-[12px] text-gray-800 line-clamp-2">
                            <b>{msg.role === 'user' ? '我' : 'AI'}:</b> {msg.content}
                          </div>
                        </div>
                      </label>
                    ))
                  ) : (
                    <>
                      <label className="flex items-start px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors space-x-3">
                        <input type="checkbox" className="mt-0.5 rounded text-[#083190] focus:ring-[#083190]" defaultChecked />
                        <div className="flex-1">
                          <p className="text-[12px] text-gray-800 line-clamp-1"><b>我:</b> 帮我分析一下这份资料</p>
                        </div>
                      </label>
                      <label className="flex items-start px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors space-x-3">
                        <input type="checkbox" className="mt-0.5 rounded text-[#083190] focus:ring-[#083190]" defaultChecked />
                        <div className="flex-1">
                          <p className="text-[12px] text-gray-800 line-clamp-1"><b>AI:</b> 好的，已为您提取核心信息：[内容片段]...</p>
                        </div>
                      </label>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Link Copier */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-gray-500">分享链接</label>
            <div className="flex space-x-2">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-[12px] font-mono text-gray-600 select-all truncate">
                {shareUrl}
              </div>
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-xl border font-bold text-[12px] flex items-center space-x-1.5 transition-all shrink-0 ${
                  copied 
                    ? "bg-green-50 border-green-200 text-green-600" 
                    : "bg-[#083190] border-[#083190] hover:bg-blue-900 text-white"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>复制链接</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Group and Contact Selector */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-bold text-gray-500">
                推送至群聊或协同成员 <span className="text-[11px] font-normal text-gray-400">(自动在临研通IM发送)</span>
              </label>
              {selectedIds.length > 0 && (
                <button
                  onClick={handleBatchSend}
                  disabled={isBatchSending}
                  className="text-[11px] font-bold text-white bg-[#083190] hover:bg-blue-900 px-3 py-1 rounded-md transition-all flex items-center space-x-1"
                >
                  <Send className="w-3 h-3" />
                  <span>{isBatchSending ? "发送中..." : `批量发送 (${selectedIds.length})`}</span>
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索群聊、姓名、角色职责..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 hover:bg-gray-100/50 focus:bg-white border border-gray-200 focus:border-[#083190] focus:ring-1 focus:ring-[#083190] rounded-xl text-[12px] outline-none transition-all"
              />
            </div>

            {/* List */}
            <div className="border border-gray-100 rounded-xl max-h-56 overflow-y-auto divide-y divide-gray-50 bg-white">
              {filteredTargets.length > 0 ? (
                filteredTargets.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isSent = sentIds.includes(item.id);
                  return (
                    <div 
                      key={item.id}
                      className={`flex items-center justify-between px-4 py-3 hover:bg-blue-50/10 transition-colors ${
                        isSent ? "opacity-75 bg-gray-50/30" : ""
                      }`}
                    >
                      <div 
                        onClick={() => toggleSelect(item.id)}
                        className="flex items-center space-x-3 flex-1 cursor-pointer"
                      >
                        {/* Checkbox */}
                        {!isSent ? (
                          <button className="text-gray-400 hover:text-[#083190] transition-colors shrink-0">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#083190] fill-blue-50" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-300" />
                            )}
                          </button>
                        ) : (
                          <div className="w-4 h-4 flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 text-green-500 stroke-[3px]" />
                          </div>
                        )}

                        {/* Icon or Avatar */}
                        {item.type === "group" ? (
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#083190] flex items-center justify-center font-bold text-sm shrink-0">
                            <Users className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {item.avatar}
                          </div>
                        )}

                        {/* Name Info */}
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-gray-800 flex items-center">
                            {item.name}
                            {item.members && (
                              <span className="ml-1.5 text-[10px] bg-blue-50 text-[#083190] px-1 rounded">
                                {item.members}人
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate mt-0.5">
                            {item.type === "group" ? item.subtitle : item.role}
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleSendSingle(item.id, item.name)}
                        disabled={isSent}
                        className={`ml-4 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shrink-0 flex items-center space-x-1 ${
                          isSent 
                            ? "bg-green-50 text-green-600 cursor-default" 
                            : "bg-blue-50 hover:bg-[#083190] hover:text-white text-[#083190]"
                        }`}
                      >
                        {isSent ? (
                          <>
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            <span>已发送</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            <span>发送</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center">
                  <AlertCircle className="w-6 h-6 mb-2 text-gray-300" />
                  <p className="text-[12px]">未找到匹配的项目群聊或联系人</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2.5">
          <button
            onClick={onClose}
            className="px-4.5 py-2 text-[12px] font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
          >
            完成关闭
          </button>
        </div>
      </motion.div>
    </div>
  );
}
