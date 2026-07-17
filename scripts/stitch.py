import re

lines = {}
with open('scripts/ladakh_raw.txt', 'r', encoding='utf-8') as f:
    capture = False
    for line in f:
        if "The following code has been modified" in line:
            capture = True
            continue
        if "The above content does NOT show" in line:
            capture = False
            continue
        if capture:
            match = re.match(r'^(\d+):\s?(.*)$', line)
            if match:
                line_num = int(match.group(1))
                content = match.group(2)
                lines[line_num] = content

max_line = max(lines.keys()) if lines else 0
print(f"Stitching {len(lines)} lines, max line is {max_line}")

with open('client/src/pages/LadakhConsultingPage.jsx', 'w', encoding='utf-8') as f:
    for i in range(1, max_line + 1):
        if i in lines:
            f.write(lines[i] + '\n')
        else:
            # If some lines are missing (e.g. from 464 to 909 were never viewed?)
            print(f"WARNING: Line {i} is missing!")
            f.write(f"// MISSING LINE {i}\n")
