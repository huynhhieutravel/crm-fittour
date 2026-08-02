const fs = require('fs');
const path = 'client/src/components/modals/VisaProviderDetailDrawer.jsx';
let content = fs.readFileSync(path, 'utf-8');

content = content.replace(
    "setMarketOptions(res.data.data.map(m => ({ label: m.name, value: m.name })));",
    `const markets = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setMarketOptions(markets.map(m => ({ label: m.name, value: m.name })));`
);

content = content.replace(
    "const data = res.data.data;",
    "const data = res.data.data || res.data;"
);

fs.writeFileSync(path, content);
console.log("Fixed fetch logic");
