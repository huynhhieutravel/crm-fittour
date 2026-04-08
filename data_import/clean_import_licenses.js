const XLSX = require('xlsx');
const path = require('path');

// === STEP 1: Clean xlsx ===
const inputFile = path.join(__dirname, 'raw/giay-phep.xlsx');
const wb = XLSX.readFile(inputFile);
const ws = wb.Sheets[wb.SheetNames[0]];
const range = XLSX.utils.decode_range(ws['!ref']);

range.e.c = Math.max(range.e.c, 1); // ensure col B
ws['!ref'] = XLSX.utils.encode_range(range);

const items = [];
for (let row = range.s.r; row <= range.e.r; row++) {
  const cellA = ws[XLSX.utils.encode_cell({r: row, c: 0})];
  const cellB = XLSX.utils.encode_cell({r: row, c: 1});
  if (cellA && cellA.v) {
    const name = cellA.v.trim();
    let link = '';
    if (cellA.l && cellA.l.Target) {
      link = cellA.l.Target.replace(/&amp;/g, '&');
      ws[cellB] = { v: link, t: 's' };
    }
    items.push({ name, link });
    console.log(`${row+1} | ${name} | ${link ? link.substring(0,60)+'...' : 'NO LINK'}`);
  }
}
XLSX.writeFile(wb, inputFile);
console.log('\n✅ Cleaned xlsx saved\n');

// === STEP 2: Import to DB ===
if (process.argv[2] === 'import') {
  const db = require('../server/db');
  (async () => {
    const client = await db.pool.connect();
    try {
      // Create table if not exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS licenses (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          link TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Table "licenses" ready');

      await client.query('BEGIN');
      let inserted = 0;
      for (const item of items) {
        if (!item.link) continue;
        const existing = await client.query('SELECT id FROM licenses WHERE LOWER(name) = LOWER($1)', [item.name]);
        if (existing.rows.length > 0) {
          console.log(`  SKIP: ${item.name} (exists)`);
          continue;
        }
        await client.query('INSERT INTO licenses (name, link) VALUES ($1, $2)', [item.name, item.link]);
        console.log(`  INSERTED: ${item.name}`);
        inserted++;
      }
      await client.query('COMMIT');
      console.log(`\n✅ Done! Inserted: ${inserted}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('ERROR:', err.message);
    } finally {
      client.release();
      db.pool.end();
    }
  })();
}
