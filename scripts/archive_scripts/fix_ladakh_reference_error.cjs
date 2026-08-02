const fs = require('fs');
let code = fs.readFileSync('client/src/pages/LadakhConsultingPage.jsx', 'utf8');

const filterLogic = `
    const normalizedSearch = searchQuery.toLowerCase();

    const filteredMarketingLinks = referenceLinks.filter(link => 
        link.type !== 'tour' && (link.title.toLowerCase().includes(normalizedSearch) || 
        link.desc.toLowerCase().includes(normalizedSearch))
    );

    const filteredTourLinks = referenceLinks.filter(link => 
        link.type === 'tour' && (link.title.toLowerCase().includes(normalizedSearch) || 
        link.desc.toLowerCase().includes(normalizedSearch))
    );
`;

code = code.replace('    const normalizedSearch = searchQuery.toLowerCase();', filterLogic);

fs.writeFileSync('client/src/pages/LadakhConsultingPage.jsx', code);
console.log("Fixed ReferenceError");
