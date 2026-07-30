const fs = require('fs');
const file = '/Users/huynhtronghieu/Documents/WORK Hiếu/crm-fittour/client/src/tabs/GroupProjectsTab.jsx';
let content = fs.readFileSync(file, 'utf8');

// The outer container has <div style={{ padding: '0 2rem' }}>
const oldOuter = `<div style={{ padding: '0 2rem' }}>`;
const newOuter = `<div style={{ padding: '0 22px' }}>`;

if (content.includes(oldOuter)) {
    content = content.replace(oldOuter, newOuter);
    fs.writeFileSync(file, content);
    console.log("Success: Changed outer padding");
} else {
    console.log("Failed to find oldOuter");
}
