const fs = require('fs');
const file = 'client/src/tabs/GlobalChatTab.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add ref
content = content.replace(
  'const messagesEndRef = useRef(null);',
  'const messagesEndRef = useRef(null);\n    const isScrolledUpRef = useRef(false);'
);

// Update scrollToBottom
content = content.replace(
  'const scrollToBottom = () => {\n        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });\n    };',
  'const scrollToBottom = () => {\n        if (!isScrolledUpRef.current) {\n            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });\n        }\n    };'
);

// Add onScroll to the scroll container
content = content.replace(
  '<div style={{ flex: 1, padding: \'20px\', overflowY: \'auto\', display: \'flex\', flexDirection: \'column\', gap: \'20px\' }}>',
  '<div style={{ flex: 1, padding: \'20px\', overflowY: \'auto\', display: \'flex\', flexDirection: \'column\', gap: \'20px\' }}\n                 onScroll={(e) => {\n                     const { scrollTop, scrollHeight, clientHeight } = e.target;\n                     const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;\n                     isScrolledUpRef.current = !isAtBottom;\n                 }}\n            >'
);

fs.writeFileSync(file, content);
console.log('Done modifying scroll');
