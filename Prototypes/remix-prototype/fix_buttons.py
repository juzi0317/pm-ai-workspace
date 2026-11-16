import re

with open('src/components/ai/AIScreening.tsx', 'r') as f:
    content = f.read()

# Pattern for button 1 (main view)
pattern1 = r'''className={`px-6 py-2.5 font-bold rounded-lg text-\[13px\] transition-colors flex items-center \$\{\!\(agreeToRecruitment && \(selectedProject !== "全部" \|\| modalMatchMode === "full" \|\| \(modalProjectSource === "upload" \? \!\!customSchemeFile : \!\!modalSelectedLibraryProject\)\)\) \? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' : 'bg-\[#083190\] hover:bg-blue-900 text-white shadow-md'\}`\}\s*>\s*<Sparkles className="w-4 h-4 mr-1.5" />\s*开始智能核查\s*</button>'''

replacement1 = '''disabled={!(agreeToRecruitment && selectedProject !== "全部")}
                        className={`px-6 py-2.5 font-bold rounded-lg text-[13px] transition-colors flex items-center justify-center ${!(agreeToRecruitment && selectedProject !== "全部") ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' : 'bg-[#083190] hover:bg-blue-800 text-white shadow-sm'}`}
                      >
                        开始智能核查
                      </button>'''

# Pattern for button 2 (modal)
pattern2 = r'''className={`px-6 py-2.5 font-bold rounded-lg text-\[13px\] transition-colors flex items-center \$\{\!\(agreeToRecruitment && \(selectedProject !== "全部" \|\| modalMatchMode === "full" \|\| \(modalProjectSource === "upload" \? \!\!customSchemeFile : \!\!modalSelectedLibraryProject\)\)\) \? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' : 'bg-\[#083190\] hover:bg-blue-900 text-white shadow-md'\}`\}\s*>\s*<Sparkles className="w-4 h-4 mr-1.5" />\s*开始智能核查\s*</button>'''

replacement2 = '''disabled={!(agreeToRecruitment && (modalMatchMode === "full" || (modalProjectSource === "upload" ? !!customSchemeFile : !!modalSelectedLibraryProject)))}
                              className={`px-6 py-2.5 font-bold rounded-lg text-[13px] transition-colors flex items-center justify-center ${!(agreeToRecruitment && (modalMatchMode === "full" || (modalProjectSource === "upload" ? !!customSchemeFile : !!modalSelectedLibraryProject))) ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' : 'bg-[#083190] hover:bg-blue-800 text-white shadow-sm'}`}
                            >
                              开始智能核查
                            </button>'''


content = re.sub(pattern1, replacement1, content, count=1)
content = re.sub(pattern2, replacement2, content, count=1)

with open('src/components/ai/AIScreening.tsx', 'w') as f:
    f.write(content)

print("Done")
