const XLSX = require('xlsx');
const path = require('path');

const inputFile = path.join(__dirname, 'raw/bang-nha-hang.xlsx');
const wb = XLSX.readFile(inputFile);
const ws = wb.Sheets[wb.SheetNames[0]];
const range = XLSX.utils.decode_range(ws['!ref']);

let lastA = '', lastB = '';
const restaurants = [];

for (let row = range.s.r; row <= range.e.r; row++) {
  const cellA = ws[XLSX.utils.encode_cell({r: row, c: 0})];
  const cellB = ws[XLSX.utils.encode_cell({r: row, c: 1})];
  const cellC = ws[XLSX.utils.encode_cell({r: row, c: 2})];
  const cellD = ws[XLSX.utils.encode_cell({r: row, c: 3})];

  if (cellA && cellA.v) lastA = cellA.v.trim();
  if (cellB && cellB.v) lastB = cellB.v.trim();

  const name = cellC ? cellC.v.trim() : '';
  const driveLink = cellD ? cellD.v.trim() : '';

  // Skip if no restaurant name or no drive link
  if (!name || !driveLink) continue;

  // Map Sài Gòn -> TP.HCM to match existing market values
  let market = lastB;
  if (market === 'Sài Gòn') market = 'TP.HCM';

  restaurants.push({ name, market, region: lastA, driveLink });
}

console.log('Total restaurants to import:', restaurants.length);
console.log('---');
restaurants.forEach((r, i) => {
  console.log(`${i + 1} | ${r.market} | ${r.name} | ${r.driveLink.substring(0, 60)}...`);
});

// Now do the actual import
const MODE = process.argv[2]; // 'preview' or 'import'

if (MODE === 'import') {
  const db = require('../server/db');

  (async () => {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      
      let inserted = 0;
      let skipped = 0;
      
      for (const r of restaurants) {
        // Check if restaurant already exists by name
        const existing = await client.query(
          'SELECT id FROM restaurants WHERE LOWER(name) = LOWER($1)',
          [r.name]
        );
        
        if (existing.rows.length > 0) {
          // Update drive_link + market if missing
          await client.query(
            'UPDATE restaurants SET drive_link = COALESCE(drive_link, $1), market = COALESCE(NULLIF(market, \'\'), $2) WHERE id = $3',
            [r.driveLink, r.market, existing.rows[0].id]
          );
          console.log(`  UPDATED: ${r.name} (id=${existing.rows[0].id})`);
          skipped++;
          continue;
        }
        
        // Generate code: REST-001, REST-002, etc.
        const codeResult = await client.query(`
          SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 'REST-([0-9]+)') AS INT)), 0) + 1 as next_num 
          FROM restaurants WHERE code LIKE 'REST-%'
        `);
        const nextNum = codeResult.rows[0].next_num;
        const code = `REST-${String(nextNum).padStart(3, '0')}`;
        
        await client.query(
          `INSERT INTO restaurants (code, name, market, country, drive_link, rating) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [code, r.name, r.market, 'Việt Nam', r.driveLink, 0]
        );
        
        console.log(`  INSERTED: ${code} | ${r.market} | ${r.name}`);
        inserted++;
      }
      
      await client.query('COMMIT');
      console.log(`\n✅ Done! Inserted: ${inserted}, Updated: ${skipped}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('ERROR:', err.message);
    } finally {
      client.release();
      db.pool.end();
    }
  })();
} else {
  console.log('\nRun with "import" argument to actually insert into DB:');
  console.log('  node data_import/import_restaurants.js import');
}
