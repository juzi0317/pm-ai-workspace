import re

with open("src/components/ai/AIScreening.tsx", "r") as f:
    content = f.read()

bad_tabs = """                                  <div className="grid grid-cols-2 gap-0 border border-blue-200 rounded-lg overflow-hidden">
                                    <button
                                      onClick={() => setModalMatchMode("single")}
                                      className={`py-2.5 text-[13px] font-bold transition-colors ${modalMatchMode === "single" ? "bg-blue-50 text-[#083190] border-r border-blue-200" : "bg-white text-gray-500 hover:bg-gray-50 border-r border-gray-200"}`}
                                    >
                                      单项目匹配
                                    </button>
                                    <button
                                      onClick={() => setModalMatchMode("full")}
                                      className={`py-2.5 text-[13px] font-bold transition-colors ${modalMatchMode === "full" ? "bg-blue-50 text-[#083190]" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                                    >
                                      全库智能核查 (19项)
                                    </button>
                                  </div>"""

# I need to handle both '匹配' and '核查' in the target just in case
bad_tabs_regex = r'<div className="grid grid-cols-2 gap-0 border border-blue-200 rounded-lg overflow-hidden">[\s\S]*?全库智能.*?</div>'

good_tabs = """                                  <div className="grid grid-cols-2 gap-3">
                                    <button
                                      onClick={() => setModalMatchMode("single")}
                                      className={`py-2.5 rounded-lg text-[13px] font-bold transition-colors border ${modalMatchMode === "single" ? "bg-blue-50/50 text-[#083190] border-[#083190]" : "bg-white text-gray-500 hover:bg-gray-50 border-gray-200"}`}
                                    >
                                      单项目匹配
                                    </button>
                                    <button
                                      onClick={() => setModalMatchMode("full")}
                                      className={`py-2.5 rounded-lg text-[13px] font-bold transition-colors border ${modalMatchMode === "full" ? "bg-blue-50/50 text-[#083190] border-[#083190]" : "bg-white text-gray-500 hover:bg-gray-50 border-gray-200"}`}
                                    >
                                      全库智能匹配 (19项)
                                    </button>
                                  </div>"""

content = re.sub(bad_tabs_regex, good_tabs, content)

with open("src/components/ai/AIScreening.tsx", "w") as f:
    f.write(content)
