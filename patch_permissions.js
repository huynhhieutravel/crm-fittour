/**
 * Script tự động cập nhật tất cả Drawer files để sử dụng permissions.js trung tâm
 * Thay thế logic isViewOnly hardcode bằng import từ utils/permissions.js
 */
const fs = require('fs');
const path = require('path');

const modalsDir = '/Volumes/T7 Loki SS/WORK Hiếu/crm-fittour/client/src/components/modals';

// Group Drawers → moduleGroup = 'group'
const groupDrawers = [
    'GroupProjectDetailDrawer.jsx',
    'GroupHotelDetailDrawer.jsx',
    'GroupRestaurantDetailDrawer.jsx',
    'GroupTransportDetailDrawer.jsx',
    'GroupTicketDetailDrawer.jsx',
    'GroupAirlineDetailDrawer.jsx',
    'GroupLandtourDetailDrawer.jsx',
    'GroupInsuranceDetailDrawer.jsx',
];

// Supplier Drawers → moduleGroup = 'suppliers'
const supplierDrawers = [
    'HotelDetailDrawer.jsx',
    'RestaurantDetailDrawer.jsx',
    'TransportDetailDrawer.jsx',
    'TicketDetailDrawer.jsx',
    'AirlineDetailDrawer.jsx',
    'LandtourDetailDrawer.jsx',
    'InsuranceDetailDrawer.jsx',
];

let totalFixed = 0;

function patchFile(filename, moduleGroup) {
    const filepath = path.join(modalsDir, filename);
    if (!fs.existsSync(filepath)) { 
        console.log(`⚠️  SKIP (not found): ${filename}`); 
        return; 
    }
    
    let content = fs.readFileSync(filepath, 'utf8');
    let changed = false;

    // 1. Add import if not already present
    if (!content.includes("from '../../utils/permissions'")) {
        // Insert after last import line
        const importMatch = content.match(/^(import .+;\n)+/m);
        if (importMatch) {
            const lastImportEnd = importMatch.index + importMatch[0].length;
            content = content.slice(0, lastImportEnd) + 
                "import { isViewOnly as checkViewOnly } from '../../utils/permissions';\n" + 
                content.slice(lastImportEnd);
            changed = true;
        }
    }

    // 2. Replace ALL old isViewOnly patterns
    // Pattern 1: const isViewOnly = !['admin', ...].includes(currentUser?.role);
    const pattern1 = /const isViewOnly = !\[.*?\]\.includes\(currentUser\?\.role\);/;
    if (pattern1.test(content)) {
        content = content.replace(pattern1, `const isViewOnly = checkViewOnly(currentUser?.role, '${moduleGroup}');`);
        changed = true;
    }

    // Pattern 2: const isViewOnly = currentUser?.role !== 'admin' && ...;
    const pattern2 = /const isViewOnly = currentUser\?\.role !== 'admin'.*?;/;
    if (pattern2.test(content)) {
        content = content.replace(pattern2, `const isViewOnly = checkViewOnly(currentUser?.role, '${moduleGroup}');`);
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`✅ PATCHED: ${filename} → moduleGroup: '${moduleGroup}'`);
        totalFixed++;
    } else {
        console.log(`ℹ️  NO CHANGE: ${filename}`);
    }
}

// Apply patches
console.log('=== PATCHING GROUP DRAWERS ===');
groupDrawers.forEach(f => patchFile(f, 'group'));

console.log('\n=== PATCHING SUPPLIER DRAWERS ===');
supplierDrawers.forEach(f => patchFile(f, 'suppliers'));

console.log(`\n🎉 Total files patched: ${totalFixed}`);
