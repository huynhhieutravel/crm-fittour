// Quick fix: grant marketing permissions to all roles on VPS
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const roles = await pool.query("SELECT id, name FROM roles");
  const newPerms = await pool.query("SELECT id, module, action FROM permissions_master WHERE module IN ('marketing_ads','marketing_dashboard')");
  console.log("Roles:", roles.rows.length, "| Perms:", newPerms.rows.length);
  let count = 0;
  for (const role of roles.rows) {
    for (const perm of newPerms.rows) {
      try {
        await pool.query("INSERT INTO role_permissions_v2 (role_id, permission_id, granted) VALUES ($1, $2, true) ON CONFLICT (role_id, permission_id) DO NOTHING", [role.id, perm.id]);
        count++;
      } catch(e) { console.log("Skip:", e.message); }
    }
  }
  console.log("✅ Granted " + count + " role-permission pairs");
  await pool.end();
}
run().catch(e => { console.error("❌", e.message); process.exit(1); });
