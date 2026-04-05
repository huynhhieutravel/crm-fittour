const fs = require('fs');

const files = [
    'client/src/components/modals/HotelDetailDrawer.jsx',
    'client/src/components/modals/RestaurantDetailDrawer.jsx',
    'client/src/components/modals/TransportDetailDrawer.jsx',
    'client/src/components/modals/TicketDetailDrawer.jsx',
    'client/src/components/modals/AirlineDetailDrawer.jsx',
    'client/src/components/modals/LandtourDetailDrawer.jsx',
    'client/src/components/modals/InsuranceDetailDrawer.jsx'
];

let totalFixes = 0;

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    let fixes = 0;

    // Fix 1: alert('Lỗi thêm ghi chú!') → addToast fallback
    if (content.includes("alert('Lỗi thêm ghi chú!');")) {
        content = content.replace(
            "alert('Lỗi thêm ghi chú!');",
            "if (addToast) addToast('Lỗi thêm ghi chú!', 'error'); else alert('Lỗi thêm ghi chú!');"
        );
        fixes++;
    }

    // Fix 2: Dead code — "if (addToast) X; else if (addToast) X; else alert(Y)" → "if (addToast) X; else alert(Y)"
    const deadCodePattern = /if \(addToast\) addToast\('Lỗi: ' \+ msg, 'error'\);\s*\n\s*else if \(addToast\) addToast\('Lỗi: ' \+ msg, 'error'\); else alert\('Lỗi: ' \+ msg\);/g;
    if (deadCodePattern.test(content)) {
        content = content.replace(deadCodePattern, 
            "if (addToast) addToast('Lỗi: ' + msg, 'error'); else alert('Lỗi: ' + msg);"
        );
        fixes++;
    }

    if (fixes > 0) {
        fs.writeFileSync(file, content);
        console.log(`✅ ${file} — ${fixes} fix(es)`);
        totalFixes += fixes;
    } else {
        console.log(`⏭️  ${file} — no changes needed`);
    }
}

console.log(`\nTotal: ${totalFixes} fixes applied.`);
