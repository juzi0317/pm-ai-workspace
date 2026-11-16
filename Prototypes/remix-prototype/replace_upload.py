import re

with open('src/components/ai/AIScreening.tsx', 'r') as f:
    content = f.read()

# Replace "快捷选择示例病历，极速体验 AI 智能提取" text with "可以选择已有的病历"
content = content.replace('快捷选择示例病历，极速体验 AI 智能提取', '可以选择已有的病历')

# The buttons are hardcoded in two places. We can find the grid container and replace the content.
# Since it's somewhat long, I'll use regex.
pattern = r'(<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">).*?(</button>\s*</div>)'
replacement = r'''\1
{patients.slice(0, 3).map(p => (
  <button
    key={p.id}
    onClick={() => {
      setFormName(p.fullName);
      setFormShortName(p.name);
      setFormDob(p.dob);
      setFormAge(p.age.toString());
      setFormGender(p.gender);
      setFormDisease(p.disease);
      setFormPhone(p.phone);
      setFormIdCard(p.idCard);
      setFormSource(p.source);
      setFormReferrer(p.referrer);
      setUploadedRecordFile({ name: (p as any).fileName || `${p.fullName}_病历.pdf`, size: (p as any).fileSize || "1.5MB" });
      setBuildStep("extracting");
    }}
    className="px-3.5 py-2.5 bg-white border border-gray-200 hover:border-[#083190] hover:bg-blue-50/10 text-left rounded-xl transition-all flex items-center space-x-2 group"
  >
    <FileText className="w-5 h-5 text-gray-400 group-hover:text-[#083190] shrink-0" />
    <div className="truncate">
      <p className="text-xs font-bold text-gray-800 truncate text-left">{p.fullName} ({p.disease})</p>
      <span className="text-[9.5px] text-gray-400 font-mono block">{(p as any).fileSize || "1.5MB"} • {(p as any).fileName || "病历记录"}</span>
    </div>
  </button>
))}
</div>'''

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/components/ai/AIScreening.tsx', 'w') as f:
    f.write(new_content)

print("Done replacing upload buttons")
