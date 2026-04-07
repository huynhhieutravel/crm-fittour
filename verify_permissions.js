const fs = require('fs');
const path = require('path');

const modalsDir = '/Volumes/T7 Loki SS/WORK Hiếu/crm-fittour/client/src/components/modals';

const files = [
    'GroupProjectDetailDrawer.jsx',
    'GroupHotelDetailDrawer.jsx',
    'GroupRestaurantDetailDrawer.jsx',
    'GroupTransportDetailDrawer.jsx',
    'GroupTicketDetailDrawer.jsx',
    'GroupAirlineDetailDrawer.jsx',
    'GroupLandtourDetailDrawer.jsx',
    'GroupInsuranceDetailDrawer.jsx',
    'HotelDetailDrawer.jsx',
    'RestaurantDetailDrawer.jsx',
    'TransportDetailDrawer.jsx',
    'TicketDetailDrawer.jsx',
    'AirlineDetailDrawer.jsx',
    'LandtourDetailDrawer.jsx',
    'InsuranceDetailDrawer.jsx',
];

let issues = 0;

files.forEach(filename => {
    const filepath = path.join(modalsDir, filename);
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Count duplicate imports
    const importLine = "import { isViewOnly as checkViewOnly } from '../../utils/permissions';";
    const importCount = (content.match(/import \{ isViewOnly as checkViewOnly \}/g) || []).length;
    
    if (importCount > 1) {
        // Remove all but first occurrence
        let first = true;
        content = content.replace(/import \{ isViewOnly as checkViewOnly \} from '\.\.\/\.\.\/utils\/permissions';\n/g, (match) => {
            if (first) { first = false; return match; }
            return '';
        });
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`🔧 FIXED duplicate import (${importCount} → 1): ${filename}`);
        issues++;
    }
    
    // Verify isViewOnly usage
    const viewOnlyMatch = content.match(/const isViewOnly = (.+);/);
    const hasCheckViewOnly = viewOnlyMatch && viewOnlyMatch[1].includes('checkViewOnly');
    const moduleGroup = filename.startsWith('Group') ? 'group' : 'suppliers';
    
    const finalImportCount = (content.match(/import \{ isViewOnly as checkViewOnly \}/g) || []).length;
    
    console.log(`${hasCheckViewOnly ? '✅' : '❌'} ${filename} — imports:${finalImportCount} — ${viewOnlyMatch ? viewOnlyMatch[0] : 'NO isViewOnly FOUND'}`);
});

if (issues === 0) console.log('\n🎉 Không có lỗi import trùng lặp!');
else console.log(`\n🔧 Đã sửa ${issues} file bị import trùng.`);
