const db = require('./db');

db.query(`
  SELECT u.username, u.full_name, u.position, 
  (SELECT count(*) FROM team_managers tm WHERE tm.user_id = u.id) as is_manager, 
  r.name as current_role 
  FROM users u 
  JOIN roles r ON u.role_id = r.id 
  WHERE u.username LIKE '%sale'
  ORDER BY u.username
`).then(res => {
  console.table(res.rows);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
