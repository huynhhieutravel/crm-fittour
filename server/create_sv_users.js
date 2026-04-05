const db = require('./db');
const bcrypt = require('bcryptjs');

async function createUsers() {
    const role_id = 6; // group_staff
    const userList = [
        { full_name: 'Trần Đức Mẫn', username: 'sv2.sale' },
        { full_name: 'Phạm Nguyễn Phương Thụy', username: 'sv3.sale' },
        { full_name: 'Nguyễn Huỳnh Hồng Trang', username: 'sv4.sale' },
        { full_name: 'Lê Thị Trang', username: 'sv5.sale' },
        { full_name: 'Hoàng Thị Hoa', username: 'sv6.sale' },
        { full_name: 'Hầu Quang Hưng', username: 'sv7.sale' }
    ];

    const generatePassword = () => {
        const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';
        let pass = '';
        for (let i = 0; i < 8; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return pass;
    };

    const client = await db.pool.connect();
    try {
        console.log("Bat dau reset mat khau tren db production...");
        for (let u of userList) {
            const rawPassword = generatePassword();
            const hashedPassword = await bcrypt.hash(rawPassword, 10);
            
            await client.query(`
                UPDATE users SET password = $1, full_name = $2, role_id = $3 WHERE username = $4
            `, [hashedPassword, u.full_name, role_id, u.username]);
            console.log(`- Tài khoản: ${u.username}`);
            console.log(`  Họ tên: ${u.full_name}`);
            console.log(`  Mật khẩu: ${rawPassword}\n`);
            
        }
    } catch(err) {
        console.error(err);
    } finally {
        client.release();
        process.exit(0);
    }
}
createUsers();
