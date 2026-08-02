const fs = require('fs');

const dir = '/Users/huynhtronghieu/Documents/WORK Hiếu/crm-fittour/client/src/tabs';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx')).map(f => `${dir}/${f}`);

let patched = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes("padding: '0 2rem'")) {
        content = content.replace(/padding: '0 2rem'/g, "padding: '0 22px'");
        fs.writeFileSync(file, content);
        patched++;
        console.log(`Patched ${file}`);
    }
});
console.log(`Finished patching ${patched} files`);
