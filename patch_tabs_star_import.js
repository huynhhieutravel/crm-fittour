const fs = require('fs');

const files = [
    'client/src/tabs/HotelsTab.jsx',
    'client/src/tabs/RestaurantsTab.jsx',
    'client/src/tabs/TransportsTab.jsx',
    'client/src/tabs/TicketsTab.jsx',
    'client/src/tabs/AirlinesTab.jsx',
    'client/src/tabs/LandtoursTab.jsx',
    'client/src/tabs/InsurancesTab.jsx'
];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    // Find import from 'lucide-react'
    const lucideImportMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/);
    if (lucideImportMatch) {
        const imports = lucideImportMatch[1];
        if (!imports.includes('Star')) {
            const newImports = imports + ', Star';
            content = content.replace(lucideImportMatch[0], `import {${newImports}} from 'lucide-react'`);
            fs.writeFileSync(file, content);
            console.log('Patched', file);
        } else {
            console.log('Already has Star:', file);
        }
    }
}
