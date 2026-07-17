const fs = require('fs');
let code = fs.readFileSync('client/src/pages/LadakhConsultingPage.jsx', 'utf8');

const copyLogic = `    const [copiedId, setCopiedId] = useState('');
    const [copiedLink, setCopiedLink] = useState('');
    const [showDetailsIds, setShowDetailsIds] = useState([]); // Array to store IDs of expanded detailed sections

    const toggleAccordion = (id) => {
        setOpenIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleDetails = (id) => {
        setShowDetailsIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleCopy = (e, id, text, type) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id + type);
            setTimeout(() => setCopiedId(''), 2000);
        });
    };

    const handleCopyLink = (e, link) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(link.copyText).then(() => {
            setCopiedLink(link.url);
            setTimeout(() => setCopiedLink(''), 2000);
        });
    };`;

code = code.replace(/    const \[copiedId, setCopiedId\] = useState\(''\);\n    const \[showDetailsIds, setShowDetailsIds\] = useState\(\[\]\);.*?const scrollTo/s, copyLogic + '\n\n    const scrollTo');

fs.writeFileSync('client/src/pages/LadakhConsultingPage.jsx', code);
console.log("Fixed copiedLink ReferenceError");
