/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import DIPPortal from "./components/DIPPortal";
import PHPSystem from "./components/PHPSystem";
import CTMSSystem from "./components/systems/CTMSSystem";
import OrgSystem from "./components/systems/OrgSystem";
import Login from "./components/Login";
import { User, MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import MicroChat from "./components/chat/MicroChat";

export default function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash);
  const [userRole, setUserRole] = useState<"sponsor" | "site" | null>(() => {
    return (
      (localStorage.getItem("totrial_user_role") as
        "sponsor" | "site" | null) || null
    );
  });
  const [showMicroChat, setShowMicroChat] = useState(false);

  useEffect(() => {
    const handleToggleChat = (e: Event) => {
      setShowMicroChat(true);
      const detail = (e as CustomEvent).detail;
      if (detail && detail.contactId) {
        // Dispatch event with small delay so MicroChat is mounted and can listen to it
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('totrial_set_active_chat', { detail }));
        }, 100);
      }
    };
    window.addEventListener('totrial_toggle_microchat', handleToggleChat);
    return () => window.removeEventListener('totrial_toggle_microchat', handleToggleChat);
  }, []);

  const handleLogin = (role: "sponsor" | "site") => {
    localStorage.setItem("totrial_user_role", role);
    setUserRole(role);
  };

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleSystemClick = (system: string, hash: string) => {
    if (system === "DIP") {
      window.location.hash = "/";
      return;
    }
    if (hash) {
      window.open(`/#${hash}`, "_blank");
    }
  };

  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    const isWorkbench =
      currentHash.includes("workbench=1") || currentHash === "#/workbench";
    const baseHash = currentHash.split("?")[0];

    if (baseHash === "#/edc")
      return (
        <PHPSystem
          systemName="EDC"
          userRole={userRole}
          showWorkbench={isWorkbench}
        />
      );
    if (baseHash === "#/ctms") return <CTMSSystem userRole={userRole} />;
    if (baseHash === "#/org") return <OrgSystem userRole={userRole} />;

    // Default to AI
    return (
      <DIPPortal
        userRole={userRole}
        onSystemClick={handleSystemClick}
        showWorkbench={isWorkbench}
      />
    );
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-gray-50 flex flex-col relative">
      {renderContent()}

      {/* Floating Buttons */}
      {currentHash.split("?")[0] === "#/edc" ||
      currentHash.split("?")[0] === "#/" ||
      currentHash.split("?")[0] === "" ? (
        <motion.div 
          drag
          dragMomentum={false}
          onDragStart={() => document.body.style.cursor = 'grabbing'}
          onDragEnd={() => document.body.style.cursor = 'auto'}
          whileDrag={{ scale: 1.05, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
          className="fixed bottom-10 right-8 flex flex-col items-center bg-white border border-gray-200 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 overflow-hidden divide-y divide-gray-100 touch-none cursor-grab active:cursor-grabbing"
        >
          {/* Workbench Button */}
          <button
            onClick={() => {
              const base = currentHash.split("?")[0] || "#/";
              const isWb = currentHash.includes("workbench=1");
              window.location.hash = isWb ? base : `${base}?workbench=1`;
            }}
            className={`w-14 h-14 flex items-center justify-center transition-colors group relative ${currentHash.includes("workbench=1") ? "bg-blue-50 text-blue-700" : "bg-white text-gray-500 hover:text-[#083190] hover:bg-gray-50"}`}
            title="个人工作台"
          >
            <User className="w-6 h-6 shrink-0" strokeWidth={1.5} />
            <div className="absolute right-full mr-4 bg-gray-800 text-white text-[12px] px-3 py-1.5 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-sm font-medium flex items-center">
              个人工作台
              <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-800"></div>
            </div>
          </button>

          {/* MicroChat Button */}
          <button
            onClick={() => setShowMicroChat(true)}
            className="w-14 h-14 flex items-center justify-center transition-colors group relative bg-white text-gray-500 hover:text-[#083190] hover:bg-gray-50"
            title="微聊"
          >
            <div className="relative">
              <MessageCircle className="w-6 h-6 shrink-0" strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                2
              </span>
            </div>
            <div className="absolute right-full mr-4 bg-gray-800 text-white text-[12px] px-3 py-1.5 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-sm font-medium flex items-center">
              微聊交互
              <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-800"></div>
            </div>
          </button>
        </motion.div>
      ) : null}

      {/* MicroChat Popup */}
      {showMicroChat && <MicroChat onClose={() => setShowMicroChat(false)} />}
    </div>
  );
}
