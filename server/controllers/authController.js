const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const usernameWithAt = username.startsWith('@') ? username : `@${username}`;
        const usernameWithoutAt = username.startsWith('@') ? username.substring(1) : username;

        const result = await db.query(
            'SELECT u.*, COALESCE(r.name, u.role) as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.username = $1 OR u.username = $2 OR u.email = $3',
            [usernameWithAt, usernameWithoutAt, username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Người dùng không tồn tại' });
        }

        const user = result.rows[0];

        if (user.is_active === false) {
             return res.status(403).json({ message: 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ Quản trị viên.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
             return res.status(401).json({ message: 'Mật khẩu không chính xác' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, full_name: user.full_name, role: user.role_name },
            process.env.JWT_SECRET,
            { expiresIn: '14d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                role: user.role_name
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};
