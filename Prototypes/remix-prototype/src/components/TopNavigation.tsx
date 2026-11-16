import { useState } from "react";
import {
  Home,
  Database,
  LayoutGrid,
  Building2,
  Bell,
  ChevronDown,
  LogOut,
  Stethoscope,
  FolderOpen,
  User,
  Users,
  Clock,
  Wrench,
  Trash2,
  Settings,
  PenTool,
  Share,
  Package,
  FileText,
  Layers,
  Grid,
  Power,
  Globe,
  List,
  Folder,
  Flag,
  Cloud
} from "lucide-react";

export default function TopNavigation({
  userRole,
  activeSystem,
  onSystemClick,
  onToggleSidebar,
  isCollapsed,
}: {
  userRole?: "sponsor" | "site" | null;
  activeSystem: string;
  onSystemClick?: (s: string, h: string) => void;
  onToggleSidebar?: () => void;
  isCollapsed?: boolean;
}) {
  const navs = [
    { name: "AI", id: "DIP", hash: "/", icon: Home },
    { name: "EDC", id: "EDC", hash: "/edc", icon: Globe },
    { name: "CTMS", id: "CTMS", hash: "/ctms", icon: List },
    { name: "机构管理", id: "ORG", hash: "/org", icon: Flag },
    { name: "专病管理", id: "DISEASE", hash: "/disease", icon: Cloud },
  ];

  const handleClick = (id: string, hash: string) => {
    if (id === "DIP" && activeSystem !== "DIP" && activeSystem !== "AI") {
      window.open("/#/", "_blank");
      return;
    }
    if (onSystemClick) {
      onSystemClick(id, hash);
    } else {
      window.location.hash = hash;
    }
  };

  const userName =
    userRole === "sponsor"
      ? "演示厂家"
      : userRole === "site"
        ? "演示中心"
        : "周会菊";
  const avatarChar = userName.charAt(0);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between bg-[#083190] px-4 text-white shadow-md relative z-50 font-sans">
      <div className="flex items-center h-full">
        <div className="flex items-center space-x-2 text-[20px] font-bold tracking-tight mr-4">
          <div className="flex flex-col items-center gap-[3px] mt-0 w-[15px]">
            <div className="flex justify-between w-full">
              <div className="bg-[#f59e0b] rounded-[2px] w-[6px] h-[6px]" />
              <div className="bg-[#10b981] rounded-[2px] w-[6px] h-[6px]" />
            </div>
            <div className="bg-[#3b82f6] rounded-[2px] w-[6px] h-[6px]" />
          </div>
          <span>ToTrial 临研通</span>
        </div>
        
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            title={isCollapsed ? "展开侧边栏" : "折叠侧边栏"}
            className="flex items-center justify-center h-full px-3 text-blue-100 hover:text-white hover:bg-[#002f7a] transition-colors border-l border-r border-[#1e449a]/30 mr-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
              {isCollapsed ? (
                <path d="m14 9 3 3-3 3" />
              ) : (
                <path d="m17 15-3-3 3-3" />
              )}
            </svg>
          </button>
        )}

        <nav className="flex space-x-1 h-full items-center ml-2">
          {navs.map((n) => {
            const isActive = activeSystem === n.id || activeSystem === n.name;
            const Icon = n.icon;
            return (
              <button
                key={n.id}
                onClick={() => handleClick(n.id, n.hash)}
                className={`flex h-14 items-center space-x-1.5 px-4 text-[14px] font-normal transition-all ${
                  isActive
                    ? "bg-[#0b1f4a] text-white font-medium"
                    : "text-blue-50 hover:bg-[#0f285a]"
                }`}
              >
                <Icon className="h-[15px] w-[15px]" strokeWidth={2.5} />
                <span>{n.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center space-x-5 text-[13px] font-normal text-blue-50">
        <button className="hover:text-white transition-colors">CN/EN</button>
        <button className="relative hover:text-white transition-colors">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full border-2 border-[#13316e] bg-red-500"></span>
        </button>
        <div className="relative group">
          <button className="flex items-center space-x-2 pl-2 hover:text-white transition-colors py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#083190] text-white font-bold shadow-sm overflow-hidden">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=totrial"
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <span>totrial</span>
            <ChevronDown className="w-3.5 h-3.5 text-blue-200 group-hover:text-white transition-colors" />
          </button>

          <div className="absolute right-0 top-full w-[170px] bg-white shadow-lg py-1.5 hidden group-hover:block border border-gray-100 text-gray-700 font-sans z-50">
            <button className="flex items-center w-full px-4 py-2 text-[13px] hover:bg-gray-50 hover:text-[#083190] transition-colors">
              <Clock className="w-4 h-4 mr-2" />
              用户中心
            </button>
            <button className="flex items-center w-full px-4 py-2 text-[13px] hover:bg-gray-50 hover:text-[#083190] transition-colors">
              <Wrench className="w-4 h-4 mr-2" />
              修改密码
            </button>
            <button className="flex items-center w-full px-4 py-2 text-[13px] hover:bg-gray-50 hover:text-[#083190] transition-colors">
              <Trash2 className="w-4 h-4 mr-2" />
              清空缓存
            </button>
            <button className="flex items-center w-full px-4 py-2 text-[13px] hover:bg-gray-50 hover:text-[#083190] transition-colors">
              <Settings className="w-4 h-4 mr-2" />
              账户设置
            </button>
            <button className="flex items-center w-full px-4 py-2 text-[13px] hover:bg-gray-50 hover:text-[#083190] transition-colors">
              <Bell className="w-4 h-4 mr-2" />
              消息提醒
            </button>
            <button className="flex items-center w-full px-4 py-2 text-[13px] hover:bg-gray-50 hover:text-[#083190] transition-colors">
              <PenTool className="w-4 h-4 mr-2" />
              电子签名
            </button>
            <button className="flex items-center w-full px-4 py-2 text-[13px] hover:bg-gray-50 hover:text-[#083190] transition-colors">
              <Share className="w-4 h-4 mr-2" />
              切换到组织端
            </button>
            <button className="flex items-center w-full px-4 py-2 text-[13px] hover:bg-gray-50 hover:text-[#083190] transition-colors mt-1 pt-2 border-t border-gray-100">
              <Package className="w-4 h-4 mr-2" />
              发包平台
            </button>
            <button className="flex items-center w-full px-4 py-2 text-[13px] hover:bg-gray-50 hover:text-[#083190] transition-colors">
              <FileText className="w-4 h-4 mr-2" />
              财管系统
            </button>
            <button className="flex items-center w-full px-4 py-2 text-[13px] hover:bg-gray-50 hover:text-[#083190] transition-colors">
              <Layers className="w-4 h-4 mr-2" />
              PV系统
            </button>
            <button className="flex items-center w-full px-4 py-2 text-[13px] hover:bg-gray-50 hover:text-[#083190] transition-colors pb-3">
              <Grid className="w-4 h-4 mr-2" />
              ERP系统
            </button>
            <button
               onClick={() => {
                 localStorage.removeItem("totrial_user_role");
                 window.location.hash = "";
                 window.location.reload();
               }}
               className="flex items-center w-full px-4 py-2.5 text-[13px] hover:bg-gray-50 hover:text-red-600 transition-colors border-t border-gray-100"
            >
              <Power className="w-4 h-4 mr-2 text-gray-500" />
              退出登录
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
