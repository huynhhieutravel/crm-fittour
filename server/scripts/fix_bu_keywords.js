const db = require('../db');
(async () => {
  const bu3 = await db.query("SELECT keywords FROM business_units WHERE id = $1", ['BU3']);
  let kw3 = bu3.rows[0].keywords || [];
  const before = kw3.length;
  kw3 = kw3.filter(k => !k.includes('doan') && !k.includes('đoàn'));
  const pg3 = '{' + kw3.map(k => '"' + k.replace(/"/g, '\\"') + '"').join(',') + '}';
  await db.query("UPDATE business_units SET keywords = $1 WHERE id = $2", [pg3, 'BU3']);
  console.log('Xoa ' + (before - kw3.length) + ' keywords chua doan/đoàn');
  console.log('BU3 keywords con lai:', kw3);
  process.exit(0);
})();
