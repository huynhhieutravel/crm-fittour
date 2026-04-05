const db = require('./server/db');
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
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let pass = '';
        for (let i = 0; i < 10; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return pass;
    };

    const client = await db.pool.connect();
    try {
        console.log("Bat dau tao users tren db production...");
        for (let u of userList) {
            const rawPassword = generatePassword();
            const hashedPassword = await bcrypt.hash(rawPassword, 10);
            
            // Check var
            const check = await client.query('SELECT id FROM users WHERE username=$1', [u.username]);
            if (check.rows.length === 0) {
                await client.query(`
                    INSERT INTO users (username, password, full_name, email, role_id, is_active) 
                    VALUES ($1, $2, $3, $4, $5, true)
                `, [u.username, hashedPassword, u.full_name, u.username + '@fittour.vn', role_id]);
                console.log(`- Tài khoản: ${u.username}`);
                console.log(`  Họ tên: ${u.full_name}`);
                console.log(`  Nhóm: Supreme Victory`);
                console.log(`  Mật khẩu: ${rawPassword}\n`);
            } else {
                console.log(`User ${u.username} da ton tai!`);
            }
        }
    } catch(err) {
        console.error(err);
    } finally {
        client.release();
        process.exit(0);
    }
}
createUsers();
