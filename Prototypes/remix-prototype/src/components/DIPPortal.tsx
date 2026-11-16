import { useState, useEffect } from "react";
import TopNavigation from "./TopNavigation";
import SidebarDIP from "./SidebarDIP";
import ContentDIP from "./ContentDIP";
import PersonalWorkspace from "./personal/PersonalWorkspace";

export default function DIPPortal({
  userRole,
  onSystemClick,
  initialMenu = "医研千问",
  showWorkbench = false,
}: {
  userRole: "sponsor" | "site";
  onSystemClick: (s: string, h: string) => void;
  initialMenu?: string;
  showWorkbench?: boolean;
}) {
  const [activeMenu, setActiveMenu] = useState(initialMenu);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (initialMenu !== "个人工作台") {
      setActiveMenu(initialMenu);
    }
  }, [userRole, initialMenu]);

  useEffect(() => {
    const handleStorage = () => {
      const ws = localStorage.getItem("dip_default_menu");
      if (ws) {
        setActiveMenu(ws);
        localStorage.removeItem("dip_default_menu");
      }
    };
    window.addEventListener("storage", handleStorage);
    // Initial check
    handleStorage();
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const currentSystem = "DIP";
  const AI_TOOLS = ['医研千问', 'AI Capture', 'AI Monitoring', 'AI Screening', 'AI Analysis', 'AI Draft', 'AI CRF', 'AI-TMF', 'AI Coding'];
  const isAiTool = AI_TOOLS.includes(activeMenu);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#f4f6f8]">
      <TopNavigation
        activeSystem={currentSystem}
        onSystemClick={onSystemClick}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isCollapsed={isSidebarCollapsed}
      />
      <div className="flex h-full flex-1 overflow-hidden">
        <SidebarDIP
          userRole={userRole}
          activeMenu={activeMenu}
          onMenuSelect={(m) => {
            setActiveMenu(m);
            if (showWorkbench) {
              // If we select a menu, we might want to exit workbench view
              window.location.hash = "#/";
            }
          }}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
        <main
          className={`flex-1 flex flex-col scroll-smooth will-change-scroll ${isAiTool && !showWorkbench ? "p-0 overflow-hidden" : "p-8 overflow-y-auto"} ${showWorkbench ? "bg-[#f4f6f8] pt-6" : ""}`}
        >
          {showWorkbench ? (
            <PersonalWorkspace />
          ) : (
            <ContentDIP userRole={userRole} activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
          )}
        </main>
      </div>
    </div>
  );
}
