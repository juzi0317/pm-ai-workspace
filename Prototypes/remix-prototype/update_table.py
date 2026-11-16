with open('src/components/ai/AIScreening.tsx', 'r') as f:
    content = f.read()

content = content.replace('<th className="px-5 py-3 font-semibold">姓名</th>', '<th className="px-5 py-3 font-semibold whitespace-nowrap">姓名</th>')
content = content.replace('<th className="px-5 py-3 font-semibold w-16 text-center">性别</th>', '<th className="px-5 py-3 font-semibold w-16 text-center whitespace-nowrap">性别</th>')
content = content.replace('<th className="px-5 py-3 font-semibold w-16 text-center">年龄</th>', '<th className="px-5 py-3 font-semibold w-16 text-center whitespace-nowrap">年龄</th>')
content = content.replace('<th className="px-5 py-3 font-semibold">主要疾病 / 临床诊断</th>', '<th className="px-5 py-3 font-semibold whitespace-nowrap">主要疾病 / 临床诊断</th>')
content = content.replace('<th className="px-5 py-3 font-semibold">上传病历记录</th>', '<th className="px-5 py-3 font-semibold whitespace-nowrap">上传病历记录</th>')
content = content.replace('<th className="px-5 py-3 font-semibold">联系电话</th>', '<th className="px-5 py-3 font-semibold whitespace-nowrap">联系电话</th>')
content = content.replace('<th className="px-5 py-3 font-semibold text-center w-[200px]">AI智能操作</th>', '<th className="px-5 py-3 font-semibold text-center whitespace-nowrap">AI智能操作</th>')

content = content.replace('<td className="px-5 py-3.5 font-semibold text-gray-950">', '<td className="px-5 py-3.5 font-semibold text-gray-950 whitespace-nowrap">')
content = content.replace('<td className="px-5 py-3.5 text-center">', '<td className="px-5 py-3.5 text-center whitespace-nowrap">')
content = content.replace('<td className="px-5 py-3.5 text-center font-semibold text-gray-800">', '<td className="px-5 py-3.5 text-center font-semibold text-gray-800 whitespace-nowrap">')
content = content.replace('<td className="px-5 py-3.5">', '<td className="px-5 py-3.5 whitespace-nowrap">')
content = content.replace('<td className="px-5 py-3.5 text-gray-500 font-mono">', '<td className="px-5 py-3.5 text-gray-500 font-mono whitespace-nowrap">')


with open('src/components/ai/AIScreening.tsx', 'w') as f:
    f.write(content)

print("Updated table styles successfully!")

with open('src/components/ai/AIScreening.tsx', 'r') as f:
    content = f.read()

content = content.replace('className="px-2.5 py-1.5 border border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 text-gray-600 hover:text-blue-600 rounded-md font-medium transition-all flex items-center text-[12px]"', 'className="px-2.5 py-1.5 border border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 text-gray-600 hover:text-blue-600 rounded-md font-medium transition-all flex items-center text-[12px] whitespace-nowrap"')

content = content.replace('className="px-2.5 py-1.5 bg-[#2b64e3] hover:bg-blue-600 text-white rounded-md font-bold transition-all flex items-center text-[12px] shadow-sm"', 'className="px-2.5 py-1.5 bg-[#2b64e3] hover:bg-blue-600 text-white rounded-md font-bold transition-all flex items-center text-[12px] shadow-sm whitespace-nowrap"')

with open('src/components/ai/AIScreening.tsx', 'w') as f:
    f.write(content)
