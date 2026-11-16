import re

with open("src/components/ai/ShareModal.tsx", "r") as f:
    content = f.read()

# I want to add a state for `shareScope` and UI for it.
imports_idx = content.find('import { useState }')
content = content.replace('import { useState } from "react";', 'import { useState } from "react";') # just checking

state_idx = content.find('const [isBatchSending, setIsBatchSending] = useState(false);')
new_state = 'const [isBatchSending, setIsBatchSending] = useState(false);\n  const [shareScope, setShareScope] = useState<"all" | "partial" | "result">("all");'
content = content.replace('const [isBatchSending, setIsBatchSending] = useState(false);', new_state)

# Now the UI
link_copier_idx = content.find('{/* Link Copier */}');

new_ui = """          {/* Share Scope Selection */}
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
              <div className="bg-orange-50 border border-orange-100 p-2.5 rounded-lg text-[11px] text-orange-700 mt-2 flex items-start space-x-2">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <p>选择此项后，系统将生成专用独立链接，受邀者仅能查看您勾选确认的特定对话与文件块。</p>
              </div>
            )}
          </div>

          """
content = content.replace('{/* Link Copier */}', new_ui + '{/* Link Copier */}')

with open("src/components/ai/ShareModal.tsx", "w") as f:
    f.write(content)

print("Patched share modal")
