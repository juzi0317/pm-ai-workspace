import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Copy,
  Check,
  Send,
  Search,
  Users,
  MessageSquare,
  CheckSquare,
  Square,
  AlertCircle,
  FileText,
  FolderOpen,
  UserPlus,
  Globe,
} from "lucide-react";

// ============================================
// 推送目标数据（三类）
// ============================================
interface ShareTarget {
  id: string;
  name: string;
  type: "group" | "user" | "project_member";
  members?: number;
  subtitle?: string;
  role?: string;
  avatar?: string;
}

// 项目成员（动态加载）
const PROJECT_MEMBERS: ShareTarget[] = [
  { id: "pm1", name: "张医生", type: "project_member", role: "成员", avatar: "张" },
  { id: "pm2", name: "李护士", type: "project_member", role: "成员", avatar: "李" },
  { id: "pm3", name: "王研究员", type: "project_member", role: "成员", avatar: "王" },
];

// 群聊
const GROUP_CHATS: ShareTarget[] = [
  { id: "g1", name: "冠心宁项目沟通群", type: "group", members: 8 },
  { id: "g2", name: "申办方医学与数据协同群", type: "group", members: 5 },
  { id: "g3", name: "甘肃省人民医院 GCP 沟通群", type: "group", members: 12 },
];

// 联系人（单聊）
const CONTACTS: ShareTarget[] = [
  { id: "u1", name: "李静", type: "user", role: "申办方医学研究专员", avatar: "李" },
  { id: "u2", name: "朱世文", type: "user", role: "临床协调监查员 CRA", avatar: "朱" },
  { id: "u3", name: "周会菊", type: "user", role: "临床研究协调员 CRC", avatar: "周" },
  { id: "u4", name: "韩俊阳", type: "user", role: "主要研究者PI助理", avatar: "韩" },
];

const ALL_TARGETS = [...PROJECT_MEMBERS, ...GROUP_CHATS, ...CONTACTS];

// ============================================
// 1. 分享配置弹窗（整合版：知识库选项 + 群聊推送）
// ============================================
interface ShareConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  title: string;
  sharerName: string;
  projectName: string;
  messages?: { role: string; content: React.ReactNode }[];
  onConfirm: (includeKnowledgeBase: boolean, sentTargets: string[]) => void;
}

