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

    if (!content.includes('import StarRating')) {
        content = content.replace(/(import React.*?;\n)/, "$1import StarRating from '../common/StarRating';\n");
    }

    const searchStr = /<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>\s*<input type="number"[^\n]*value={formData\.rating}[^\n]*\/>\s*<span[^\n]*>★<\/span>\s*<\/div>/;

    const repStr = `<StarRating 
                                            rating={Number(formData.rating) || 0} 
                                            onChange={(val) => setFormData({...formData, rating: val})} 
                                            disabled={isViewOnly} 
                                        />`;

    if (content.match(searchStr)) {
        content = content.replace(searchStr, repStr);
        fs.writeFileSync(file, content);
        console.log('Patched', file);
    } else {
        console.log('Not patched (String not found):', file);
    }
}
