const fs = require('fs');

let code = fs.readFileSync('src/pages/LadakhConsultingPage.jsx', 'utf8');
code = code.replace(/\\nconst groupedFaqs = \[/, '\nconst groupedFaqs = [');
code = code.replace(/\\n                    <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>/, '\n                    <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'60px\' }}>');
fs.writeFileSync('src/pages/LadakhConsultingPage.jsx', code);
console.log("Fixed syntax!");
