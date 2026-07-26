const fs = require('fs');
let code = fs.readFileSync('client/src/App.jsx', 'utf8');

code = code.replace(/<div([^>]*className=\{?`nav-item[^>]+)>(.*?)(<[A-Z][a-zA-Z0-9]*[^>]*\/>)\s*(?:<strong[^>]*>)?([^<]+)(?:<\/strong>)?(.*?)<\/div>/gs, (match, p1, p2, p3, p4, p5) => {
    let text = p4.trim();
    if (!p1.includes('title=')) {
        return `<div title="${text}"${p1}>${p2}${p3} ${text}${p5}</div>`;
    }
    return match;
});

fs.writeFileSync('client/src/App.jsx', code);
console.log("Done");
