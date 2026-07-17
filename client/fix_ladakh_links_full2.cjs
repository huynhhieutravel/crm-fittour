const fs = require('fs');
let code = fs.readFileSync('src/pages/LadakhConsultingPage.jsx', 'utf8');
code = code.replace(/\\n            case "List"/g, '\n            case "List"');
fs.writeFileSync('src/pages/LadakhConsultingPage.jsx', code);
