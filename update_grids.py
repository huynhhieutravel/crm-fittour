import os
import re

directories_to_scan = [
    '/Volumes/T7 Loki SS/WORK Hiếu/crm-fittour/client/src/tabs',
    '/Volumes/T7 Loki SS/WORK Hiếu/crm-fittour/client/src/components/modals'
]

files_to_update = []
for d in directories_to_scan:
    for root, dirs, files in os.walk(d):
        for f in files:
            if f.endswith('.jsx') and not f.startswith('._'):
                path = os.path.join(root, f)
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    if "display: 'grid'" in content or 'display: "grid"' in content:
                        files_to_update.append(path)

print(f"Found {len(files_to_update)} files to process.")

def process_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    def replacer(match):
        tag_match = match.group(0)
        # Verify it has style={{... display: 'grid' ...}}
        if tag_match.startswith('<div') or tag_match.startswith('<form'):
            if 'className=' in tag_match:
                # Basic sub for className="..."
                updated_tag = re.sub(r'className="([^"]+)"', r'className="\1 mobile-stack-grid"', tag_match)
                if updated_tag == tag_match:
                    updated_tag = tag_match.replace('style={{', 'className="mobile-stack-grid" style={{')
                return updated_tag
            else:
                return tag_match.replace('style={{', 'className="mobile-stack-grid" style={{')
        return tag_match
        
    # Regex to match <div ... style={{...}}> where ... contains display: 'grid'
    # This might match multiline tags, meaning we need re.DOTALL if tag is multiline.
    # React tags often span multiple lines.
    # A robust regex for a single HTML-like tag is: <(div|form)[^>]*style={{[^}]*display:\s*['"]grid['"][^}]*}}[^>]*>
    new_content = re.sub(r'<(div|form)[^>]*style={{[^}]*display:\s*[\'"]grid[\'"][^}]*}}[^>]*>', replacer, content, flags=re.DOTALL)
    
    # Second handle: What if grid is in a multiline style object inside style={{ ... }} where '}' is separated?
    # Another pattern: <div [^>]*display:\s*['"]grid['"][^>]*>
    new_content2 = re.sub(r'<(div|form)[^>]*display:\s*[\'"]grid[\'"][^>]*>', replacer, new_content, flags=re.DOTALL)
    
    if new_content2 != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content2)
        print(f"Updated: {os.path.basename(path)}")
    else:
        print(f"Skipped (no match): {os.path.basename(path)}")

for f in files_to_update:
    process_file(f)
