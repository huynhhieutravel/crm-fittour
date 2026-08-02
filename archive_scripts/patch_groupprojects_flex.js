const fs = require('fs');
const file = '/Users/huynhtronghieu/Documents/WORK Hiếu/crm-fittour/client/src/tabs/GroupProjectsTab.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldCode1 = `<div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
                    <div className="filter-group" style={{ flex: '2 1 300px' }}>`;

const newCode1 = `<div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start' }}>
                    <div className="filter-group" style={{ flex: '1.2 1 250px' }}>`;

if (content.includes(oldCode1)) {
    content = content.replace(oldCode1, newCode1);
    fs.writeFileSync(file, content);
    console.log("Success: Adjusted filter layout");
} else {
    console.log("Failed to find oldCode1");
}
