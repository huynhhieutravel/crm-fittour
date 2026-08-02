const fs = require('fs');

let routes = fs.readFileSync('server/routes/notification.js', 'utf8');
routes = routes.replace("const {", "const { getGlobalCenterLeads,");
routes = routes.replace("router.get('/in-app', authenticateToken, getInAppNotifications);", "router.get('/in-app', authenticateToken, getInAppNotifications);\nrouter.get('/global-center', authenticateToken, getGlobalCenterLeads);");
fs.writeFileSync('server/routes/notification.js', routes);

