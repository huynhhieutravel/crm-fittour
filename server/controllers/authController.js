const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

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

// Silent token refresh — re-issue JWT with latest role from DB
exports.refreshToken = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT u.id, u.username, u.full_name, u.is_active, COALESCE(r.name, u.role) as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = $1',
            [req.user.id]
        );
        if (result.rows.length === 0) return res.status(401).json({ message: 'User not found' });

        const user = result.rows[0];
        if (!user.is_active) return res.status(403).json({ message: 'Tài khoản đã bị vô hiệu hóa.' });

        const token = jwt.sign(
            { id: user.id, username: user.username, full_name: user.full_name, role: user.role_name },
            process.env.JWT_SECRET,
            { expiresIn: '14d' }
        );

        res.json({
            token,
            user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role_name }
        });
    } catch (err) {
        console.error('Token refresh error:', err);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};

exports.googleAuth = (req, res) => {
    const { sync_token } = req.query;
    const url = googleClient.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
        prompt: 'consent',
        state: sync_token ? `sync_${sync_token}` : undefined
    });
    res.redirect(url);
};

exports.googleCallback = async (req, res) => {
    const { code, state } = req.query;
    if (!code) return res.redirect('/login?error=no_code');
    
    try {
        const { tokens } = await googleClient.getToken(code);
        googleClient.setCredentials(tokens);
        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const email = payload.email;

        // Handle Sync Flow
        if (state && state.startsWith('sync_')) {
            const token = state.replace('sync_', '');
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const userId = decoded.id;
                
                await db.query('UPDATE users SET google_email = $1 WHERE id = $2', [email, userId]);
                return res.redirect('/?toast=google_sync_success');
            } catch (err) {
                console.error('Sync Token Verify Error:', err);
                return res.redirect('/?toast=google_sync_failed');
            }
        }

        // Normal Login Flow
        const result = await db.query(
            'SELECT u.*, COALESCE(r.name, u.role) as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.email = $1 OR u.username = $2 OR u.google_email = $1',
            [email, email]
        );

        if (result.rows.length === 0) {
            return res.redirect('/login?error=account_not_found');
        }

        const user = result.rows[0];
        if (user.is_active === false) {
             return res.redirect('/login?error=account_disabled');
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, full_name: user.full_name, role: user.role_name },
            process.env.JWT_SECRET,
            { expiresIn: '14d' }
        );

        const userStr = JSON.stringify({
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            role: user.role_name
        });

        // Redirect to frontend with token and user in URL
        res.redirect(`/?token=${token}&user=${encodeURIComponent(userStr)}`);
    } catch (error) {
        console.error('Google Callback Error:', error);
        res.redirect('/login?error=google_auth_failed');
    }
};
