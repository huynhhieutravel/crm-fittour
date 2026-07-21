const fs = require('fs');
let content = fs.readFileSync('client/src/tabs/DispatcherCenterTab.jsx', 'utf8');

// Rename component
content = content.replace(/const LeadsTab/g, 'const DispatcherCenterTab');
content = content.replace(/export default LeadsTab;/g, 'export default DispatcherCenterTab;');

// Replace headers
content = content.replace(
    /<th className="col-status">TRẠNG THÁI TƯ VẤN<\/th>[\s\S]*?<th className="col-actions">THAO TÁC<\/th>/,
    `<th className="col-market">PHÂN THỊ TRƯỜNG</th>
              <th className="col-notes">GHI CHÚ ĐIỀU PHỐI</th>
              <th className="col-dispatcher-action">ĐIỀU PHỐI</th>`
);

// We need to find the <td> elements corresponding to the removed <th> elements and replace them.
// The easiest way is to use a regex that matches the start of the status column down to the end of the row (</tr>).
// But it's risky if the HTML structure is complex. Let's see the render of a row first.
