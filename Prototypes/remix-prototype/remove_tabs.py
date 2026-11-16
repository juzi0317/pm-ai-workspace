import re

with open("src/components/ai/AIScreening.tsx", "r") as f:
    content = f.read()

# I want to find the tabs:
# {/* Patient Tabs/Selection */}
# ...
# {/* Screening Results Cards */}
# <div className="bg-gray-50/50 rounded-xl overflow-hidden flex-1 flex flex-col space-y-4 pb-4">
#   {activePatient === 'haobin' ? (

tabs_start = content.find('{/* Patient Tabs/Selection */}')
tabs_end = content.find('{/* Screening Results Cards */}')

if tabs_start != -1 and tabs_end != -1:
    content = content[:tabs_start] + content[tabs_end:]

# Now remove the {activePatient === 'haobin' ? ( ... ) : ( ... )}
# Search for:
# {activePatient === 'haobin' ? (
#   <>
replace_str1 = """                  {activePatient === 'haobin' ? (
                    <>"""
replace_str2 = """                  <>"""
content = content.replace(replace_str1, replace_str2)

# We need to find the `</>\n                  ) : (\n                    <>\n                      <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between shadow-sm hover:border-blue-300 transition-colors">` and remove until `</>\n                  )}`

# Using regex to remove the `) : ( ... )}` part.
import re
pattern = re.compile(r'                    </>\n                  \) : \(\n                    <>\n                      <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between shadow-sm hover:border-blue-300 transition-colors">.*?</div>\n                    </>\n                  \)', re.DOTALL)

content = pattern.sub('                    </>', content)

with open("src/components/ai/AIScreening.tsx", "w") as f:
    f.write(content)

print("Removed patient tabs successfully!")
