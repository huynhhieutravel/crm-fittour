require('dotenv').config();
const db = require('../db/index');

function toTitleCase(str) {
  if(!str) return '';
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

async function run() {
  try {
    const res = await db.query('SELECT id, name FROM customers');
    let promises = [];
    for (let row of res.rows) {
      const newName = toTitleCase(row.name);
      if(newName !== row.name) {
        promises.push(db.query('UPDATE customers SET name = $1 WHERE id = $2', [newName, row.id]));
      }
    }
    await Promise.all(promises);

    const l_res = await db.query('SELECT id, name FROM leads');
    let l_promises = [];
    for (let row of l_res.rows) {
      const nName = toTitleCase(row.name);
      if(nName !== row.name) {
        l_promises.push(db.query('UPDATE leads SET name = $1 WHERE id = $2', [nName, row.id]));
      }
    }
    await Promise.all(l_promises);
    
    console.log(`Updated ${promises.length} customers and ${l_promises.length} leads to Title Case!`);
  } catch(e) {
    console.error(e);
  }
  process.exit();
}
run();
