import json
import re

transcript_path = "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/5a863c3a-dd6c-4f8f-96f6-35ede55802e5/.system_generated/logs/transcript_full.jsonl"
part1 = ""
part2 = ""

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'VIEW_FILE' and 'LadakhConsultingPage.jsx' in data.get('content', ''):
                content = data['content']
                if 'Total Lines: 915' in content and 'Showing lines 1 to 800' in content:
                    part1 = content
                elif 'Total Lines: 915' in content and ('Showing lines 700 to 915' in content or 'Showing lines 800 to 915' in content or 'Showing lines 800' in content or 'Showing lines 715' in content):
                    # Need to check which chunk had the rest of the lines
                    if '915:' in content:
                        part2 = content
        except Exception:
            pass

def clean_content(raw):
    # Extract just the code lines. Format is "1: code..."
    lines = []
    capture = False
    for line in raw.split('\n'):
        if "The following code has been modified" in line:
            capture = True
            continue
        if "The above content does NOT show" in line:
            capture = False
            continue
        if capture:
            # Strip "123: " prefix
            match = re.match(r'^\d+:\s?(.*)$', line)
            if match:
                lines.append(match.group(1))
    return lines

lines1 = clean_content(part1)
lines2 = clean_content(part2)

# Find the overlap if any, or just concatenate
all_lines = {}
for i, line in enumerate(part1.split('\n')):
    match = re.match(r'^(\d+):\s?(.*)$', line)
    if match:
        all_lines[int(match.group(1))] = match.group(2)

for i, line in enumerate(part2.split('\n')):
    match = re.match(r'^(\d+):\s?(.*)$', line)
    if match:
        all_lines[int(match.group(1))] = match.group(2)

# Write to file
with open('client/src/pages/LadakhConsultingPage.jsx', 'w', encoding='utf-8') as f:
    for i in range(1, 916):
        if i in all_lines:
            f.write(all_lines[i] + '\n')
        else:
            print(f"Missing line {i}!")

print(f"Restored {len(all_lines)} lines to LadakhConsultingPage.jsx")
