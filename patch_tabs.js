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

    // Add Star icon import if not present
    if (!content.includes('Star') && content.includes('lucide-react')) {
        content = content.replace(/import\s+{([^}]*)}\s+from\s+'lucide-react';/, "import { $1, Star } from 'lucide-react';");
    }

    // colSpan="7" -> colSpan="8"
    content = content.replace(/colSpan="7"/g, 'colSpan="8"');

    // Table Header
    const thMarketRegex = /<th[^>]*>THỊ TRƯỜNG<\/th>/;
    if (content.match(thMarketRegex)) {
        content = content.replace(thMarketRegex, `$&
                            <th style={{ padding: '16px 20px', textAlign: 'center', width: '120px' }}>ĐÁNH GIÁ</th>`);
    }

    // Table Cell
    // It's usually after the market <td>. Let's find the market <td>.
    // Market <td> is characterized by rendering the item.market.
    // The items inside the <tr> use `item` or `h` or `tx` or `a` or `L` or `i` or `res` etc.
    // Let's use a regex to find the cell BEFORE the actions cell (THAO TÁC).
    // The actions cell usually has a <div style={{ display: 'flex' ... }}> <button> ... </div>
    // Let's match `<td ... textAlign: 'center'` which is the actions cell.
    
    // Actually, we can just replace the </td> before the actions cell? No, let's find the end of the market cell.
    // Market cell ends with </td>
    // Actions cell starts with <td style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
    
    const actionsTdRegex = /(<td style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>\s*<div[^>]*gap: '8px'[^>]*>)/;
    
    // We need to know what the mapping variable is.
    // E.g. h.id, r.id, item.id... We can extract it from the key={X.id}
    const mapVarMatch = content.match(/<tr key={([a-zA-Z0-9_]+)\.id}/);
    if (mapVarMatch) {
        const itemVar = mapVarMatch[1];
        
        const ratingCell = `
                                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                                        {Number(${itemVar}.rating) > 0 ? (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#f59e0b', fontWeight: 600 }}>
                                                {Number(${itemVar}.rating).toFixed(1)} <Star size={16} fill="#f59e0b" />
                                            </div>
                                        ) : (
                                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>-</span>
                                        )}
                                    </td>
                                    `;
        
        content = content.replace(actionsTdRegex, ratingCell + '$1');
    }
    
    fs.writeFileSync(file, content);
    console.log('Patched', file);
}
