const db = require('../db');

// GET /api/announcements - Lấy danh sách thông báo & quyết định
exports.getAnnouncements = async (req, res) => {
    try {
        const { search, category, status, year } = req.query;
        let query = `
            SELECT 
                a.*,
                u.full_name AS signer_user_full_name,
                u.avatar_url AS signer_user_avatar,
                u.position AS signer_user_position,
                c.full_name AS creator_full_name
            FROM official_announcements a
            LEFT JOIN users u ON a.signer_id = u.id
            LEFT JOIN users c ON a.created_by = c.id
            WHERE 1=1
        `;
        const params = [];
        let pIndex = 1;

        if (search && search.trim()) {
            const s = `%${search.trim()}%`;
            query += ` AND (a.title ILIKE $${pIndex} OR a.code ILIKE $${pIndex} OR a.summary ILIKE $${pIndex} OR a.signer_name ILIKE $${pIndex} OR a.recipient_scope ILIKE $${pIndex})`;
            params.push(s);
            pIndex++;
        }

        if (category && category !== 'all') {
            query += ` AND a.category = $${pIndex}`;
            params.push(category);
            pIndex++;
        }

        if (status && status !== 'all') {
            query += ` AND a.status = $${pIndex}`;
            params.push(status);
            pIndex++;
        }

        if (year && !isNaN(parseInt(year))) {
            query += ` AND EXTRACT(YEAR FROM a.issue_date) = $${pIndex}`;
            params.push(parseInt(year));
            pIndex++;
        }

        query += ` ORDER BY a.is_pinned DESC, a.issue_date DESC, a.id DESC`;

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching announcements:', err);
        res.status(500).json({ message: 'Lỗi tải danh sách văn bản: ' + err.message });
    }
};

// GET /api/announcements/suggest-code - Tự sinh mã văn bản tiếp theo
exports.suggestNextCode = async (req, res) => {
    try {
        const type = (req.query.type || 'TB').toUpperCase().trim();
        const prefix = type === 'QD' || type === 'QUYET_DINH' ? 'QĐ' : (type === 'QC' ? 'QC' : 'TB');
        
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');

        // Tìm các mã cùng loại trong tháng/năm hiện tại
        const pattern = `${prefix}-${year}/${month}/%-FIT`;
        const result = await db.query(
            `SELECT code FROM official_announcements WHERE code LIKE $1 ORDER BY id DESC`,
            [pattern]
        );

        let nextSeq = 1;
        if (result.rows.length > 0) {
            // Trích xuất số thứ tự cao nhất
            const seqs = result.rows.map(r => {
                const match = r.code.match(/(\d+)-FIT$/i);
                return match ? parseInt(match[1], 10) : 0;
            });
            const maxSeq = Math.max(...seqs, 0);
            nextSeq = maxSeq + 1;
        }

        const nextCode = `${prefix}-${year}/${month}/${String(nextSeq).padStart(2, '0')}-FIT`;
        res.json({ code: nextCode, seq: nextSeq, prefix, year, month });
    } catch (err) {
        console.error('Error suggesting code:', err);
        res.status(500).json({ message: 'Lỗi sinh mã văn bản: ' + err.message });
    }
};

// GET /api/announcements/:id - Chi tiết 1 văn bản
exports.getAnnouncementById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(`
            SELECT 
                a.*,
                u.full_name AS signer_user_full_name,
                u.avatar_url AS signer_user_avatar,
                u.position AS signer_user_position,
                u.email AS signer_user_email,
                c.full_name AS creator_full_name
            FROM official_announcements a
            LEFT JOIN users u ON a.signer_id = u.id
            LEFT JOIN users c ON a.created_by = c.id
            WHERE a.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy văn bản' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching announcement by ID:', err);
        res.status(500).json({ message: 'Lỗi tải chi tiết văn bản: ' + err.message });
    }
};

// GET /api/announcements/public/latest - Lấy văn bản ghim hoặc mới nhất để hiện popup
exports.getLatestAnnouncement = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                a.*,
                u.full_name AS signer_user_full_name,
                u.avatar_url AS signer_user_avatar,
                u.position AS signer_user_position,
                c.full_name AS creator_full_name
            FROM official_announcements a
            LEFT JOIN users u ON a.signer_id = u.id
            LEFT JOIN users c ON a.created_by = c.id
            WHERE a.status = 'published'
            ORDER BY a.is_pinned DESC, a.issue_date DESC, a.id DESC
            LIMIT 1
        `);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Chưa có thông báo nào' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching latest announcement:', err);
        res.status(500).json({ message: 'Lỗi tải thông báo: ' + err.message });
    }
};

// GET /api/announcements/public/:idOrCode - Xem trực tiếp công khai không cần token
exports.getPublicAnnouncement = async (req, res) => {
    try {
        const { idOrCode } = req.params;
        let query = `
            SELECT 
                a.*,
                u.full_name AS signer_user_full_name,
                u.avatar_url AS signer_user_avatar,
                u.position AS signer_user_position,
                u.email AS signer_user_email,
                c.full_name AS creator_full_name
            FROM official_announcements a
            LEFT JOIN users u ON a.signer_id = u.id
            LEFT JOIN users c ON a.created_by = c.id
            WHERE 
        `;
        let params = [];
        if (!isNaN(parseInt(idOrCode)) && String(parseInt(idOrCode)) === String(idOrCode)) {
            query += ` a.id = $1 `;
            params.push(parseInt(idOrCode));
        } else {
            query += ` a.code ILIKE $1 OR a.id::text = $1 `;
            params.push(idOrCode.trim());
        }

        const result = await db.query(query, params);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy văn bản' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching public announcement:', err);
        res.status(500).json({ message: 'Lỗi tải văn bản: ' + err.message });
    }
};

