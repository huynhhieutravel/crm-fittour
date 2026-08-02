const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'client/src/tabs');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace the problematic backtick syntax
    // The exact string in the file is:
    // if (addToast) addToast(`Đã xoá ${successCount} mục. ${failCount > 0 ? \`Lỗi ${failCount} mục.\` : ''}`, successCount > 0 ? 'success' : 'error');
    
    const searchString = "\\`Lỗi ${failCount} mục.\\`";
    const replaceString = "'Lỗi ' + failCount + ' mục.'";
    
    if (content.includes(searchString)) {
        content = content.replace(searchString, replaceString);
        fs.writeFileSync(filePath, content);
        console.log('Fixed', file);
    }
});
