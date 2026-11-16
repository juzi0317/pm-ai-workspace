import re

with open("src/components/ai/ShareModal.tsx", "r") as f:
    content = f.read()

# Replace the text inside shareScope === "partial" to include some dummy checkboxes.
old_partial_div = """            {shareScope === "partial" && (
              <div className="bg-orange-50 border border-orange-100 p-2.5 rounded-lg text-[11px] text-orange-700 mt-2 flex items-start space-x-2">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <p>选择此项后，系统将生成专用独立链接，受邀者仅能查看您勾选确认的特定对话与文件块。</p>
              </div>
            )}"""

new_partial_div = """            {shareScope === "partial" && (
              <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex justify-between items-center">
                  <span className="text-[11px] font-bold text-gray-500">请勾选要分享的对话块</span>
                  <button className="text-[11px] text-[#083190] hover:underline">全选</button>
                </div>
                <div className="max-h-32 overflow-y-auto divide-y divide-gray-100 bg-white">
                  <label className="flex items-start px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors space-x-3">
                    <input type="checkbox" className="mt-0.5 rounded text-[#083190] focus:ring-[#083190]" defaultChecked />
                    <div className="flex-1">
                      <p className="text-[12px] text-gray-800 line-clamp-1"><b>User:</b> 帮我分析一下这份资料</p>
                    </div>
                  </label>
                  <label className="flex items-start px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors space-x-3">
                    <input type="checkbox" className="mt-0.5 rounded text-[#083190] focus:ring-[#083190]" defaultChecked />
                    <div className="flex-1">
                      <p className="text-[12px] text-gray-800 line-clamp-1"><b>AI:</b> 好的，已为您提取核心信息：[内容片段]...</p>
                    </div>
                  </label>
                  <label className="flex items-start px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors space-x-3">
                    <input type="checkbox" className="mt-0.5 rounded text-[#083190] focus:ring-[#083190]" />
                    <div className="flex-1">
                      <p className="text-[12px] text-gray-800 line-clamp-1"><b>User:</b> 修改一下第二段的逻辑</p>
                    </div>
                  </label>
                  <label className="flex items-start px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors space-x-3">
                    <input type="checkbox" className="mt-0.5 rounded text-[#083190] focus:ring-[#083190]" />
                    <div className="flex-1">
                      <p className="text-[12px] text-gray-800 line-clamp-1"><b>AI:</b> 已经调整了第二段论述，增加了临床试验的对比...</p>
                    </div>
                  </label>
                </div>
              </div>
            )}"""

content = content.replace(old_partial_div, new_partial_div)

with open("src/components/ai/ShareModal.tsx", "w") as f:
    f.write(content)

print("Patched share modal with dummy list")
