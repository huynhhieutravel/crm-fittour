const fs = require('fs');
const glob = require('glob');

const toLocalStr = "new Date($1).toLocaleDateString('en-CA')";
const toLocalStr2 = "new Date($1).toLocaleDateString('en-CA')";

const replacePatterns = [
    {
        // new Date().toISOString().split('T')[0] -> new Date().toLocaleDateString('en-CA')
        regex: /new Date\(([^)]*)\)\.toISOString\(\)\.split\('T'\)\[0\]/g,
        replacement: "new Date($1).toLocaleDateString('en-CA')"
    },
    {
        // foo.start_date.split('T')[0] -> new Date(foo.start_date).toLocaleDateString('en-CA')
        // We only match if it's not preceded by toISOString
        // and we wrap it inside new Date(...).toLocaleDateString('en-CA')
        // Using a function to only replace if matches
        regex: /([a-zA-Z0-9_?.\[\]\'\"]+)\.split\('T'\)\[0\]/g,
        func: (match, p1) => {
            if (p1.endsWith('.toISOString()')) {
                // Should have been caught by previous pattern, but just in case
                return `new Date(${p1.replace(/\.toISOString\(\)$/, '')}).toLocaleDateString('en-CA')`;
            }
            if (p1.endsWith(')')) { // like String(...)
                 return `new Date(${p1}).toLocaleDateString('en-CA')`;
            }
            return `new Date(${p1}).toLocaleDateString('en-CA')`;
        }
    }
];

glob('client/src/**/*.{js,jsx}', (err, files) => {
    let changedFiles = 0;
    files.forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        let originalContent = content;
        
        replacePatterns.forEach(pattern => {
            if (pattern.func) {
                content = content.replace(pattern.regex, pattern.func);
            } else {
                content = content.replace(pattern.regex, pattern.replacement);
            }
        });

        // Some specific fixing where String(xxx) might have been used
        content = content.replace(/new Date\(String\((.*?)\)\)\.toLocaleDateString\('en-CA'\)/g, "new Date($1).toLocaleDateString('en-CA')");

        if (content !== originalContent) {
            fs.writeFileSync(file, content);
            changedFiles++;
            console.log('Fixed', file);
        }
    });
    console.log('Total files changed:', changedFiles);
});
