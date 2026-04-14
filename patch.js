const fs = require('fs');
const path = 'server/routes/marketingAds.js';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(
  'const result = await pool.query(query, [',
  'console.log("BODY", req.body); const params = [\n      bu_name, year, month || 0, \n      budget || 0, target_cpl || 0, pic_name || \x27\x27,\n      target_routes || 0, target_groups || 0, target_customers || 0, target_cpa || 0, target_leads || 0\n    ]; console.log("PARAMS", params); const result = await pool.query(query, params);\n//'
);
fs.writeFileSync(path, content);
