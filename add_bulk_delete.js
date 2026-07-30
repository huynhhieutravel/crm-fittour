const fs = require('fs');
const path = require('path');

const tabs = [
    { file: 'RestaurantsTab.jsx', varName: 'restaurants', fetchFunc: 'fetchRestaurants', apiEndpoint: 'restaurants' },
    { file: 'HotelsTab.jsx', varName: 'hotels', fetchFunc: 'fetchHotels', apiEndpoint: 'hotels' },
    { file: 'TransportsTab.jsx', varName: 'transports', fetchFunc: 'fetchTransports', apiEndpoint: 'transports' },
    { file: 'TicketsTab.jsx', varName: 'tickets', fetchFunc: 'fetchTickets', apiEndpoint: 'tickets' },
    { file: 'LandtoursTab.jsx', varName: 'landtours', fetchFunc: 'fetchLandtours', apiEndpoint: 'landtours' },
    { file: 'InsurancesTab.jsx', varName: 'insurances', fetchFunc: 'fetchInsurances', apiEndpoint: 'insurances' },
    { file: 'VisaProvidersTab.jsx', varName: 'visaProviders', fetchFunc: 'fetchVisaProviders', apiEndpoint: 'visa-providers' },
    { file: 'AirlinesTab.jsx', varName: 'airlines', fetchFunc: 'fetchAirlines', apiEndpoint: 'airlines' },
    { file: 'B2BCompaniesTab.jsx', varName: 'b2bCompanies', fetchFunc: 'fetchB2bCompanies', apiEndpoint: 'b2b-companies' },
];

tabs.forEach(tab => {
    const filePath = path.join(__dirname, 'client/src/tabs', tab.file);
    if (!fs.existsSync(filePath)) {
        console.log('Skipping', filePath);
        return;
    }
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Add swalConfirm import if not exists
    if (!content.includes("import { swalConfirm }")) {
        content = content.replace("import React, { useState", "import { swalConfirm } from '../utils/swalHelpers';\nimport React, { useState");
    }

    // 2. Add actionLoading and selectedIds states
    if (!content.includes("const [actionLoading, setActionLoading]")) {
        content = content.replace("const [loading, setLoading] = useState(true);", "const [loading, setLoading] = useState(true);\n    const [actionLoading, setActionLoading] = useState(false);");
    }
    if (!content.includes("const [selectedIds, setSelectedIds]")) {
        content = content.replace("const [loading, setLoading] = useState(true);", "const [loading, setLoading] = useState(true);\n    const [selectedIds, setSelectedIds] = useState([]);");
    }

    // 3. Add handleBulkDelete function right before the return statement
    if (!content.includes("const handleBulkDelete")) {
        const bulkDeleteFunc = `
    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        const result = await swalConfirm('Bạn có chắc chắn xoá ' + selectedIds.length + ' mục đã chọn?');
        if (!result) return;
        
        setActionLoading(true);
        let successCount = 0;
        let failCount = 0;
        const token = localStorage.getItem('token');
        for (const id of selectedIds) {
            try {
                await axios.delete(\`/api/${tab.apiEndpoint}/\${id}?force=true\`, { headers: { Authorization: \`Bearer \${token}\` } });
                successCount++;
            } catch (err) {
                console.error(err);
                failCount++;
            }
        }
        setActionLoading(false);
        if (addToast) addToast('Đã xoá ' + successCount + ' mục. ' + (failCount > 0 ? 'Lỗi ' + failCount + ' mục.' : ''), successCount > 0 ? 'success' : 'error');
        setSelectedIds([]);
        ${tab.fetchFunc}();
    };

    return (`;
        const parts = content.split('\n    return (');
        if (parts.length > 1) {
            const firstPart = parts.shift();
            const rest = parts.join('\n    return (');
            content = firstPart + bulkDeleteFunc + rest;
        }
    }

    // 4. Add Bulk Delete button next to Thêm Mới
    if (!content.includes("handleBulkDelete} disabled={actionLoading}")) {
        const buttonHTML = `
                        {selectedIds.length > 0 && (
                            <button className="btn btn-danger" onClick={handleBulkDelete} disabled={actionLoading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '44px', padding: '0 1.5rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, background: '#ef4444', color: 'white', border: 'none', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.2)', cursor: 'pointer', whiteSpace: 'nowrap', marginRight: '8px' }}>
                                <Trash2 size={18} /> {actionLoading ? 'Đang xoá...' : 'Xoá ' + selectedIds.length + ' mục'}
                            </button>
                        )}
                        {(checkPerm`;
        content = content.replace("{(checkPerm", buttonHTML);
    }

    // 5. Add th for checkbox
    if (!content.includes("onChange={handleSelectAll}")) {
        const theadSearch = `<tr style={{ color: '#475569', fontSize: '0.8rem' }}>`;
        const theadReplace = `<tr style={{ color: '#475569', fontSize: '0.8rem' }}>
                            <th style={{ padding: '16px 20px', textAlign: 'center', width: '50px' }}>
                                <input type="checkbox" checked={${tab.varName}.length > 0 && selectedIds.length === ${tab.varName}.length} onChange={(e) => setSelectedIds(e.target.checked ? ${tab.varName}.map(item => item.id) : [])} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                            </th>`;
        content = content.replace(theadSearch, theadReplace);
    }

    // 6. Add td for checkbox in mapping
    const trMatch = content.match(/<tr key=\{([a-zA-Z0-9_]+)\.id\}[^]*?onMouseOut=\{[^}]+\}>/);
    if (trMatch && !content.includes("selectedIds.includes(" + trMatch[1] + ".id)")) {
        const loopVar = trMatch[1];
        const exactTrString = trMatch[0];
        const newTrString = exactTrString + `\n                                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }} onClick={e => e.stopPropagation()}>\n                                        <input type="checkbox" checked={selectedIds.includes(${loopVar}.id)} onChange={() => setSelectedIds(prev => prev.includes(${loopVar}.id) ? prev.filter(i => i !== ${loopVar}.id) : [...prev, ${loopVar}.id])} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />\n                                    </td>`;
        content = content.replace(exactTrString, newTrString);
        
        // Also increase colSpan for loading and empty state
        content = content.replace(/colSpan="(\d+)"/g, (match, p1) => 'colSpan="' + (parseInt(p1) + 1) + '"');
    }

    fs.writeFileSync(filePath, content);
    console.log('Patched', tab.file);
});
