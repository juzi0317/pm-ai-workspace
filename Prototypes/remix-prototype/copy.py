import re

with open("src/components/ai/AIScreening.tsx", "r") as f:
    content = f.read()

# I want to copy the lines 1829 to 2079.
# Let's write a python script that just replaces lines 1217 to 1395 with lines 1829 to 2079.
lines = content.split('\n')

main_start = -1
for i, line in enumerate(lines):
    if line.strip() == '{buildStep === "project_select" && (' and i < 1500:
        main_start = i
        break

main_end = -1
for i in range(main_start, len(lines)):
    if '</div>\n                  </div>\n                )}' in '\n'.join(lines[i:i+3]):
        main_end = i + 2
        break

print("Main Page range:", main_start, main_end)

modal_start = -1
for i, line in enumerate(lines):
    if line.strip() == '{buildStep === "project_select" && (' and i > 1500:
        modal_start = i
        break

modal_end = -1
for i in range(modal_start, len(lines)):
    if '</div>\n                        </div>\n                      )}' in '\n'.join(lines[i:i+3]):
        modal_end = i + 2
        break

print("Modal range:", modal_start, modal_end)

if main_start != -1 and main_end != -1 and modal_start != -1 and modal_end != -1:
    modal_code = lines[modal_start:modal_end+1]
    # adjust indentation: modal is nested 1 level deeper?
    # Actually, let's see. 
    # modal_start line: "{buildStep === "project_select" && ("
    # main_start line: "{buildStep === "project_select" && ("
    indent_diff = len(lines[main_start]) - len(lines[main_start].lstrip()) - (len(lines[modal_start]) - len(lines[modal_start].lstrip()))
    
    adjusted_modal_code = []
    for line in modal_code:
        if indent_diff > 0:
            adjusted_modal_code.append((" " * indent_diff) + line)
        elif indent_diff < 0 and line.startswith(" " * -indent_diff):
            adjusted_modal_code.append(line[-indent_diff:])
        else:
            adjusted_modal_code.append(line)
            
    new_lines = lines[:main_start] + adjusted_modal_code + lines[main_end+1:]
    
    with open("src/components/ai/AIScreening.tsx", "w") as f:
        f.write('\n'.join(new_lines))
    print("Replaced!")
else:
    print("Could not find ranges.")
