/**
 * Script: Sync employee nicknames from Google Sheet into users table
 * Can be run manually or as part of deployment
 */
const { up } = require('../migrations/20261030_add_nickname_to_users');

up()
    .then(() => {
        console.log('✅ Hoàn tất script đồng bộ nickname!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Thất bại:', err);
        process.exit(1);
    });

