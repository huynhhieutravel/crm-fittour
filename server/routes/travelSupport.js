const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth');
const { logActivity } = require('../utils/logger');

router.use(authenticateToken);

// Lấy danh sách dịch vụ hỗ trợ
router.get('/', async (req, res) => {
    try {
        const { start_date, end_date, service_type, sale_id, status } = req.query;
        let query = `
            SELECT t.*, u.username as sale_name 
            FROM travel_support_services t
            LEFT JOIN users u ON t.sale_id = u.id
            WHERE 1=1
        `;
        let params = [];
        let count = 1;

        if (start_date) {
            query += ` AND usage_date >= $${count++}`;
            params.push(start_date);
        }
        if (end_date) {
            query += ` AND usage_date <= $${count++}`;
            params.push(end_date);
        }
        if (service_type && service_type !== 'All') {
            query += ` AND service_type = $${count++}`;
            params.push(service_type);
        }
        if (sale_id) {
            query += ` AND sale_id = $${count++}`;
            params.push(sale_id);
        }
        if (status && status !== 'All') {
            query += ` AND status = $${count++}`;
            params.push(status);
        }

        query += ` ORDER BY usage_date DESC, created_at DESC`;

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách dịch vụ hỗ trợ:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Tạo mới dịch vụ
router.post('/', async (req, res) => {
    try {
        const {
            service_type, group_name, service_name, usage_date,
            departure_date, return_date, route,
            quantity, unit_cost, unit_price, tax, collected_amount, 
            total_cost, total_income, notes, status, sale_id: body_sale_id
        } = req.body;

        const sale_id = body_sale_id || req.user.id; 
        const qty = parseFloat(quantity) || 0;
        const uCost = parseFloat(unit_cost) || 0;
        const uPrice = parseFloat(unit_price) || 0;
        const tTax = parseFloat(tax) || 0;
        
        // Ưu tiên lấy Tổng từ body (nhập tay), nếu không có mới tính toán
        const final_total_cost = total_cost !== undefined ? parseFloat(total_cost) : (qty * uCost);
        const final_total_income = total_income !== undefined ? parseFloat(total_income) : (qty * uPrice);
        const profit = final_total_income - final_total_cost - tTax;

        const query = `
            INSERT INTO travel_support_services (
                sale_id, service_type, group_name, service_name, usage_date,
                departure_date, return_date, route,
                quantity, unit_cost, total_cost, unit_price, total_income,
                tax, profit, collected_amount, notes, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING *
        `;

        const result = await db.query(query, [
            sale_id, service_type, group_name || '', service_name, usage_date || null,
            departure_date || null, return_date || null, route || '',
            qty, uCost, final_total_cost, uPrice, final_total_income,
            tTax, profit, parseFloat(collected_amount) || 0, notes || '', status || 'pending'
        ]);

        const newId = result.rows[0].id;
        logActivity({
            user_id: req.user.id,
            action_type: 'CREATE',
            entity_type: 'TRAVEL_SUPPORT',
            entity_id: newId,
            details: `Thêm mới phiếu dịch vụ hỗ trợ: ${service_name}`,
            new_data: JSON.stringify(result.rows[0])
        });

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Lỗi khi tạo dịch vụ hỗ trợ:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Cập nhật trạng thái hàng loạt
router.post('/bulk-update', async (req, res) => {
    try {
        const { ids, status } = req.body;
        
        if (!ids || !ids.length || !status) {
            return res.status(400).json({ error: 'Thiếu dữ liệu cập nhật' });
        }

        const placeholders = ids.map((_, index) => `$${index + 2}`).join(', ');
        
        const updateQuery = `
            UPDATE travel_support_services 
            SET status = $1, updated_at = NOW() 
            WHERE id IN (${placeholders})
        `;
        
        const params = [status, ...ids];
        
        await db.query(updateQuery, params);

        logActivity({
            user_id: req.user.id,
            action_type: 'BULK_UPDATE',
            entity_type: 'TRAVEL_SUPPORT',
            details: `Chuyển trạng thái hàng loạt ${ids.length} vé sang "${status}"`,
            new_data: JSON.stringify({ ids, status })
        });

        res.json({ message: 'Cập nhật thành công', updated_count: ids.length });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái hàng loạt:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Cập nhật dịch vụ
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            service_type, group_name, service_name, usage_date,
            departure_date, return_date, route,
            quantity, unit_cost, unit_price, tax, collected_amount,
            total_cost, total_income, notes, status, sale_id
        } = req.body;

        const qty = parseFloat(quantity) || 0;
        const uCost = parseFloat(unit_cost) || 0;
        const uPrice = parseFloat(unit_price) || 0;
        const tTax = parseFloat(tax) || 0;
        
        const final_total_cost = total_cost !== undefined ? parseFloat(total_cost) : (qty * uCost);
        const final_total_income = total_income !== undefined ? parseFloat(total_income) : (qty * uPrice);
        const profit = final_total_income - final_total_cost - tTax;

        const query = `
            UPDATE travel_support_services SET
                service_type = $1, group_name = $2, service_name = $3, usage_date = $4,
                departure_date = $5, return_date = $6, route = $7,
                quantity = $8, unit_cost = $9, total_cost = $10, unit_price = $11, total_income = $12,
                tax = $13, profit = $14, collected_amount = $15, notes = $16, status = $17,
                sale_id = COALESCE($18, sale_id),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $19
            RETURNING *
        `;

        const result = await db.query(query, [
            service_type, group_name || '', service_name, usage_date || null,
            departure_date || null, return_date || null, route || '',
            qty, uCost, final_total_cost, uPrice, final_total_income,
            tTax, profit, parseFloat(collected_amount) || 0, notes || '', status || 'pending',
            sale_id || null, id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy dịch vụ' });
        }

        logActivity({
            user_id: req.user.id,
            action_type: 'UPDATE',
            entity_type: 'TRAVEL_SUPPORT',
            entity_id: parseInt(id),
            details: `Cập nhật dịch vụ hỗ trợ (Trạng thái: ${status || 'pending'})`,
            new_data: JSON.stringify(result.rows[0])
        });

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Lỗi khi cập nhật dịch vụ hỗ trợ:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Xóa dịch vụ
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM travel_support_services WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy dịch vụ' });
        }
        
        logActivity({
            user_id: req.user.id,
            action_type: 'DELETE',
            entity_type: 'TRAVEL_SUPPORT',
            entity_id: parseInt(id),
            details: `Tài khoản xóa dịch vụ hỗ trợ #${id}`
        });

        res.json({ message: 'Xóa thành công' });
    } catch (error) {
        console.error('Lỗi khi xóa dịch vụ hỗ trợ:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

module.exports = router;
