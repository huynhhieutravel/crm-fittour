const fs = require('fs');
let file = './client/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace("import TravelSupport from './tabs/TravelSupport';", "import TravelSupport from './tabs/TravelSupport';\nimport GlobalChat from './tabs/GlobalChat';");
fs.writeFileSync(file, content);
