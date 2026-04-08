const XLSX = require('xlsx');
const path = require('path');

const inputFile = path.join(__dirname, 'raw/khu-du-lich.xlsx');

// ═══ Vietnamese-aware Title Case ═══
function toTitleCase(str) {
  if (!str) return str;
  return str.split(/(\s+|-)/g).map((word) => {
    if (/^[\s-]+$/.test(word)) return word;
    if (word.length <= 2 && /^[A-Z]+$/.test(word)) return word;
    const lower = word.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join('');
}

// ═══ STEP 1: Clean the xlsx ═══
const wb = XLSX.readFile(inputFile, { cellStyles: true });
const sheetName = wb.SheetNames[0];
const ws = wb.Sheets[sheetName];
const range = XLSX.utils.decode_range(ws['!ref']);

console.log('Original range:', ws['!ref']);

// Expand to column D
range.e.c = Math.max(range.e.c, 3);
ws['!ref'] = XLSX.utils.encode_range(range);

let lastA = '', lastB = '';
const items = [];

for (let row = range.s.r; row <= range.e.r; row++) {
  const cellA = ws[XLSX.utils.encode_cell({ r: row, c: 0 })];
  const cellB = ws[XLSX.utils.encode_cell({ r: row, c: 1 })];
  const cellC = ws[XLSX.utils.encode_cell({ r: row, c: 2 })];
  const cellD = XLSX.utils.encode_cell({ r: row, c: 3 });

  // Title Case columns A, B, C
  if (cellA && cellA.v) {
    const orig = cellA.v;
    cellA.v = toTitleCase(orig);
    cellA.w = cellA.v;
    lastA = cellA.v;
    console.log(`A${row+1}: "${orig}" -> "${cellA.v}"`);
  }
  if (cellB && cellB.v) {
    const orig = cellB.v;
    cellB.v = toTitleCase(orig);
    cellB.w = cellB.v;
    lastB = cellB.v;
    console.log(`B${row+1}: "${orig}" -> "${cellB.v}"`);
  }
  if (cellC && cellC.v) {
    const orig = cellC.v;
    cellC.v = toTitleCase(orig);
    cellC.w = cellC.v;

    // Extract hyperlink to column D
    let driveLink = '';
    if (cellC.l && cellC.l.Target) {
      driveLink = cellC.l.Target.replace(/&amp;/g, '&');
      ws[cellD] = { v: driveLink, t: 's', l: { Target: driveLink } };
      console.log(`C${row+1}: "${orig}" -> "${cellC.v}" | D: ${driveLink.substring(0, 60)}...`);
    } else {
      console.log(`C${row+1}: "${orig}" -> "${cellC.v}" | D: (no link)`);
    }

    // Collect for import
    let market = lastB;
    if (market === 'Sài Gòn') market = 'TP.HCM';
    items.push({ name: cellC.v, market, region: lastA, driveLink });
  }
}

// Save cleaned xlsx
XLSX.writeFile(wb, inputFile);
console.log('\n✅ Cleaned xlsx saved to:', inputFile);

// ═══ STEP 2: Import into DB ═══
const MODE = process.argv[2];

if (MODE === 'import') {
  const db = require('../server/db');

  (async () => {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      let inserted = 0, skipped = 0;

      for (const r of items) {
        if (!r.name || !r.driveLink) { 
          console.log(`  SKIP (no link): ${r.name}`);
          skipped++;
          continue;
        }

        // Check existing
        const existing = await client.query(
          'SELECT id FROM tickets WHERE LOWER(name) = LOWER($1)', [r.name]
        );
        if (existing.rows.length > 0) {
          await client.query(
            'UPDATE tickets SET drive_link = COALESCE(drive_link, $1), market = COALESCE(NULLIF(market, \'\'), $2) WHERE id = $3',
            [r.driveLink, r.market, existing.rows[0].id]
          );
          console.log(`  UPDATED: ${r.name} (id=${existing.rows[0].id})`);
          skipped++;
          continue;
        }

        // Generate code
        const codeResult = await client.query(`
          SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 'TICK-([0-9]+)') AS INT)), 0) + 1 as next_num 
          FROM tickets WHERE code LIKE 'TICK-%'
        `);
        const nextNum = codeResult.rows[0].next_num;
        const code = `TICK-${String(nextNum).padStart(3, '0')}`;

        await client.query(
          `INSERT INTO tickets (code, name, market, country, drive_link, rating) VALUES ($1, $2, $3, $4, $5, $6)`,
          [code, r.name, r.market, 'Việt Nam', r.driveLink, 0]
        );

        console.log(`  INSERTED: ${code} | ${r.market} | ${r.name}`);
        inserted++;
      }

      await client.query('COMMIT');
      console.log(`\n✅ Done! Inserted: ${inserted}, Skipped/Updated: ${skipped}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('ERROR:', err.message);
    } finally {
      client.release();
      db.pool.end();
    }
  })();
} else {
  console.log('\n--- Items found ---');
  items.forEach((r, i) => console.log(`${i+1} | ${r.market} | ${r.name} | ${r.driveLink ? 'HAS LINK' : 'NO LINK'}`));
  console.log('\nRun with "import" to insert into DB:');
  console.log('  node data_import/clean_import_tickets.js import');
}
