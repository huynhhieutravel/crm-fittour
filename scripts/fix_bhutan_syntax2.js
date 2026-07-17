const fs = require('fs');

let code = fs.readFileSync('client/src/pages/BhutanConsultingPage.jsx', 'utf8');

const startTag = '{/* ====== Combined Links Section ====== */}';
const endTag = 'import React,';

const startIndex = code.indexOf(startTag);
const endIndex = code.indexOf(endTag);

if (startIndex !== -1 && endIndex !== -1) {
    const invalidBlock = code.substring(startIndex, endIndex);
    
    // Remove the invalid block from the top
    code = code.substring(endIndex);
    
    // Now we need to insert the valid JSX block at the correct position
    const insertTag = "<div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>";
    const insertPos = code.indexOf(insertTag) + insertTag.length;
    
    // We should clean up the invalid block because it might have a trailing `                    ` which breaks things.
    code = code.substring(0, insertPos) + '\\n' + invalidBlock + '\\n' + code.substring(insertPos);
    
    // Now wait, Library is used in the invalid block! We need to make sure Library, ExternalLink, CheckCircle2, Copy, Hash are imported.
    if (!code.includes('Library,')) {
        code = code.replace("import { Search, ChevronDown, ChevronRight, CheckCircle2, Copy, Zap, Info, Hash, Briefcase, HeartPulse, CloudSun, Passport, PhoneCall } from 'lucide-react';", 
        "import { Search, ChevronDown, ChevronRight, CheckCircle2, Copy, Zap, Info, Hash, Briefcase, HeartPulse, CloudSun, Passport, PhoneCall, Library, ExternalLink } from 'lucide-react';");
    }

    fs.writeFileSync('client/src/pages/BhutanConsultingPage.jsx', code);
    console.log("Fixed Bhutan page syntax v2");
} else {
    console.log("Tags not found v2");
}