export function ShareConfigModal({
  isOpen,
  onClose,
  shareUrl,
  title,
  sharerName,
  projectName,
  messages = [],
  onConfirm,
}: ShareConfigModalProps) {
  const [copied, setCopied] = useState(false);
  const [includeKB, setIncludeKB] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sentIds, setSentIds] = useState<string[]>([]);
  const [isBatchSending, setIsBatchSending] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTargets = ALL_TARGETS.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.subtitle && t.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (t.role && t.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 按类别分组
  const projectMembers = filteredTargets.filter(t => t.type === "project_member");
  const groupChats = filteredTargets.filter(t => t.type === "group");
  const contacts = filteredTargets.filter(t => t.type === "user");

  const toggleSelect = (id: string) => {
    if (sentIds.includes(id)) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    onConfirm(includeKB, [...sentIds, ...selectedIds]);
    onClose();
  };

  // 渲染单个推送目标（只展示和勾选，移除单个发送按钮）
  const renderTargetItem = (item: ShareTarget) => {
    const isSelected = selectedIds.includes(item.id);

    return (
      <div
        key={item.id}
        className="flex items-center px-4 py-3 hover:bg-blue-50/10 transition-colors border-b border-gray-50 last:border-b-0 cursor-pointer"
        onClick={() => toggleSelect(item.id)}
      >
        <button className="text-gray-400 hover:text-[#083190] transition-colors shrink-0 mr-3">
          {isSelected ? (
            <CheckSquare className="w-4 h-4 text-[#083190] fill-blue-50" />
          ) : (
            <Square className="w-4 h-4 text-gray-300" />
          )}
        </button>
        {item.type === "group" ? (
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#083190] flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
            {item.avatar}
          </div>
        )}
        <div className="min-w-0 flex-1 ml-3">
          <p className="text-[13px] font-medium text-gray-800 flex items-center">
            {item.name}
            {item.members && (
              <span className="ml-1.5 text-[10px] bg-blue-50 text-[#083190] px-1 rounded">
                {item.members}人
              </span>
            )}
          </p>
          <p className="text-[11px] text-gray-400 truncate mt-0.5">
            {item.type === "group" ? "群聊" : item.role}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[150] font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl border border-gray-150 w-[560px] max-w-[95%] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
          <div>
            <h3 className="text-[15px] font-bold text-gray-800 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2 text-[#083190]" />
              分享对话任务
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              分享内容: <strong className="text-gray-600">{title}</strong>
              <span className="ml-2 text-gray-400">分享人: {sharerName}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          {/* 1. 知识库同步选项 */}
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-gray-500">是否同步分享知识库文件？</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIncludeKB(true)}
                className={`py-2.5 px-4 rounded-xl text-[13px] font-medium transition-all border flex items-center justify-center space-x-2 ${
                  includeKB
                    ? "bg-blue-50 border-[#083190] text-[#083190] shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                <span>分享（含知识库）</span>
              </button>
              <button
                onClick={() => setIncludeKB(false)}
                className={`py-2.5 px-4 rounded-xl text-[13px] font-medium transition-all border flex items-center justify-center space-x-2 ${
                  !includeKB
                    ? "bg-blue-50 border-[#083190] text-[#083190] shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>仅分享对话</span>
              </button>
            </div>
            {includeKB && (
              <p className="text-[11px] text-gray-400 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                被分享者可查看该项目知识库内容（只读，实时同步）
              </p>
            )}
          </div>

          {/* 2. 分享链接 */}
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
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "已复制" : "复制链接"}</span>
              </button>
            </div>
            <p className="text-[11px] text-gray-400 flex items-center">
              <Globe className="w-3 h-3 mr-1" />
              公开链接，无需密码，无有效期限制
            </p>
            {includeKB && (
              <p className="text-[11px] text-amber-600 flex items-center mt-1">
                <AlertCircle className="w-3 h-3 mr-1" />
                注：推送给项目成员时知识库实时同步；推送给群聊/联系人时为分享时点快照
              </p>
            )}
          </div>

          {/* 3. 群聊和联系人推送 */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-bold text-gray-500">
                推送至群聊或项目成员 <span className="text-[11px] font-normal text-gray-400">(勾选后统一发送)</span>
              </label>
              {selectedIds.length > 0 && (
                <span className="text-[11px] text-[#083190] font-medium">
                  已选 {selectedIds.length} 项
                </span>
              )}
            </div>

            {/* 搜索 */}
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

            {/* 列表 - 分三类展示 */}
            <div className="border border-gray-100 rounded-xl max-h-64 overflow-y-auto bg-white">
              {/* 项目成员 */}
              {projectMembers.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-[11px] font-bold text-gray-500">当前项目成员</span>
                  </div>
                  {projectMembers.map((item) => renderTargetItem(item))}
                </div>
              )}

              {/* 群聊 */}
              {groupChats.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-[11px] font-bold text-gray-500">我的群聊</span>
                  </div>
                  {groupChats.map((item) => renderTargetItem(item))}
                </div>
              )}

              {/* 联系人 */}
              {contacts.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-[11px] font-bold text-gray-500">联系人</span>
                  </div>
                  {contacts.map((item) => renderTargetItem(item))}
                </div>
              )}

              {filteredTargets.length === 0 && (
                <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center">
                  <AlertCircle className="w-6 h-6 mb-2 text-gray-300" />
                  <p className="text-[12px]">未找到匹配的群聊或联系人</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - 移除关闭按钮，保持简洁 */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
          <button
            onClick={handleConfirm}
            className="px-4 py-1.5 text-[12px] font-bold text-white bg-[#083190] hover:bg-blue-900 rounded-lg flex items-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{selectedIds.length > 0 ? `复制链接并推送 (${selectedIds.length})` : "复制链接"}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================
// 2. 被分享者查看页面
// ============================================
interface SharedConversationViewProps {
  sharerName: string;
  projectName: string;
  includeKnowledgeBase: boolean;
  messages: { role: "user" | "ai"; content: string }[];
  knowledgeBaseDocs?: { name: string; size: string; status: string }[];
}

export function SharedConversationView({
  sharerName,
  projectName,
  includeKnowledgeBase,
  messages,
  knowledgeBaseDocs = [],
}: SharedConversationViewProps) {
  const [input, setInput] = useState("");
  const [localMessages, setLocalMessages] = useState(messages);

  const handleSend = () => {
    if (!input.trim()) return;
    setLocalMessages((prev) => [
      ...prev,
      { role: "user", content: input },
      { role: "ai", content: `（AI 回答基于项目「${projectName}」知识库）针对您的问题...` },
    ]);
    setInput("");
  };

  return (
    <div className="flex h-screen bg-[#f4f6f8] font-sans">
      {/* 左侧：对话区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部：分享人信息 */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#083190] text-white flex items-center justify-center text-sm font-bold">
              {sharerName[0]}
            </div>
            <div>
              <p className="text-[14px] font-bold text-gray-800">{sharerName} 分享的对话</p>
              <p className="text-[11px] text-gray-400">来自项目：{projectName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {includeKnowledgeBase && (
              <span className="text-[11px] text-[#083190] bg-blue-50 px-2 py-1 rounded-md flex items-center">
                <FolderOpen className="w-3 h-3 mr-1" />
                知识库已同步
              </span>
            )}
            <button className="text-[12px] text-gray-500 hover:text-[#083190] flex items-center">
              <Copy className="w-3.5 h-3.5 mr-1" />
              再次分享
            </button>
          </div>
        </div>

        {/* 对话内容 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {localMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-[#083190] text-white rounded-br-sm"
                  : "bg-white border border-gray-100 rounded-bl-sm shadow-sm"
              }`}>
                <p className="text-[13px] leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 输入框 */}
        <div className="bg-white border-t border-gray-100 px-6 py-4 shrink-0">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="请输入您的问题..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#083190]"
            />
            <button
              onClick={handleSend}
              className="bg-[#083190] hover:bg-blue-900 text-white rounded-xl px-5 py-2.5 text-[13px] font-bold"
            >
              发送
            </button>
          </div>
        </div>
      </div>

      {/* 右侧：知识库面板（仅当同步知识库时显示） */}
      {includeKnowledgeBase && (
        <div className="w-[320px] bg-white border-l border-gray-100 flex flex-col shrink-0">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-gray-800 flex items-center">
              <FolderOpen className="w-4 h-4 mr-2 text-[#083190]" />
              项目知识库
            </h3>
            <span className="text-[11px] text-gray-400">实时同步</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {knowledgeBaseDocs.map((doc, idx) => (
              <div key={idx} className="border border-gray-100 rounded-xl p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-2">
                  <FileText className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-gray-800 truncate">{doc.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] text-gray-400">{doc.size}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        doc.status === "已向量化"
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-500"
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// 3. 项目成员管理弹窗
// ============================================
interface MemberManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  isCreator: boolean;
  members: { id: string; name: string; avatar: string; role: "创建者" | "成员"; joinDate: string }[];
  onInvite: (phone: string) => void;
  onRemove: (memberId: string) => void;
}

export function MemberManagementModal({
  isOpen,
  onClose,
  projectName,
  isCreator,
  members,
  onInvite,
  onRemove,
}: MemberManagementModalProps) {
  const [invitePhone, setInvitePhone] = useState("");
  const [showInviteInput, setShowInviteInput] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[150] font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl border border-gray-150 w-[520px] max-w-[95%] overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-bold text-gray-800 flex items-center">
              <Users className="w-4 h-4 mr-2 text-[#083190]" />
              项目成员管理
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">{projectName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* 成员列表 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-bold text-gray-500">项目成员 ({members.length})</label>
              {isCreator && (
                <button
                  onClick={() => setShowInviteInput(true)}
                  className="text-[12px] text-[#083190] hover:underline flex items-center"
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1" />
                  邀请成员
                </button>
              )}
            </div>

            {/* 邀请输入框 */}
            <AnimatePresence>
              {showInviteInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="tel"
                      value={invitePhone}
                      onChange={(e) => setInvitePhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                      placeholder="请输入11位手机号码"
                      className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-[#083190]"
                    />
                    <button
                      onClick={() => {
                        const isValidPhone = /^1[3-9]\d{9}$/.test(invitePhone);
                        if (isValidPhone) {
                          onInvite(invitePhone);
                          setInvitePhone("");
                          setShowInviteInput(false);
                        } else {
                          alert("请输入正确的11位手机号码");
                        }
                      }}
                      disabled={!invitePhone}
                      className={`rounded-lg px-3 py-1.5 text-[12px] font-bold transition-colors ${
                        invitePhone ? "bg-[#083190] text-white hover:bg-blue-900" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      发送邀请
                    </button>
                    <button
                      onClick={() => setShowInviteInput(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {invitePhone && invitePhone.length > 0 && invitePhone.length < 11 && (
                    <p className="text-[11px] text-orange-500">请输入完整的11位手机号</p>
                  )}
                  {invitePhone && invitePhone.length === 11 && !/^1[3-9]\d{9}$/.test(invitePhone) && (
                    <p className="text-[11px] text-red-500">手机号格式不正确</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 成员列表 */}
            <div className="border border-gray-100 rounded-xl divide-y divide-gray-50">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      member.role === "创建者"
                        ? "bg-[#083190] text-white"
                        : "bg-orange-50 text-orange-600"
                    }`}>
                      {member.avatar}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-gray-800">
                        {member.name}
                        {member.role === "创建者" && (
                          <span className="ml-2 text-[10px] bg-[#083190] text-white px-1.5 py-0.5 rounded">
                            创建者
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-gray-400">加入时间：{member.joinDate}</p>
                    </div>
                  </div>

                  {isCreator && member.role === "成员" && (
                    <button
                      onClick={() => {
                        if (confirm(`确认移除成员「${member.name}」？移除后该用户将无法访问该项目`)) {
                          onRemove(member.id);
                        }
                      }}
                      className="text-[11px] text-gray-400 hover:text-red-500 flex items-center"
                    >
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      移除
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 权限说明 */}
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-[11px] font-bold text-gray-500 mb-2">权限说明</p>
            <div className="space-y-1 text-[11px] text-gray-600">
              <p>• <strong>创建者</strong>：添加/删除知识、邀请/移除成员、分享对话</p>
              <p>• <strong>成员</strong>：查看知识、项目问答、分享对话</p>
              <p>• <strong>注</strong>：对话属于个人，知识库属于项目</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
