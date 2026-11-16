import re

with open("src/components/ai/ShareModal.tsx", "r") as f:
    content = f.read()

# I want to find the whole `{shareScope === "partial" && ( ... )}`
start_idx = content.find('{shareScope === "partial" && (')
if start_idx != -1:
    # Find the matching closing `)}`
    # We can just use string search until we find `<div className="space-y-1.5">` which is `{/* Link Copier */}`
    end_idx = content.find('{/* Link Copier */}', start_idx)
    
    new_partial = """{shareScope === "partial" && (
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
                          <p className="text-[12px] text-gray-800 line-clamp-2">
                            <b>{msg.role === 'user' ? '我' : 'AI'}:</b> {msg.content}
                          </p>
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
          """
    
    content = content[:start_idx] + new_partial + content[end_idx:]

with open("src/components/ai/ShareModal.tsx", "w") as f:
    f.write(content)

print("Fixed share modal block")
