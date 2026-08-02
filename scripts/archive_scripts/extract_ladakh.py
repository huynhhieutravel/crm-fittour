import json
import re

transcript_path = "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/5a863c3a-dd6c-4f8f-96f6-35ede55802e5/.system_generated/logs/transcript_full.jsonl"
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'VIEW_FILE' and 'LadakhConsultingPage.jsx' in data.get('content', ''):
                content = data['content']
                if 'Total Lines: 915' in content and 'Showing lines 1 to 800' in content:
                    print("Found 1-800!")
                    with open('scripts/ladakh_1_800.txt', 'w', encoding='utf-8') as out:
                        out.write(content)
                elif 'Total Lines: 915' in content and 'Showing lines 800' in content:
                    print("Found 800+!")
            
            # Or maybe I wrote it?
            if data.get('type') == 'PLANNER_RESPONSE':
                for call in data.get('tool_calls', []):
                    if call['name'] == 'write_to_file' and 'LadakhConsultingPage.jsx' in call.get('args', {}).get('TargetFile', ''):
                        print("Found write_to_file!")
        except Exception as e:
            pass
print("Done")
