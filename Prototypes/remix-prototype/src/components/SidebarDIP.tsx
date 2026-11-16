import {
  Bot,
  ChevronDown,
  LayoutList,
  Settings,
  PlusCircle,
  Activity,
  User,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Search,
  Crosshair,
  BarChart2,
  FileEdit,
  FolderOpen,
  Building,
  Factory,
  Users,
  BookMarked,
  Plus,
  MessageSquare,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { useState, useMemo } from "react";

const sidebarData = [
  {
    title: "AI工作台",
    icon: Bot,
    isNew: false,
    children: [
      { name: "医研千问", icon: Cpu },
      { name: "AI Screening", icon: Search },
      { name: "AI Monitoring", icon: Activity },
      { name: "AI Capture", icon: Crosshair },
      { name: "AI Analysis", icon: BarChart2 },
      { name: "AI Draft", icon: FileEdit },
      { name: "AI CRF", icon: FileEdit },
      { name: "AI-TMF", icon: FolderOpen },
      { name: "AI Coding", icon: BookMarked },
    ],
  },
  {
    title: "交互平台",
    icon: LayoutList,
    isNew: false,
    children: [
      { name: "找医院", icon: Building },
      { name: "找厂家", icon: Factory },
      { name: "找SMO", icon: Users },
    ],
  }
];

export default function SidebarDIP({
  userRole,
  activeMenu,
  onMenuSelect,
  isCollapsed = false,
  setIsCollapsed,
}: {
  userRole: "sponsor" | "site";
  activeMenu: string;
  onMenuSelect: (m: string) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (v: boolean) => void;
}) {
  const [openGroups, setOpenGroups] = useState<string[]>(["AI工作台", "交互平台", "运营中心"]);
  // Local fallback if not controlled (though it is)
  const [localCollapsed, setLocalCollapsed] = useState(false);
  const collapsed = setIsCollapsed ? isCollapsed : localCollapsed;
  const handleToggle = () => {
    if (setIsCollapsed) setIsCollapsed(!collapsed);
    else setLocalCollapsed(!collapsed);
  };

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );
  };

  return (
    <aside
      className={`relative shrink-0 overflow-visible bg-white border-r border-gray-100 text-gray-700 flex flex-col transition-all duration-300 ${collapsed ? "w-14" : "w-56"}`}
    >
      {collapsed ? (
        <div className="flex flex-col items-center py-4 space-y-4 flex-1 h-full overflow-y-auto hide-scrollbar">
          {sidebarData.map((group, groupIdx) => (
            <div key={group.title} className="flex flex-col items-center space-y-2 w-full">
              {groupIdx > 0 && <div className="w-8 border-t border-gray-100 my-1" />}
              {group.children.map((child) => {
                const isActive = activeMenu === child.name;
                return (
                  <button
                    key={child.name}
                    onClick={() => onMenuSelect(child.name)}
                    title={child.name}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-[#083190] text-white shadow-md font-bold"
                        : "text-gray-500 hover:bg-blue-50 hover:text-[#083190]"
                    }`}
                  >
                    <child.icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <div
          className="space-y-4 py-4 flex-1 h-full overflow-y-auto hide-scrollbar whitespace-nowrap opacity-100 visible"
        >
        {sidebarData.map((group) => {
          const isOpen = openGroups.includes(group.title);
          return (
            <div key={group.title} className="space-y-1 mb-2">
              <button
                onClick={() => toggleGroup(group.title)}
                className={`flex w-full items-center justify-between px-5 py-2.5 text-[14px] font-bold hover:bg-gray-50 transition-colors group ${isOpen ? "text-[#083190]" : "text-gray-700 hover:text-[#083190]"}`}
              >
                <div className="flex items-center space-x-3">
                  <group.icon
                    className={`h-[18px] w-[18px] transition-colors ${isOpen ? "text-[#083190]" : "text-gray-400 group-hover:text-[#083190]"}`}
                  />
                  <span>{group.title}</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180 text-[#083190]" : "text-gray-400 group-hover:text-[#083190]"}`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96" : "max-h-0"}`}
              >
                <div className="space-y-0.5 pb-1">
                  {group.children.map((child) => {
                    const isActive = activeMenu === child.name;
                    const c = child as any;
                    return (
                      <div className="px-0" key={child.name}>
                        <button
                          onClick={() => {
                            onMenuSelect(child.name);
                          }}
                          className={`group/child flex w-full items-center px-8 py-2.5 text-[13px] transition-colors ${
                            isActive
                              ? "bg-[#083190] text-white font-medium border-l-4 border-l-[#3b82f6]"
                              : c.isAction
                                ? "text-gray-500 hover:bg-gray-100 border-l-4 border-l-transparent"
                                : "text-gray-700 hover:bg-blue-50/50 hover:text-[#083190] border-l-4 border-l-transparent"
                          }`}
                        >
                          <child.icon
                            className={`mr-2 w-[14px] h-[14px] ${isActive ? "text-blue-200" : c.isAction ? "text-gray-400" : "text-gray-400 group-hover/child:text-[#083190]"}`}
                          />
                          <span
                            className={
                              c.isAction
                                ? "truncate opacity-80"
                                : "truncate"
                            }
                          >
                            {child.name}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Bottom independent menus: 订阅计划 & 用户反馈 */}
      <div className={`border-t border-gray-100 p-3 shrink-0 bg-gray-50/50 flex flex-col space-y-1 ${collapsed ? "items-center" : "px-3"}`}>
        {collapsed ? (
          <>
            <button
              onClick={() => onMenuSelect("订阅计划")}
              title="订阅计划"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeMenu === "订阅计划"
                  ? "bg-[#083190] text-white shadow-md font-bold"
                  : "text-gray-500 hover:bg-blue-50 hover:text-[#083190]"
              }`}
            >
              <CreditCard className="w-5 h-5" />
            </button>
            <button
              onClick={() => onMenuSelect("用户反馈")}
              title="用户反馈"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeMenu === "用户反馈"
                  ? "bg-[#083190] text-white shadow-md font-bold"
                  : "text-gray-500 hover:bg-blue-50 hover:text-[#083190]"
              }`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onMenuSelect("订阅计划")}
              className={`group flex items-center w-full px-3 py-2 text-[13px] rounded-lg transition-colors ${
                activeMenu === "订阅计划"
                  ? "bg-blue-50 text-[#083190] font-bold"
                  : "text-gray-700 hover:bg-blue-50/50 hover:text-[#083190]"
              }`}
            >
              <CreditCard className={`w-[14px] h-[14px] mr-2 shrink-0 ${activeMenu === "订阅计划" ? "text-blue-400" : "text-gray-400 group-hover:text-[#083190]"}`} />
              <span className="font-medium truncate">订阅计划</span>
            </button>
            <button
              onClick={() => onMenuSelect("用户反馈")}
              className={`group flex items-center w-full px-3 py-2 text-[13px] rounded-lg transition-colors ${
                activeMenu === "用户反馈"
                  ? "bg-blue-50 text-[#083190] font-bold"
                  : "text-gray-700 hover:bg-blue-50/50 hover:text-[#083190]"
              }`}
            >
              <MessageSquare className={`w-[14px] h-[14px] mr-2 shrink-0 ${activeMenu === "用户反馈" ? "text-blue-400" : "text-gray-400 group-hover:text-[#083190]"}`} />
              <span className="font-medium truncate">用户反馈</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
