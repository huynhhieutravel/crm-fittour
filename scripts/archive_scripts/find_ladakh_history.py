import os
import glob

history_dir = os.path.expanduser("~/Library/Application Support/Code/User/History")
found_files = []

for root, dirs, files in os.walk(history_dir):
    for file in files:
        if file != "entries.json":
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if "LadakhConsultingPage = () =>" in content and "filteredMarketingLinks" in content:
                        found_files.append((path, len(content.splitlines()), os.path.getmtime(path)))
            except:
                pass

found_files.sort(key=lambda x: x[2], reverse=True) # Sort by modified time descending

for f in found_files[:5]:
    print(f"File: {f[0]}, Lines: {f[1]}, Time: {f[2]}")
