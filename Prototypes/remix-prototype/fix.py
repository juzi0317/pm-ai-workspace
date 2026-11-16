import re

with open("src/components/ai/AIScreening.tsx", "r") as f:
    content = f.read()

bad_part = """                                  )}
                                </div>
                              </div>
                              <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
                                <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 text-[12px] font-bold text-gray-700 flex items-center justify-between">"""

fixed_part = """                                  )}
                                </div>
                              </div>
                          ) : (
                            // Requirement 2: Specific Project Mode. Remove full matching! Default to current, display scheme, allow removal & re-upload
                            <div className="space-y-4 font-sans text-left">
                              <div className="p-4 bg-blue-50/30 border border-blue-100 rounded-xl flex items-start space-x-3">
                                <div className="bg-[#083190] text-white p-1.5 rounded-full shrink-0">
                                  <Pin className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="text-[14px] font-bold text-gray-900">当前对话已被限定至特定项目：</h4>
                                  <p className="text-xs text-[#083190] font-semibold mt-0.5">[{selectedProject}]</p>
                                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                                    根据上下文锁定的规则，系统已为您过滤掉全库并发匹配，默认将针对该项目的排入条件进行精准评估。
                                  </p>
                                </div>
                              </div>
                              {/* Display active trial protocol */}
                              <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
                                <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 text-[12px] font-bold text-gray-700 flex items-center justify-between">"""

content = content.replace(bad_part, fixed_part)

with open("src/components/ai/AIScreening.tsx", "w") as f:
    f.write(content)
