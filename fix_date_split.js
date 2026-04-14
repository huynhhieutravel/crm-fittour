const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let modified = 0;
walkDir('client/src', file => {
    if (!file.endsWith('.js') && !file.endsWith('.jsx')) return;
    
    let original = fs.readFileSync(file, 'utf8');
    let content = original;
    
    // Replace: new Date(task.due_date).toISOString().split('T')[0] -> new Date(task.due_date).toLocaleDateString('en-CA')
    content = content.replace(/new Date\((.*?)\)\.toISOString\(\)\.split\('T'\)\[0\]/g, "new Date($1).toLocaleDateString('en-CA')");
    
    // Replace: String(p.return_date).split('T')[0] -> new Date(p.return_date).toLocaleDateString('en-CA')
    content = content.replace(/String\((.*?)\)\.split\('T'\)\[0\]/g, "new Date($1).toLocaleDateString('en-CA')");
    
    // Replace: date.toISOString().split('T')[0] -> new Date(date).toLocaleDateString('en-CA')
    content = content.replace(/([a-zA-Z0-9_.]+)\.toISOString\(\)\.split\('T'\)\[0\]/g, "new Date($1).toLocaleDateString('en-CA')");
    
    // Replace: foo.birth_date.split('T')[0] -> new Date(foo.birth_date).toLocaleDateString('en-CA')
    content = content.replace(/([a-zA-Z0-9_?.()]+)\.split\('T'\)\[0\]/g, (match, p1) => {
        // avoid re-replacing if the regex matched weirdly
        if (p1.includes('.toLocaleDateString')) return match; 
        return `new Date(${p1}).toLocaleDateString('en-CA')`;
    });

    if (content !== original) {
        fs.writeFileSync(file, content);
        modified++;
        console.log(`Updated ${file}`);
    }
});
console.log(`Total modified files: ${modified}`);
