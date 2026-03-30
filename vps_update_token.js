const db = require('/var/www/fittour-crm/server/db');
const TOKEN = 'EAFpN3ANSelEBRN5ghEL15hp9iG0pob7gw52sZCJfyUSDRf9WbUSuoVHKR2PpiSyCRxL3ELJsHR5GbIiqTsHWf0x4ilBtKfbetaRevdFygEQUAgHtRkpF7niSw6OIFS4vx5nw2yuF1fkRZAheQUAwg8jQb6ptNd3R7qbiZAnSF0QdoZAZAiEZCu3naZAqjEecgZDZD';
async function run() {
  const r = await db.query("UPDATE settings SET value=$1, updated_at=NOW() WHERE key='meta_page_access_token'", [TOKEN]);
  console.log('UPDATE:', r.rowCount);
  const v = await db.query("SELECT key, substring(value,1,40) as preview FROM settings WHERE key='meta_page_access_token'");
  console.log('VERIFY:', JSON.stringify(v.rows));
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
