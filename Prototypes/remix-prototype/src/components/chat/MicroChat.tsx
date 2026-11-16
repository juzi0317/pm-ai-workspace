import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Search,
  Phone,
  Video,
  MoreVertical,
  Send,
  Paperclip,
  Image as ImageIcon,
  Smile,
  Plus,
  Users,
  CheckSquare,
  Square,
  Info,
  UserPlus,
  Settings,
  UserMinus,
} from "lucide-react";

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar: string;
  online: boolean;
  lastMessage?: string;
  time?: string;
  unread?: number;
}

const CONTACTS: Contact[] = [
  {
    id: "ai-bot",
    name: "临研通智能客服",
    role: "AI 智能问答机器人",
    avatar: "🤖",
    online: true,
    lastMessage: "您好！我是您的临研通专属AI助手，随时为您服务。",
    time: "现在",
  },
  {
    id: "notif-share",
    name: "分享通知",
    role: "系统通知",
    avatar: "",
    online: true,
    lastMessage: "小雨滴 分享了对话「GCP中SAE的报告时限...」给你",
    time: "刚刚",
    unread: 1,
  },
  {
    id: "notif-invite",
    name: "成员邀请",
    role: "系统通知",
    avatar: "",
    online: true,
    lastMessage: "小雨滴 邀请你加入项目「冠心宁片中保临床方案」",
    time: "刚刚",
    unread: 1,
  },
  {
    id: "1",
    name: "李静 (CRC)",
    role: "临床研究协调员",
    avatar: "李",
    online: true,
    lastMessage: "好的，我已经核对了最新的入排标准。",
    time: "10:42",
    unread: 2,
  },
  {
    id: "2",
    name: "王医生 (PI)",
    role: "主要研究者",
    avatar: "王",
    online: false,
    lastMessage: "下午三点确认一下试验方案。",
    time: "昨天",
  },
  {
    id: "3",
    name: "张主管 (CRA)",
    role: "临床监查员",
    avatar: "张",
    online: true,
    lastMessage: "访视报告已经上传，请查收。",
    time: "星期一",
  },
  {
    id: "4",
    name: "刘药师",
    role: "药物管理员",
    avatar: "刘",
    online: true,
    lastMessage: "这批试验用药已经入库。",
    time: "星期一",
  },
];

interface GroupChat {
  id: string;
  name: string;
  role: string;
  avatar: string;
  online: true;
  lastMessage: string;
  time: string;
  memberCount: number;
  memberIds: string[];
  ownerId: string; // 群主ID
}

