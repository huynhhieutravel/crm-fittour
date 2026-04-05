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

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    // Replace: return alert('...');
    // With: return addToast ? addToast('...', 'warning') : alert('...');
    content = content.replace(/return alert\('([^']+)'\);/g, "return addToast ? addToast('$1', 'warning') : alert('$1');");

    // Replace: alert('Cập nhật thông tin thành công!');
    // With: if (addToast) addToast('Cập nhật thông tin thành công!', 'success'); else alert('Cập nhật thông tin thành công!');
    content = content.replace(/alert\('Cập nhật thông tin thành công!'\);/g, "if (addToast) addToast('Cập nhật thông tin thành công!', 'success'); else alert('Cập nhật thông tin thành công!');");

    // Replace: alert('Tạo XYZ thành công!');
    content = content.replace(/alert\('([^']+thành công!)'\);/g, "if (addToast) addToast('$1', 'success'); else alert('$1');");

    // Replace: alert('Lỗi: ' + ...);
    content = content.replace(/alert\('Lỗi: ' \+ ([^)]+)\);/g, "if (addToast) addToast('Lỗi: ' + $1, 'error'); else alert('Lỗi: ' + $1);");

    // Also: alert('Lỗi tải dữ liệu!'); etc.
    content = content.replace(/alert\('([^']+lỗi[^']+)'\);/gi, "if (addToast) addToast('$1', 'error'); else alert('$1');");

    fs.writeFileSync(file, content);
    console.log('Patched', file);
}
