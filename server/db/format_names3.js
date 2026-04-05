require('dotenv').config();
const db = require('./index');

function toTitleCase(str) {
  if(!str) return '';
  return str.toLowerCase().split(' ').map(word => {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

async function run() {
  try {
    console.log("STARTING UPDATE");
    const {rows} = await db.query('SELECT id, name FROM customers');
    let cnt=0;
    for (let r of rows) {
      if(!r.name) continue;
      const nName = toTitleCase(r.name);
      if(nName !== r.name) {
        await db.query('UPDATE customers SET name=$1 WHERE id=$2', [nName, r.id]);
        cnt++;
        console.log("Updated", r.name, "->", nName);
      }
    }
    
    console.log("DONE customers, updated cnt:", cnt);

    const l_res = await db.query('SELECT id, name FROM leads');
    let l_cnt=0;
    for(let r of l_res.rows) {
      if(!r.name) continue;
      const nName = toTitleCase(r.name);
      if(nName !== r.name) {
        await db.query('UPDATE leads SET name=$1 WHERE id=$2', [nName, r.id]);
        l_cnt++;
      }
    }
    console.log('Updated '+cnt+' custs, '+l_cnt+' leads');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
