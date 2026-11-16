import re

with open("src/components/ai/ShareModal.tsx", "r") as f:
    content = f.read()

# Add messages?: { role: string; content: string }[]; to ShareModalProps
content = content.replace("  title: string;\n}", "  title: string;\n  messages?: { role: string; content: string }[];\n}")

# Update component signature
content = content.replace("export default function ShareModal({ isOpen, onClose, shareUrl, title }: ShareModalProps) {", "export default function ShareModal({ isOpen, onClose, shareUrl, title, messages = [] }: ShareModalProps) {")

# Modify the dummy list to use messages if available.
new_list = """                <div className="max-h-32 overflow-y-auto divide-y divide-gray-100 bg-white">
                  {messages.length > 0 ? (
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
                </div>"""

# replace the hardcoded div with this new list
pattern = re.compile(r'<div className="max-h-32 overflow-y-auto divide-y divide-gray-100 bg-white">.*?</div>', re.DOTALL)
content = pattern.sub(new_list, content)

with open("src/components/ai/ShareModal.tsx", "w") as f:
    f.write(content)

print("Patched share modal to accept messages")