// 创建群聊弹窗组件
function CreateGroupModal({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, memberIds: string[]) => void;
}) {
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const AVAILABLE_CONTACTS = CONTACTS.filter(c => !c.id.startsWith("notif-") && c.id !== "ai-bot");

  const filteredContacts = AVAILABLE_CONTACTS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev: string[]) =>
      prev.includes(id) ? prev.filter((i: string) => i !== id) : [...prev, id]
    );
  };

  const handleCreate = () => {
    if (!groupName.trim() || selectedIds.length === 0) return;
    onCreate(groupName.trim(), selectedIds);
    setGroupName("");
    setSelectedIds([]);
    setSearchQuery("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200] font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[480px] max-w-[95%] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-[15px] font-bold text-gray-800 flex items-center">
            <Users className="w-4 h-4 mr-2 text-[#083190]" />
            新建群聊
          </h3>
          <button
            onClick={() => { setGroupName(""); setSelectedIds([]); setSearchQuery(""); onClose(); }}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto max-h-[500px]">
          {/* 群聊名称 */}
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-gray-500">
              群聊名称 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="请输入群聊名称..."
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#083190] transition-colors"
            />
          </div>

          {/* 选择联系人 */}
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-gray-500">
              选择联系人{" "}
              {selectedIds.length > 0 && (
                <span className="text-[#083190] font-normal">({selectedIds.length}人已选)</span>
              )}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索姓名、角色..."
                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-[13px] outline-none focus:border-[#083190] transition-colors"
              />
            </div>
          </div>

          {/* 联系人列表 */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="max-h-[200px] overflow-y-auto divide-y divide-gray-50">
              {filteredContacts.map((contact) => {
                const isSelected = selectedIds.includes(contact.id);
                return (
                  <div
                    key={contact.id}
                    onClick={() => toggleSelect(contact.id)}
                    className="flex items-center px-4 py-3 hover:bg-blue-50/30 transition-colors cursor-pointer"
                  >
                    <button className="text-gray-400 hover:text-[#083190] transition-colors shrink-0 mr-3">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#083190] fill-blue-50" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-300" />
                      )}
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-medium text-xs shrink-0">
                      {contact.avatar}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-gray-800">{contact.name}</p>
                      <p className="text-[11px] text-gray-400">{contact.role}</p>
                    </div>
                  </div>
                );
              })}
              {filteredContacts.length === 0 && (
                <p className="text-center text-[12px] text-gray-400 py-6">未找到匹配的联系人</p>
              )}
            </div>
          </div>

          {/* 提示 */}
          <div className="flex items-start space-x-2 bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3">
            <Info className="w-4 h-4 text-[#083190] shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-500 leading-relaxed">
              群聊独立于项目，不支持知识库共享。创建者自动成为群主，可添加/移除群成员。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50/30">
          <button
            onClick={() => { setGroupName(""); setSelectedIds([]); setSearchQuery(""); onClose(); }}
            className="px-5 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-[13px] font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedIds.length === 0}
            className={`px-5 py-2 rounded-xl text-[13px] font-bold shadow-md transition-all ${
              groupName.trim() && selectedIds.length > 0
                ? "bg-[#083190] hover:bg-blue-900 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            创建群聊
          </button>
        </div>
      </div>
    </div>
  );
}

// 群聊成员管理弹窗组件
function GroupSettingsModal({
  isOpen,
  onClose,
  group,
  isOwner,
  onAddMembers,
  onRemoveMember,
  onTransferOwner,
  onLeaveGroup,
}: {
  isOpen: boolean;
  onClose: () => void;
  group: GroupChat;
  isOwner: boolean;
  onAddMembers: (memberIds: string[]) => void;
  onRemoveMember: (memberId: string) => void;
  onTransferOwner: (newOwnerId: string) => void;
  onLeaveGroup: () => void;
}) {
  const [showAddMode, setShowAddMode] = useState(false);
  const [showTransferMode, setShowTransferMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 获取所有可添加的联系人（排除已在群里的）
  const availableContacts = CONTACTS.filter(c => 
    !c.id.startsWith("notif-") && 
    c.id !== "ai-bot" && 
    !group.memberIds.includes(c.id)
  );

  const filteredContacts = availableContacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 获取当前群成员信息
  const currentMembers = group.memberIds.map(id => 
    CONTACTS.find(c => c.id === id)
  ).filter(Boolean);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev: string[]) =>
      prev.includes(id) ? prev.filter((i: string) => i !== id) : [...prev, id]
    );
  };

  const handleAddMembers = () => {
    if (selectedIds.length === 0) return;
    onAddMembers(selectedIds);
    setSelectedIds([]);
    setSearchQuery("");
    setShowAddMode(false);
  };

  const handleRemoveMember = (memberId: string) => {
    const member = CONTACTS.find(c => c.id === memberId);
    if (!member) return;
    
    if (confirm(`确定要将 ${member.name} 移出群聊吗？`)) {
      onRemoveMember(memberId);
    }
  };

  const handleTransferOwner = (memberId: string) => {
    const member = CONTACTS.find(c => c.id === memberId);
    if (!member) return;
    
    if (confirm(`确定要将群主身份转让给 ${member.name} 吗？转让后你将失去群主权限。`)) {
      onTransferOwner(memberId);
      setShowTransferMode(false);
    }
  };

  const handleLeaveGroup = () => {
    if (isOwner) {
      alert("请先转让群主身份后再退出群聊");
      setShowTransferMode(true);
      return;
    }
    if (confirm("确定要退出该群聊吗？退出后将不再接收群消息。")) {
      onLeaveGroup();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200] font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[480px] max-w-[95%] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 max-h-[600px]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
          <h3 className="text-[15px] font-bold text-gray-800 flex items-center">
            <Settings className="w-4 h-4 mr-2 text-[#083190]" />
            {showAddMode ? "添加成员" : showTransferMode ? "转让群主" : "群聊设置"}
          </h3>
          <button
            onClick={() => { 
              setShowAddMode(false);
              setShowTransferMode(false);
              setSelectedIds([]);
              setSearchQuery("");
              onClose(); 
            }}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {showTransferMode ? (
            // 转让群主模式
            <div className="p-6 space-y-5">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-orange-700 leading-relaxed">
                    请选择一位成员作为新群主。转让后你将失去群主权限，新群主可以管理群成员。
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-bold text-gray-500">
                  选择新群主
                </label>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-50">
                    {currentMembers.map((member) => {
                      if (!member) return null;
                      const isMemberOwner = group.ownerId === member.id;
                      if (isMemberOwner) return null; // 不显示当前群主
                      return (
                        <div
                          key={member.id}
                          onClick={() => handleTransferOwner(member.id)}
                          className="flex items-center px-4 py-3 hover:bg-orange-50 transition-colors cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-medium text-xs shrink-0">
                            {member.avatar}
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-gray-800">{member.name}</p>
                            <p className="text-[11px] text-gray-400">{member.role}</p>
                          </div>
                          <span className="text-[11px] text-orange-500 font-medium">点击转让</span>
                        </div>
                      );
                    })}
                    {currentMembers.length <= 1 && (
                      <p className="text-center text-[12px] text-gray-400 py-6">
                        群内没有其他成员可转让
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : showAddMode ? (
            // 添加成员模式
            <div className="p-6 space-y-5">
              {/* 搜索框 */}
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-gray-500">
                  选择联系人{" "}
                  {selectedIds.length > 0 && (
                    <span className="text-[#083190] font-normal">({selectedIds.length}人已选)</span>
                  )}
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索姓名、角色..."
                    className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-[13px] outline-none focus:border-[#083190] transition-colors"
                  />
                </div>
              </div>

              {/* 联系人列表 */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="max-h-[250px] overflow-y-auto divide-y divide-gray-50">
                  {filteredContacts.map((contact) => {
                    const isSelected = selectedIds.includes(contact.id);
                    return (
                      <div
                        key={contact.id}
                        onClick={() => toggleSelect(contact.id)}
                        className="flex items-center px-4 py-3 hover:bg-blue-50/30 transition-colors cursor-pointer"
                      >
                        <button className="text-gray-400 hover:text-[#083190] transition-colors shrink-0 mr-3">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#083190] fill-blue-50" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-300" />
                          )}
                        </button>
                        <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-medium text-xs shrink-0">
                          {contact.avatar}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-gray-800">{contact.name}</p>
                          <p className="text-[11px] text-gray-400">{contact.role}</p>
                        </div>
                      </div>
                    );
                  })}
                  {filteredContacts.length === 0 && (
                    <p className="text-center text-[12px] text-gray-400 py-6">
                      {availableContacts.length === 0 ? "所有联系人已在群中" : "未找到匹配的联系人"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // 群设置模式
            <div className="p-6 space-y-5">
              {/* 群聊信息 */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-[#083190] text-white flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[14px] font-bold text-gray-800">{group.name}</h4>
                    <p className="text-[12px] text-gray-500 mt-0.5">
                      {group.memberCount} 名成员 · {isOwner ? "你是群主" : "你是成员"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 成员列表 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-bold text-gray-500">
                    群成员 ({currentMembers.length})
                  </label>
                  {isOwner && (
                    <button
                      onClick={() => setShowAddMode(true)}
                      className="text-[12px] text-[#083190] hover:underline flex items-center space-x-1 font-medium"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>添加成员</span>
                    </button>
                  )}
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-50">
                    {currentMembers.map((member) => {
                      if (!member) return null;
                      const isMemberOwner = group.ownerId === member.id;
                      return (
                        <div
                          key={member.id}
                          className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-medium text-xs shrink-0">
                            {member.avatar}
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-[13px] font-medium text-gray-800">{member.name}</p>
                              {isMemberOwner && (
                                <span className="text-[10px] bg-[#083190] text-white px-2 py-0.5 rounded-full">
                                  群主
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400">{member.role}</p>
                          </div>
                          {isOwner && !isMemberOwner && (
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleTransferOwner(member.id)}
                                className="text-orange-400 hover:text-orange-600 p-1.5 rounded-lg hover:bg-orange-50 transition-all"
                                title="转让群主"
                              >
                                <UserPlus className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                                title="移除成员"
                              >
                                <UserMinus className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 提示 */}
              <div className="flex items-start space-x-2 bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3">
                <Info className="w-4 h-4 text-[#083190] shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  {isOwner 
                    ? "作为群主，你可以添加或移除群成员。" 
                    : "仅群主可以管理群成员。"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between bg-gray-50/30 shrink-0">
          {showAddMode || showTransferMode ? (
            <>
              <button
                onClick={() => {
                  setShowAddMode(false);
                  setShowTransferMode(false);
                  setSelectedIds([]);
                  setSearchQuery("");
                }}
                className="px-5 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-[13px] font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              {showAddMode && (
                <button
                  onClick={handleAddMembers}
                  disabled={selectedIds.length === 0}
                  className={`px-5 py-2 rounded-xl text-[13px] font-bold shadow-md transition-all ${
                    selectedIds.length > 0
                      ? "bg-[#083190] hover:bg-blue-900 text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  添加 ({selectedIds.length})
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={handleLeaveGroup}
                className="px-5 py-2 bg-white border border-red-200 text-red-500 rounded-xl text-[13px] font-medium hover:bg-red-50 transition-colors"
              >
                退出群聊
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-[#083190] hover:bg-blue-900 text-white rounded-xl text-[13px] font-bold shadow-md transition-colors"
              >
                关闭
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// 添加联系人弹窗组件
function AddContactModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (phone: string, name: string) => void;
}) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const isValidPhone = /^1[3-9]\d{9}$/.test(phone);

  const handleAdd = () => {
    if (!name.trim()) {
      setError("请输入联系人姓名");
      return;
    }
    if (!isValidPhone) {
      setError("请输入正确的手机号码");
      return;
    }
    setError("");
    onAdd(phone, name.trim());
    setPhone("");
    setName("");
    onClose();
  };

  const handleClose = () => {
    setPhone("");
    setName("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200] font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[420px] max-w-[95%] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-[15px] font-bold text-gray-800 flex items-center">
            <UserPlus className="w-4 h-4 mr-2 text-[#083190]" />
            添加联系人
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-gray-500">
              联系人姓名 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setName(e.target.value); setError(""); }}
              placeholder="请输入联系人姓名..."
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#083190] transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-bold text-gray-500">
              手机号码 <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 11)); setError(""); }}
              placeholder="请输入11位手机号码..."
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#083190] transition-colors"
            />
            {phone && !isValidPhone && phone.length > 0 && (
              <p className="text-[11px] text-orange-500 mt-1">请输入正确的11位手机号</p>
            )}
          </div>

          {error && (
            <div className="flex items-center space-x-2 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
              <Info className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-[12px] text-red-500">{error}</p>
            </div>
          )}

          <div className="flex items-start space-x-2 bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3">
            <Info className="w-4 h-4 text-[#083190] shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-500 leading-relaxed">
              添加联系人后可进行1对1单聊。对方会收到添加通知。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50/30">
          <button
            onClick={handleClose}
            className="px-5 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-[13px] font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleAdd}
            disabled={!name.trim() || !isValidPhone}
            className={`px-5 py-2 rounded-xl text-[13px] font-bold shadow-md transition-all ${
              name.trim() && isValidPhone
                ? "bg-[#083190] hover:bg-blue-900 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            添加联系人
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MicroChat({ onClose }: { onClose: () => void }) {
  const [conversations, setConversations] = useState<
    Record<
      string,
      { role: "user" | "contact"; content: string; time: string }[]
    >
  >({
    "ai-bot": [
      {
        role: "contact",
        content: "您好！我是临研通专属AI助手。您可以随时在这里向我咨询系统使用方法、反馈软件异常、或者了解产品收费套餐。我会全天候为您解答！",
        time: "现在",
      }
    ],
    "notif-share": [
      {
        role: "contact",
        content: "📩 分享通知\n\n小雨滴 分享了对话给你\n\n对话标题：GCP中SAE的报告时限是什么？\n项目：冠心宁片中保临床方案\n\n📋 分享内容：\n• GCP中SAE的报告时限是什么？\n• 根据《药物临床试验质量管理规范》(2020版)...\n\n[查看对话] [接受] [忽略]",
        time: "刚刚",
      },
    ],
    "notif-invite": [
      {
        role: "contact",
        content: " 成员邀请通知\n\n小雨滴 邀请你加入项目\n\n项目名称：冠心宁片中保临床方案\n项目角色：成员\n\n你已自动成为该项目成员，点击查看项目详情。",
        time: "刚刚",
      },
    ],
    "1": [
      {
        role: "contact",
        content: "您好，麻烦看下001号受试者的血常规化验单。",
        time: "10:35",
      },
      {
        role: "user",
        content: "收到，我马上在系统里核对一下。",
        time: "10:36",
      },
      {
        role: "contact",
        content: "好的，我已经核对了最新的入排标准。确认无误后会完成签署。",
        time: "10:42",
      },
    ],
    "2": [
      {
        role: "user",
        content: "王医生，明天下午的启动会需要您致辞，您看时间方便吗？",
        time: "昨天",
      },
      {
        role: "contact",
        content: "没问题。下午三点确认一下试验方案。",
        time: "昨天",
      },
    ],
    "3": [
      {
        role: "contact",
        content: "这次稽查发现了几处文档签署日期的问题。",
        time: "星期一",
      },
      {
        role: "contact",
        content: "访视报告已经上传，请查收。",
        time: "星期一",
      },
    ],
    "4": [
      { role: "contact", content: "这批试验用药已经入库。", time: "星期一" },
    ],
  });

  const [activeContactId, setActiveContactId] = useState("ai-bot");
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [customContacts, setCustomContacts] = useState<Contact[]>([]);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");

  // 当前用户ID（模拟）
  const currentUserId = "current-user";

  // 创建群聊处理函数
  const handleCreateGroup = (name: string, memberIds: string[]) => {
    const groupId = `group-${Date.now()}`;
    const memberNames = memberIds
      .map(id => CONTACTS.find(c => c.id === id)?.name)
      .filter(Boolean)
      .join("、");
    const newGroup: GroupChat = {
      id: groupId,
      name,
      role: `${memberIds.length + 1}人群`,
      avatar: "",
      online: true,
      lastMessage: `群聊已创建，成员：你、${memberNames}`,
      time: "刚刚",
      memberCount: memberIds.length + 1,
      memberIds,
      ownerId: currentUserId, // 当前用户是群主
    };
    setGroupChats(prev => [newGroup, ...prev]);
    setConversations(prev => ({
      ...prev,
      [groupId]: [
        {
          role: "contact",
          content: ` 群聊已创建\n\n欢迎加入「${name}」群聊！\n\n成员：你、${memberNames}\n\n 提示：群聊独立于项目，不支持知识库共享。`,
          time: "刚刚",
        },
      ],
    }));
    setActiveContactId(groupId);
  };

  // 添加群成员处理函数
  const handleAddMembersToGroup = (memberIds: string[]) => {
    const activeGroup = groupChats.find(g => g.id === activeContactId);
    if (!activeGroup) return;

    const memberNames = memberIds
      .map(id => CONTACTS.find(c => c.id === id)?.name)
      .filter(Boolean)
      .join("、");

    setGroupChats(prev => prev.map(g => {
      if (g.id === activeContactId) {
        return {
          ...g,
          memberIds: [...g.memberIds, ...memberIds],
          memberCount: g.memberCount + memberIds.length,
          role: `${g.memberCount + memberIds.length}人群`,
        };
      }
      return g;
    }));

    setConversations(prev => ({
      ...prev,
      [activeContactId]: [
        ...(prev[activeContactId] || []),
        {
          role: "contact",
          content: ` ${memberNames} 加入了群聊`,
          time: "刚刚",
        },
      ],
    }));
  };

  // 移除群成员处理函数
  const handleRemoveMemberFromGroup = (memberId: string) => {
    const activeGroup = groupChats.find(g => g.id === activeContactId);
    if (!activeGroup) return;

    const member = CONTACTS.find(c => c.id === memberId);
    if (!member) return;

    setGroupChats(prev => prev.map(g => {
      if (g.id === activeContactId) {
        return {
          ...g,
          memberIds: g.memberIds.filter(id => id !== memberId),
          memberCount: g.memberCount - 1,
          role: `${g.memberCount - 1}人群`,
        };
      }
      return g;
    }));

    setConversations(prev => ({
      ...prev,
      [activeContactId]: [
        ...(prev[activeContactId] || []),
        {
          role: "contact",
          content: ` ${member.name} 被移出群聊`,
          time: "刚刚",
        },
      ],
    }));
  };

  // 转让群主处理函数
  const handleTransferOwner = (newOwnerId: string) => {
    const activeGroup = groupChats.find(g => g.id === activeContactId);
    if (!activeGroup) return;

    const newOwner = CONTACTS.find(c => c.id === newOwnerId);
    if (!newOwner) return;

    setGroupChats(prev => prev.map(g => {
      if (g.id === activeContactId) {
        return {
          ...g,
          ownerId: newOwnerId,
        };
      }
      return g;
    }));

    setConversations(prev => ({
      ...prev,
      [activeContactId]: [
        ...(prev[activeContactId] || []),
        {
          role: "contact",
          content: ` ${newOwner.name} 已成为新群主`,
          time: "刚刚",
        },
      ],
    }));
  };

  // 退出群聊处理函数
  const handleLeaveGroup = () => {
    const activeGroup = groupChats.find(g => g.id === activeContactId);
    if (!activeGroup) return;

    // 从群聊列表中移除
    setGroupChats(prev => prev.filter(g => g.id !== activeContactId));
    // 从对话列表中移除
    setConversations(prev => {
      const newConversations = { ...prev };
      delete newConversations[activeContactId];
      return newConversations;
    });
    // 切换到第一个可用的联系人
    setActiveContactId("ai-bot");
  };

  // 添加联系人处理函数
  const handleAddContact = (phone: string, name: string) => {
    const contactId = `custom-${Date.now()}`;
    const avatar = name.slice(-1);
    const newContact: Contact = {
      id: contactId,
      name,
      role: `手机: ${phone}`,
      avatar,
      online: false,
      lastMessage: "联系人已添加，可以开始单聊",
      time: "刚刚",
    };
    setCustomContacts((prev: Contact[]) => [newContact, ...prev]);
    setConversations((prev) => ({
      ...prev,
      [contactId]: [
        {
          role: "contact",
          content: `你好！我是${name}，已添加你为联系人，有什么需要沟通的吗？`,
          time: "刚刚",
        },
      ],
    }));
    setActiveContactId(contactId);
  };

  // Function to fetch answer from bot
  const fetchBotReply = async (contactId: string, userMsg: string) => {
    setIsTyping(true);
    const targetContact = CONTACTS.find(c => c.id === contactId) || CONTACTS[0];
    try {
      let sysInstruction = `你是 ${targetContact.name}，角色是 ${targetContact.role}。请以你的角色口吻简短回复（30字以内），不要解释你是AI。`;
      if (contactId === "ai-bot") {
        sysInstruction = `你是 ToTrial 临研通专属的 AI 智能问答机器人（临研通智能客服）。你是一个专业、亲切、极其懂临研业务、产品功能与订阅计划的AI助手。你需要根据用户反馈的问题或疑问进行耐心、精准的智能解答（可以稍微详细一些，控制在150字以内）。
如果用户提到反馈软件使用异常、导出Bug、格式排版对齐等，你可以提示并安慰他们：“我们已经将您的反馈建档跟进（编号：FB-${Date.now().toString().slice(-6)}），技术团队和医学团队正在后台全力为您修复排版并实时刷新。我们保障在2小时内为您圆满修复。非常抱歉给您带来不便！”
如果用户提到收费、VIP套餐或连续订阅等，你可以介绍：“我们目前统一采用高性价比的【个人版】体系，包含免费体验、基础版（¥19首月体验，支持高频分析与核心章节自动起草）、以及高级版（¥49首月体验，支持全套12章深度起草与动态高级统计）。推荐您点击左侧的【订阅计划】或在收银台模拟开启7天免费试用哦！”`;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMsg,
          systemInstruction: sysInstruction,
        }),
      });
      const data = await response.json();

      const replyTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setConversations((prev) => ({
        ...prev,
        [contactId]: [
          ...(prev[contactId] || []),
          {
            role: "contact",
            content: data.text || "好的，收到您的反馈，我们会第一时间进行核查与解决。",
            time: replyTime,
          },
        ],
      }));
    } catch (error) {
      setConversations((prev) => ({
        ...prev,
        [contactId]: [
          ...(prev[contactId] || []),
          {
            role: "contact",
            content: "好的，我已经收到您的咨询。临研通团队将极速为您跟进处理！",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ],
      }));
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    const handleSetChat = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.contactId) {
        setActiveContactId(detail.contactId);
        if (detail.message) {
          const timeNow = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          setConversations((prev) => {
            // Check if last message was already this content to avoid duplication
            const currentList = prev[detail.contactId] || [];
            if (currentList.length > 0 && currentList[currentList.length - 1].content === detail.message) {
              return prev;
            }
            return {
              ...prev,
              [detail.contactId]: [
                ...currentList,
                { role: "user", content: detail.message, time: timeNow }
              ]
            };
          });
          fetchBotReply(detail.contactId, detail.message);
        }
      }
    };
    window.addEventListener('totrial_set_active_chat', handleSetChat);
    return () => window.removeEventListener('totrial_set_active_chat', handleSetChat);
  }, []);

  const activeContact = CONTACTS.find((c) => c.id === activeContactId) || groupChats.find((g) => g.id === activeContactId) || customContacts.find((c) => c.id === activeContactId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentMessages = conversations[activeContactId] || [];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeContactId, currentMessages, isTyping]);

  const handleSendMessage = async () => {
    if (!message.trim() || !activeContact) return;

    const userMsg = message.trim();
    const timeNow = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setConversations((prev) => ({
      ...prev,
      [activeContactId]: [
        ...(prev[activeContactId] || []),
        { role: "user", content: userMsg, time: timeNow },
      ],
    }));
    setMessage("");
    await fetchBotReply(activeContactId, userMsg);
  };

  return (
    <div className="fixed bottom-24 right-10 z-[60] flex animate-in slide-in-from-bottom-8 fade-in duration-300 origin-bottom-right">
      <div className="bg-white rounded-2xl shadow-2xl w-[700px] h-[550px] flex overflow-hidden border border-gray-100">
        {/* Left Panel: Contacts */}
        <div className="w-80 border-r border-gray-100/70 flex flex-col bg-gray-50/50">
          <div className="p-4 border-b border-gray-100/70 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-[16px]">微聊</h2>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="text-gray-400 hover:text-[#083190] transition-colors"
              title="新建群聊"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={chatSearchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChatSearchQuery(e.target.value)}
                placeholder="搜索联系人、群组或记录"
                className="w-full bg-white border border-gray-150 rounded-lg pl-9 pr-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* 系统通知分组 */}
            <div className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50">
              系统通知
            </div>
            {CONTACTS.filter(c => c.id.startsWith("notif-") && (
              !chatSearchQuery || 
              c.name.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
              c.lastMessage?.toLowerCase().includes(chatSearchQuery.toLowerCase())
            )).map((contact) => (
              <div
                key={contact.id}
                onClick={() => setActiveContactId(contact.id)}
                className={`flex items-start p-3 cursor-pointer hover:bg-gray-100 transition-colors ${activeContactId === contact.id ? "bg-blue-50/50 hover:bg-blue-50/80" : ""}`}
              >
                <div className="relative">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                      activeContactId === contact.id ? "bg-[#083190]" : "bg-blue-600"
                    }`}
                  >
                    {contact.id === "notif-share" ? "📩" : "👥"}
                  </div>
                </div>

                <div className="ml-3 flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-medium text-[14px] text-gray-800">
                      {contact.name}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {contact.time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-gray-500 truncate pr-2">
                      {contact.lastMessage}
                    </span>
                    {contact.unread && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                        {contact.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* 群聊分组 */}
            {groupChats.filter(g => (
              !chatSearchQuery || 
              g.name.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
              g.lastMessage.toLowerCase().includes(chatSearchQuery.toLowerCase())
            )).length > 0 && (
              <>
                <div className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 border-t border-gray-100">
                  群聊
                </div>
                {groupChats.filter(g => (
                  !chatSearchQuery || 
                  g.name.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
                  g.lastMessage.toLowerCase().includes(chatSearchQuery.toLowerCase())
                )).map((group) => (
                  <div
                    key={group.id}
                    onClick={() => setActiveContactId(group.id)}
                    className={`flex items-start p-3 cursor-pointer hover:bg-gray-100 transition-colors ${activeContactId === group.id ? "bg-blue-50/50 hover:bg-blue-50/80" : ""}`}
                  >
                    <div className="relative">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          activeContactId === group.id ? "bg-[#083190] text-white" : "bg-purple-100 text-[#083190]"
                        }`}
                      >
                        <Users className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="ml-3 flex-1 overflow-hidden">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-medium text-[14px] text-gray-800">
                          {group.name}
                          <span className="ml-1.5 text-[10px] text-gray-400 font-normal">({group.memberCount}人)</span>
                        </span>
                        <span className="text-[11px] text-gray-400">{group.time}</span>
                      </div>
                      <span className="text-[12px] text-gray-500 truncate block pr-2">
                        {group.lastMessage}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* 联系人分组 */}
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">联系人</span>
              <button
                onClick={() => setShowAddContact(true)}
                className="text-[11px] text-[#083190] font-medium hover:underline flex items-center space-x-1"
                title="添加联系人"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>添加</span>
              </button>
            </div>
            {/* 自定义联系人 */}
            {customContacts.filter(c => (
              !chatSearchQuery || 
              c.name.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
              c.role.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
              c.lastMessage?.toLowerCase().includes(chatSearchQuery.toLowerCase())
            )).map((contact) => (
              <div
                key={contact.id}
                onClick={() => setActiveContactId(contact.id)}
                className={`flex items-start p-3 cursor-pointer hover:bg-gray-100 transition-colors ${activeContactId === contact.id ? "bg-blue-50/50 hover:bg-blue-50/80" : ""}`}
              >
                <div className="relative">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-[15px] shrink-0 ${
                      activeContactId === contact.id ? "bg-[#083190]" : "bg-emerald-500"
                    }`}
                  >
                    {contact.avatar}
                  </div>
                </div>
                <div className="ml-3 flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-medium text-[14px] text-gray-800">
                      {contact.name}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {contact.time}
                    </span>
                  </div>
                  <span className="text-[12px] text-gray-500 truncate block pr-2">
                    {contact.lastMessage}
                  </span>
                </div>
              </div>
            ))}
            {CONTACTS.filter(c => !c.id.startsWith("notif-") && (
              !chatSearchQuery || 
              c.name.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
              c.role.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
              c.lastMessage?.toLowerCase().includes(chatSearchQuery.toLowerCase())
            )).map((contact) => (
              <div
                key={contact.id}
                onClick={() => setActiveContactId(contact.id)}
                className={`flex items-start p-3 cursor-pointer hover:bg-gray-100 transition-colors ${activeContactId === contact.id ? "bg-blue-50/50 hover:bg-blue-50/80" : ""}`}
              >
                <div className="relative">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-[15px] shrink-0 ${
                      activeContactId === contact.id ? "bg-[#083190]" : contact.id.startsWith("notif-") ? "bg-blue-600" : "bg-gray-400"
                    }`}
                  >
                    {contact.avatar || (contact.id === "notif-share" ? "📩" : "👥")}
                  </div>
                  {contact.online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                <div className="ml-3 flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-medium text-[14px] text-gray-800">
                      {contact.name}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {contact.time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-gray-500 truncate pr-2">
                      {contact.lastMessage}
                    </span>
                    {contact.unread && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                        {contact.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6">
            <div className="flex items-center">
              <h3 className="font-bold text-gray-800">{activeContact?.name}</h3>
              <span className="ml-2 text-[12px] text-gray-500 border border-gray-200 bg-gray-50 px-2 py-0.5 rounded-full">
                {activeContact?.role}
              </span>
              {/* 如果是群聊，显示群设置按钮 */}
              {activeContactId?.startsWith('group-') && (
                <button
                  onClick={() => setShowGroupSettings(true)}
                  className="ml-3 text-[12px] text-[#083190] hover:underline flex items-center space-x-1 font-medium"
                  title="群设置"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>设置</span>
                </button>
              )}
            </div>
            <div className="flex items-center space-x-4 text-gray-400">
              <button className="hover:text-[#083190] transition-colors">
                <Phone className="w-5 h-5" />
              </button>
              <button className="hover:text-[#083190] transition-colors">
                <Video className="w-5 h-5" />
              </button>
              <button className="hover:text-gray-600 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
              <div className="w-px h-5 bg-gray-200 mx-1"></div>
              <button
                onClick={onClose}
                className="hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 space-y-6">
            {currentMessages.map((msg, i) => {
              const showTime =
                i === 0 || currentMessages[i - 1].time !== msg.time;
              return (
                <React.Fragment key={i}>
                  {showTime && (
                    <div className="text-center">
                      <span className="text-[12px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                        {msg.time}
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex items-start ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm shrink-0 ${msg.role === "user" ? "bg-[#083190] ml-3" : "bg-gray-400 mr-3"}`}
                    >
                      {msg.role === "user" ? "我" : (activeContact?.avatar || (activeContact?.id === "notif-share" ? "📩" : "👥"))}
                    </div>
                    <div
                      className={`flex flex-col ${msg.role === "user" ? "items-end" : ""}`}
                    >
                      <div
                        className={`text-[12px] text-gray-500 mb-1 ${msg.role === "user" ? "mr-1" : "ml-1"}`}
                      >
                        {msg.role === "user" ? "我" : activeContact?.name}
                      </div>
                      <div
                        className={`${msg.role === "user" ? "bg-[#083190] text-white rounded-tr-sm text-left" : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"} px-4 py-2.5 rounded-2xl text-[14px] shadow-sm max-w-lg inline-block whitespace-pre-wrap`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

            {isTyping && (
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm mr-3 shrink-0">
                  {activeContact?.avatar}
                </div>
                <div>
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm inline-block">
                    <div className="flex space-x-1.5 items-center h-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.15s" }}
                      ></div>
                      <div
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.3s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center space-x-3 mb-3 text-gray-400">
              <button className="hover:text-gray-600 transition-colors">
                <Smile className="w-5 h-5" />
              </button>
              <button className="hover:text-gray-600 transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <button className="hover:text-gray-600 transition-colors">
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="输入消息，按 Enter 发送..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-[14px] outline-none focus:border-blue-300 focus:bg-white transition-colors resize-none h-24"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="absolute right-3 bottom-3 w-8 h-8 bg-[#083190] hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg flex items-center justify-center transition-colors shadow-sm"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 新建群聊弹窗 */}
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreate={handleCreateGroup}
      />

      {/* 添加联系人弹窗 */}
      <AddContactModal
        isOpen={showAddContact}
        onClose={() => setShowAddContact(false)}
        onAdd={handleAddContact}
      />

      {/* 群聊成员管理弹窗 */}
      {activeContactId?.startsWith('group-') && (
        <GroupSettingsModal
          isOpen={showGroupSettings}
          onClose={() => setShowGroupSettings(false)}
          group={groupChats.find(g => g.id === activeContactId)!}
          isOwner={groupChats.find(g => g.id === activeContactId)?.ownerId === currentUserId}
          onAddMembers={handleAddMembersToGroup}
          onRemoveMember={handleRemoveMemberFromGroup}
          onTransferOwner={handleTransferOwner}
          onLeaveGroup={handleLeaveGroup}
        />
      )}
    </div>
  );
}
