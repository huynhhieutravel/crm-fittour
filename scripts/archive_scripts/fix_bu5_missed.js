const db = require('../server/db');
async function fixMissing() {
  const kws = ['pakistan', 'tây á', 'trung đông', 'tay a', 'trung dong'];
  const res = await db.query("SELECT id, name, code, destination FROM tour_templates WHERE bu_group = 'BU2'");
  let cnt = 0;
  for (let t of res.rows) {
    const text = [t.name, t.code, t.destination].join(' ').toLowerCase();
    if (kws.some(k => text.includes(k))) {
       await db.query("UPDATE tour_templates SET bu_group = 'BU5' WHERE id = $1", [t.id]);
       cnt++;
    }
  }
  console.log(`Updated ${cnt} missed tours to BU5.`);
  process.exit(0);
}
fixMissing();
