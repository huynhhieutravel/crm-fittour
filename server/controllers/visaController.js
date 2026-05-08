const db = require('../db');
const { logActivity } = require('../utils/logger');

// === VISAS ===
exports.getAll = async (req, res) => {
    try {
        const { search, status, market, page = 1, limit = 30 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT v.*, u1.full_name as created_by_name, u2.full_name as handled_by_name FROM visas v LEFT JOIN users u1 ON v.created_by = u1.id LEFT JOIN users u2 ON v.handled_by = u2.id WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as total FROM visas v WHERE 1=1';
        let params = [];
        let paramIndex = 1;

        if (search) {
            const searchClause = ` AND (v.name ILIKE $${paramIndex} OR v.code ILIKE $${paramIndex} OR v.customer_name ILIKE $${paramIndex})`;
            query += searchClause;
            countQuery += searchClause;
            params.push(`%${search}%`);
            paramIndex++;
        }
        
        if (status) {
            const filterClause = ` AND v.status = $${paramIndex}`;
            query += filterClause;
            countQuery += filterClause;
            params.push(status);
            paramIndex++;
        }

        if (market) {
            const filterClause = ` AND v.market = $${paramIndex}`;
            query += filterClause;
            countQuery += filterClause;
            params.push(market);
            paramIndex++;
        }

        query += ` ORDER BY v.id DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        const queryParams = [...params, limit, offset];

        const [dataResult, countResult, statusCountsResult] = await Promise.all([
            db.query(query, queryParams),
            db.query(countQuery, params),
            // Always fetch status counts (unfiltered) for the pills
            db.query('SELECT status, COUNT(*) as count FROM visas GROUP BY status')
        ]);

        const total = parseInt(countResult.rows[0].total, 10);
        const statusCounts = {};
        statusCountsResult.rows.forEach(r => { statusCounts[r.status] = parseInt(r.count, 10); });

        res.json({
            data: dataResult.rows,
            total,
            statusCounts,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error('Lỗi getAll visas:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.getDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const entityRes = await db.query('SELECT v.*, u1.full_name as created_by_name, u2.full_name as handled_by_name FROM visas v LEFT JOIN users u1 ON v.created_by = u1.id LEFT JOIN users u2 ON v.handled_by = u2.id WHERE v.id = $1', [id]);
        if (entityRes.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy hồ sơ Visa' });
        const entity = entityRes.rows[0];

        const membersRes = await db.query('SELECT * FROM visa_members WHERE visa_id = $1 ORDER BY id ASC', [id]);
        entity.members = membersRes.rows;

        // Fetch receipts/vouchers logic handled on client side via common APIs, or optionally added here if needed.

        res.json(entity);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

exports.create = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { code, name, customer_id, customer_name, customer_phone, customer_type, status, market, visa_type, receipt_date, result_date, fingerprint_date, stamp_date, return_date, quantity, service_package, is_urgent, is_evisa, exchange_rate, booking_code, branch, notes, handled_by, members, finance_data } = req.body;
        const created_by = req.user?.id;

        await client.query('BEGIN');

        const result = await client.query(
            `INSERT INTO visas (code, name, customer_id, customer_name, customer_phone, customer_type, status, market, visa_type, receipt_date, result_date, fingerprint_date, stamp_date, return_date, quantity, service_package, is_urgent, is_evisa, exchange_rate, booking_code, branch, notes, created_by, handled_by, finance_data) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25) RETURNING *`,
            [code, name, customer_id || null, customer_name, customer_phone, customer_type, status || 'Tạo mới', market, visa_type, receipt_date || null, result_date || null, fingerprint_date || null, stamp_date || null, return_date || null, quantity || 1, service_package, is_urgent || false, is_evisa || false, exchange_rate || 1, booking_code, branch, notes, created_by, handled_by || null, finance_data ? JSON.stringify(finance_data) : '[]']
        );
        const newId = result.rows[0].id;

        if (members && Array.isArray(members)) {
            for (const m of members) {
                if (m.fullname && m.fullname.trim() !== '') {
                    await client.query(
                        'INSERT INTO visa_members (visa_id, fullname, passport_number, phone, dob, age_type, checklist_data, evaluation_data) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                        [newId, m.fullname, m.passport_number, m.phone, m.dob || null, m.age_type || 'Người lớn', m.checklist_data ? JSON.stringify(m.checklist_data) : '[]', m.evaluation_data ? JSON.stringify(m.evaluation_data) : '{}']
                    );
                }
            }
        }

        await client.query('COMMIT');

        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'CREATE',
                entity_type: 'VISA',
                entity_id: newId,
                details: `Đã thêm hồ sơ Visa: ${name}`,
                new_data: result.rows[0]
            });
        }

        res.status(201).json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
};

exports.update = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { id } = req.params;
        const { code, name, customer_id, customer_name, customer_phone, customer_type, status, market, visa_type, receipt_date, result_date, fingerprint_date, stamp_date, return_date, quantity, service_package, is_urgent, is_evisa, exchange_rate, booking_code, branch, notes, handled_by, members, deleted_member_ids, finance_data } = req.body;

        await client.query('BEGIN');

        // Fetch old data for logging
        const oldVisaRes = await client.query('SELECT * FROM visas WHERE id = $1', [id]);
        if (oldVisaRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Không tìm thấy hồ sơ Visa' });
        }
        const oldVisa = oldVisaRes.rows[0];

        const result = await client.query(
            `UPDATE visas SET code=$1, name=$2, customer_id=$3, customer_name=$4, customer_phone=$5, customer_type=$6, status=$7, market=$8, visa_type=$9, receipt_date=$10, result_date=$11, fingerprint_date=$12, stamp_date=$13, return_date=$14, quantity=$15, service_package=$16, is_urgent=$17, is_evisa=$18, exchange_rate=$19, booking_code=$20, branch=$21, notes=$22, handled_by=$23, finance_data=$24, updated_at=CURRENT_TIMESTAMP WHERE id=$25 RETURNING *`,
            [code, name, customer_id || null, customer_name, customer_phone, customer_type, status, market, visa_type, receipt_date || null, result_date || null, fingerprint_date || null, stamp_date || null, return_date || null, quantity || 1, service_package, is_urgent || false, is_evisa || false, exchange_rate || 1, booking_code, branch, notes, handled_by || null, finance_data ? JSON.stringify(finance_data) : '[]', id]
        );

        if (deleted_member_ids && deleted_member_ids.length > 0) {
            await client.query('DELETE FROM visa_members WHERE id = ANY($1::int[])', [deleted_member_ids]);
        }

        if (members !== undefined && Array.isArray(members)) {
            for (const m of members) {
                if (!m.fullname || m.fullname.trim() === '') continue;
                if (typeof m.id === 'string' || Number(m.id) > 1000000000) {
                    // Mới
                    await client.query(
                        'INSERT INTO visa_members (visa_id, fullname, passport_number, phone, dob, age_type, checklist_data, evaluation_data) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                        [id, m.fullname, m.passport_number, m.phone, m.dob || null, m.age_type || 'Người lớn', m.checklist_data ? JSON.stringify(m.checklist_data) : '[]', m.evaluation_data ? JSON.stringify(m.evaluation_data) : '{}']
                    );
                } else {
                    // Update
                    await client.query(
                        'UPDATE visa_members SET fullname=$1, passport_number=$2, phone=$3, dob=$4, age_type=$5, checklist_data=$6, evaluation_data=$7 WHERE id=$8',
                        [m.fullname, m.passport_number, m.phone, m.dob || null, m.age_type || 'Người lớn', m.checklist_data ? JSON.stringify(m.checklist_data) : '[]', m.evaluation_data ? JSON.stringify(m.evaluation_data) : '{}', m.id]
                    );
                }
            }
        }

        await client.query('COMMIT');

        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'UPDATE',
                entity_type: 'VISA',
                entity_id: id,
                details: `Cập nhật hồ sơ Visa: ${name}`,
                old_data: oldVisa,
                new_data: result.rows[0]
            });
        }

        res.json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Guard Clause: Prevent deleting if vouchers exist
        const voucherCheck = await db.query('SELECT COUNT(*) as c FROM payment_vouchers WHERE visa_id = $1 AND status != $2', [id, 'Đã hủy']);
        if (Number(voucherCheck.rows[0].c) > 0) {
            return res.status(400).json({ message: 'Không thể xoá hồ sơ Visa khi đã có Phiếu thu. Vui lòng hủy các Phiếu thu liên quan trước!' });
        }

        // Fetch old data for logging
        const oldVisaRes = await db.query('SELECT * FROM visas WHERE id = $1', [id]);
        if (oldVisaRes.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy hồ sơ Visa' });
        const oldVisa = oldVisaRes.rows[0];

        await db.query('DELETE FROM visas WHERE id = $1', [id]);
        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'DELETE',
                entity_type: 'VISA',
                entity_id: id,
                details: `Xóa hồ sơ Visa: ${oldVisa.name}`,
                old_data: oldVisa
            });
        }
        res.json({ message: 'Xóa thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// Quick status update (approve / reject from list)
exports.patchStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) return res.status(400).json({ message: 'Thiếu trạng thái' });

        // Fetch old data for logging
        const oldVisaRes = await db.query('SELECT * FROM visas WHERE id = $1', [id]);
        if (oldVisaRes.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy hồ sơ' });
        const oldVisa = oldVisaRes.rows[0];

        const result = await db.query(
            'UPDATE visas SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, status',
            [status, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy hồ sơ' });

        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'UPDATE',
                entity_type: 'VISA',
                entity_id: id,
                details: `Cập nhật trạng thái Visa #${id} → ${status}`,
                old_data: oldVisa,
                new_data: result.rows[0]
            });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};