// POST /api/announcements - Tạo văn bản mới
exports.createAnnouncement = async (req, res) => {
    try {
        const {
            code,
            title,
            category,
            issue_date,
            effective_date,
            signer_id,
            signer_name,
            signer_position,
            recipient_scope,
            summary,
            content_html,
            attachment_url,
            is_pinned,
            status
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Tiêu đề văn bản là bắt buộc' });
        }
        if (!code || !code.trim()) {
            return res.status(400).json({ message: 'Mã số văn bản là bắt buộc' });
        }
        if (!content_html || !content_html.trim()) {
            return res.status(400).json({ message: 'Nội dung văn bản là bắt buộc' });
        }

        // Kiểm tra trùng mã
        const existing = await db.query('SELECT id FROM official_announcements WHERE code = $1', [code.trim()]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: `Mã văn bản "${code.trim()}" đã tồn tại trên hệ thống!` });
        }

        // Nếu có signer_id nhưng chưa có signer_name, tự lấy từ bảng users
        let finalSignerName = signer_name;
        let finalSignerPosition = signer_position;
        if (signer_id && (!finalSignerName || !finalSignerPosition)) {
            const userRes = await db.query('SELECT full_name, position FROM users WHERE id = $1', [signer_id]);
            if (userRes.rows.length > 0) {
                if (!finalSignerName) finalSignerName = userRes.rows[0].full_name;
                if (!finalSignerPosition) finalSignerPosition = userRes.rows[0].position || 'Người được uỷ quyền';
            }
        }

        const result = await db.query(`
            INSERT INTO official_announcements (
                code,
                title,
                category,
                issue_date,
                effective_date,
                signer_id,
                signer_name,
                signer_position,
                recipient_scope,
                summary,
                content_html,
                attachment_url,
                is_pinned,
                status,
                created_by,
                created_at,
                updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            ) RETURNING *
        `, [
            code.trim(),
            title.trim(),
            category || 'Thông báo',
            issue_date || new Date().toISOString().split('T')[0],
            effective_date || null,
            signer_id || null,
            finalSignerName || null,
            finalSignerPosition || null,
            recipient_scope || 'Toàn thể CBNV',
            summary || null,
            content_html,
            attachment_url || null,
            Boolean(is_pinned),
            status || 'published',
            req.user?.id || null
        ]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating announcement:', err);
        res.status(500).json({ message: 'Lỗi tạo văn bản: ' + err.message });
    }
};

// PUT /api/announcements/:id - Cập nhật văn bản
exports.updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            code,
            title,
            category,
            issue_date,
            effective_date,
            signer_id,
            signer_name,
            signer_position,
            recipient_scope,
            summary,
            content_html,
            attachment_url,
            is_pinned,
            status
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Tiêu đề văn bản là bắt buộc' });
        }
        if (!code || !code.trim()) {
            return res.status(400).json({ message: 'Mã số văn bản là bắt buộc' });
        }

        // Kiểm tra trùng mã với bản ghi khác
        const existing = await db.query('SELECT id FROM official_announcements WHERE code = $1 AND id != $2', [code.trim(), id]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: `Mã văn bản "${code.trim()}" đã tồn tại trên một văn bản khác!` });
        }

        let finalSignerName = signer_name;
        let finalSignerPosition = signer_position;
        if (signer_id && (!finalSignerName || !finalSignerPosition)) {
            const userRes = await db.query('SELECT full_name, position FROM users WHERE id = $1', [signer_id]);
            if (userRes.rows.length > 0) {
                if (!finalSignerName) finalSignerName = userRes.rows[0].full_name;
                if (!finalSignerPosition) finalSignerPosition = userRes.rows[0].position || 'Người được uỷ quyền';
            }
        }

        const result = await db.query(`
            UPDATE official_announcements SET
                code = $1,
                title = $2,
                category = $3,
                issue_date = $4,
                effective_date = $5,
                signer_id = $6,
                signer_name = $7,
                signer_position = $8,
                recipient_scope = $9,
                summary = $10,
                content_html = $11,
                attachment_url = $12,
                is_pinned = $13,
                status = $14,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $15
            RETURNING *
        `, [
            code.trim(),
            title.trim(),
            category || 'Thông báo',
            issue_date || new Date().toISOString().split('T')[0],
            effective_date || null,
            signer_id || null,
            finalSignerName || null,
            finalSignerPosition || null,
            recipient_scope || 'Toàn thể CBNV',
            summary || null,
            content_html,
            attachment_url || null,
            Boolean(is_pinned),
            status || 'published',
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy văn bản để cập nhật' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating announcement:', err);
        res.status(500).json({ message: 'Lỗi cập nhật văn bản: ' + err.message });
    }
};

// DELETE /api/announcements/:id - Xóa văn bản
exports.deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM official_announcements WHERE id = $1 RETURNING id, code, title', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy văn bản' });
        }
        res.json({ message: 'Đã xóa văn bản thành công', deleted: result.rows[0] });
    } catch (err) {
        console.error('Error deleting announcement:', err);
        res.status(500).json({ message: 'Lỗi xóa văn bản: ' + err.message });
    }
};
