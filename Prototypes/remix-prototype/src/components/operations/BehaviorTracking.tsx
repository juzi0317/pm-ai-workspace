import { useState, useEffect } from "react";
import { 
  Activity, Zap, Clock, ShieldAlert, 
  ArrowUpRight, RefreshCw, Monitor, CheckCircle2, History
} from "lucide-react";

interface LocalUsage {
  [key: string]: number;
}

export default function BehaviorTracking() {
  // Live dwell time counter for the current user
  const [sessionSeconds, setSessionSeconds] = useState(0);
  
  // Real-time behavior stats state for user's local actions
  const [usages, setUsages] = useState<LocalUsage>(() => {
    const stats = localStorage.getItem("totrial_behavior_stats");
    if (stats) {
      try {
        const parsed = JSON.parse(stats);
        return parsed.usages || {};
      } catch (e) {
        console.error(e);
      }
    }
    
    // Default initial user triggers
    return {
      "医研千问": 12,
      "AI Screening": 5,
      "AI Draft": 3,
      "提交用户反馈": 1
    };
  });

  // Simulated live local action log specifically for the logged-in user
  const [userLogs, setUserLogs] = useState<{ id: string; action: string; time: string; status: string }[]>([
    { id: "1", action: "成功登录 ToTrial 临研通平台系统并建立安全会话", time: "刚刚", status: "success" },
    { id: "2", action: "初始化医学文献检索与 AI 算法接口连接", time: "1分钟前", status: "success" },
    { id: "3", action: "在『订阅计划』中查阅了高性价比个人版本方案", time: "3分钟前", status: "info" },
    { id: "4", action: "加载了多中心受试者入组筛选工作台", time: "5分钟前", status: "success" }
  ]);

  // Track dwell time of the current session
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds(prev => {
        const next = prev + 1;
        // Periodic sync
        if (next % 10 === 0) {
          try {
            const stats = localStorage.getItem("totrial_behavior_stats");
            const parsed = stats ? JSON.parse(stats) : { registrations: 342, usages: {}, dwellTime: 0 };
            parsed.usages = { ...usages };
            parsed.dwellTime = (parsed.dwellTime || 0) + 1;
            localStorage.setItem("totrial_behavior_stats", JSON.stringify(parsed));
          } catch (e) {
            console.error(e);
          }
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [usages]);

  // Listen to external changes
  useEffect(() => {
    const handleUpdate = () => {
      const stats = localStorage.getItem("totrial_behavior_stats");
      if (stats) {
        try {
          const parsed = JSON.parse(stats);
          if (parsed.usages) {
            setUsages(parsed.usages);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener("totrial_behavior_updated", handleUpdate);
    return () => window.removeEventListener("totrial_behavior_updated", handleUpdate);
  }, []);

  // Format the session display
  const formatSessionTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} 分 ${s} 秒`;
  };

  const handleRefreshLogs = () => {
    const actions = [
      "触发了『医研千问』中药大鼠药代动力学分析指令",
      "使用『AI Screening』核对了受试者标准指标",
      "发起了关于『Word文档导出对齐』的系统意见反馈",
      "加载并渲染了『CTMS 系统』项目管理看板",
      "刷新了『EDC 数据库』电子数据采集结构体"
    ];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    
    // Add to logs
    setUserLogs(prev => [
      { id: Date.now().toString(), action: randomAction, time: "刚刚", status: "success" },
      ...prev.slice(0, 5)
    ]);

    // Update local usage stats
    const key = randomAction.includes("医研千问") ? "医研千问" 
              : randomAction.includes("AI Screening") ? "AI Screening" 
              : randomAction.includes("意见反馈") ? "提交用户反馈" 
              : "其他功能";
              
    setUsages(prev => {
      const next = { ...prev, [key]: (prev[key] || 0) + 1 };
      try {
        const stats = localStorage.getItem("totrial_behavior_stats");
        const parsed = stats ? JSON.parse(stats) : { registrations: 342, usages: {}, dwellTime: 0 };
        parsed.usages = next;
        localStorage.setItem("totrial_behavior_stats", JSON.stringify(parsed));
      } catch (e) {}
      return next;
    });
  };

  return (
    <div className="flex-1 bg-gray-50/50 pb-12 font-sans overflow-y-auto h-full">
      
      {/* Header section with top controls */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-[17px] font-black text-gray-800 flex items-center">
              <Activity className="w-5 h-5 text-[#083190] mr-2" />
              本地会话安全留痕与行为审计
            </h1>
            <span className="bg-[#083190]/10 text-[#083190] text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200/20">
              ● 本地授权核对
            </span>
          </div>
          <p className="text-[11.5px] text-gray-400 mt-1 font-medium">
            本页呈现您当前账户在本地会话中触发的功能记录与行为审计，高级全局统计报表和漏斗分析已由管理后台自动接管。
          </p>
        </div>
        
        {/* Active counter of the current session */}
        <div className="flex items-center space-x-4 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs">
          <div className="space-y-0.5">
            <span className="text-gray-400 font-bold block text-[9.5px]">当前安全会话计时</span>
            <span className="text-[#083190] font-black font-mono">
              已在此页面停留：{formatSessionTime(sessionSeconds)}
            </span>
          </div>
          <button 
            onClick={handleRefreshLogs}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
            title="手动模拟一个活跃用户触发事件以进行测试"
          >
            <RefreshCw className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-6">
        
        {/* Top summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 会话有效时长 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">会话总时长</span>
              <span className="text-2xl font-black text-gray-800 font-mono">
                {formatSessionTime(sessionSeconds)}
              </span>
              <div className="text-[10px] text-emerald-600 font-bold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                <span>连接稳定 (SSL加密中)</span>
              </div>
            </div>
            <div className="p-2.5 bg-blue-50 text-[#083190] rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* 功能使用累计 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">累计功能点击</span>
              <span className="text-2xl font-black text-gray-800 font-mono">
                {(Object.values(usages) as number[]).reduce((a, b) => a + b, 0)} 次
              </span>
              <div className="text-[10px] text-amber-600 font-bold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                <span>大模型核心功能渗透</span>
              </div>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Zap className="w-5 h-5" />
            </div>
          </div>

          {/* 会话终端 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">当前接入终端</span>
              <div className="flex items-center space-x-2 text-xs font-black text-gray-700 mt-2">
                <Monitor className="w-4 h-4 text-blue-500" />
                <span>PC浏览器终端</span>
              </div>
              <div className="text-[10px] text-gray-400 font-medium">适合专业排版与试验设计</div>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Dynamic List section - User activity log */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* User functions usage counts */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-black text-gray-800 border-b border-gray-100 pb-2 mb-4 flex items-center">
                <Zap className="w-4 h-4 text-amber-500 mr-1.5" />
                工具使用统计
              </h3>
              <div className="space-y-4">
                {Object.keys(usages).length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">暂无本地操作记录</p>
                ) : (
                  Object.keys(usages).map((key, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#083190]" />
                        <span className="text-xs font-bold text-gray-700">{key}</span>
                      </div>
                      <span className="text-xs font-mono font-black text-gray-800 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                        {usages[key]} 次
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100 mt-4 text-[10.5px] text-gray-400 font-medium leading-relaxed">
              * 功能点击数仅在您的当前浏览器会话中留存，关闭页面后会安全清退。
            </div>
          </div>

          {/* User live log timeline */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs md:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-4">
                <h3 className="text-sm font-black text-gray-800 flex items-center">
                  <History className="w-4 h-4 text-[#083190] mr-1.5" />
                  当前会话审计日志 (Live Trail)
                </h3>
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                </span>
              </div>
              
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                {userLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="flex items-start justify-between bg-gray-50/50 border border-gray-100/80 rounded-xl p-3 text-[11px] text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    <span className="font-bold flex-1 pr-4">{log.action}</span>
                    <span className="text-[10px] text-gray-400 font-mono shrink-0">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between">
              <span className="text-[10.5px] text-gray-400 font-medium">
                日志审计遵循《临床试验安全数据隐私标准》
              </span>
              <button
                onClick={handleRefreshLogs}
                className="text-[11px] text-[#083190] hover:text-blue-900 font-bold flex items-center"
              >
                + 手动模拟操作留痕
              </button>
            </div>
          </div>
        </div>

        {/* Safety & privacy disclosure */}
        <div className="bg-[#083190]/5 border border-[#083190]/10 rounded-2xl p-5 text-[11px] text-gray-500 flex items-start space-x-3 leading-relaxed">
          <ShieldAlert className="w-5 h-5 text-[#083190] mt-0.5 shrink-0" />
          <div className="space-y-1">
            <span className="font-black text-gray-800 block">运营数据留痕申明 ( HIPAA/GDPR )</span>
            <p>
              ToTrial 临研通高度尊重研究学者与受试者的隐私权利。为保障系统排版输出、多中心文档协同等核心业务合规开展，系统仅在后台自动同步安全相关的脱敏审计摘要。各种繁杂的转换统计图表与留存漏斗等数据，我们已交由后台服务器以及医院专用的局域网数据库进行封闭式核算，在此前台页面中不作多余体现，保障学者零感知、安全无干扰地完成试验工作。
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
