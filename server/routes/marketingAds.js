const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth');

// Apply auth to ALL routes in this file
router.use(authenticateToken);

// Lấy dữ liệu KPI và Tổng hợp theo tháng/BU
router.get('/kpis', async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year || new Date().getFullYear();
    
    // Lấy số liệu thực tế đã gộp theo tháng từ bảng báo cáo
    const aggQuery = `
      SELECT bu_name, year, month, week_number,
        SUM(spend) as actual_spend, 
        SUM(messages) as actual_messages, 
        SUM(leads) as actual_leads,
        SUM(crm_leads_manual) as actual_crm_leads,
        SUM(crm_won_manual) as actual_crm_won
      FROM marketing_ads_reports
      WHERE year = $1
      GROUP BY bu_name, year, month, week_number
    `;
    const aggResult = await db.query(aggQuery, [targetYear]);
    
    // Lấy thông số KPI mục tiêu đã cấu hình
    const kpiQuery = `SELECT * FROM marketing_ads_kpis WHERE year = $1`;
    const kpiResult = await db.query(kpiQuery, [targetYear]);

    res.json({
        aggregates: aggResult.rows,
        kpis: kpiResult.rows
    });
  } catch (error) {
    console.error('Lỗi khi lấy KPI:', error);
    res.status(500).json({ error: 'Lỗi server KPI' });
  }
});

// Cập nhật thông số KPI
router.post('/kpis', async (req, res) => {
  try {
    const { 
      bu_name, year, month, budget, target_cpl, pic_name,
      target_routes, target_groups, target_customers, target_cpa, target_leads 
    } = req.body;
    
    const query = `
      INSERT INTO marketing_ads_kpis (
        bu_name, year, month, budget, target_cpl, pic_name, 
        target_routes, target_groups, target_customers, target_cpa, target_leads,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
      ON CONFLICT (bu_name, year, month)
      DO UPDATE SET
        budget = EXCLUDED.budget,
        target_cpl = EXCLUDED.target_cpl,
        pic_name = EXCLUDED.pic_name,
        target_routes = EXCLUDED.target_routes,
        target_groups = EXCLUDED.target_groups,
        target_customers = EXCLUDED.target_customers,
        target_cpa = EXCLUDED.target_cpa,
        target_leads = EXCLUDED.target_leads,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const result = await db.query(query, [
      bu_name, 
      Number(year) || new Date().getFullYear(),
      Number(month) || 0, 
      Number(budget) || 0,
      Number(target_cpl) || 0,
      pic_name || '',
      Number(target_routes) || 0,
      Number(target_groups) || 0,
      Number(target_customers) || 0,
      Number(target_cpa) || 0,
      Number(target_leads) || 0
    ]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Lỗi update KPI:', error);
    res.status(500).json({ error: 'Lỗi server update KPI' });
  }
});

// Lấy danh sách báo cáo
router.get('/', async (req, res) => {
  try {
    const { bu_name, month, week_number, year } = req.query;
    let query = 'SELECT * FROM marketing_ads_reports WHERE 1=1';
    let params = [];
    let count = 1;

    if (bu_name && bu_name !== 'All') {
      query += ` AND bu_name = $${count++}`;
      params.push(bu_name);
    }
    if (year) {
      query += ` AND year = $${count++}`;
      params.push(year);
    }
    if (month) {
        query += ` AND month = $${count++}`;
        params.push(month);
    }
    if (week_number) {
        query += ` AND week_number = $${count++}`;
        params.push(week_number);
    }

    query += ' ORDER BY created_at DESC, year DESC, month DESC, week_number DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu marketing ads:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Xoá danh sách theo BU, Year, Month, Week
router.delete('/', async (req, res) => {
  try {
    const { bu_name, year, month, week_number } = req.query;
    if (!bu_name || !year || !month || !week_number) {
      return res.status(400).json({ error: 'Thiếu tham số xoá' });
    }

    const deleteQuery = `
      DELETE FROM marketing_ads_reports 
      WHERE bu_name = $1 AND year = $2 AND month = $3 AND week_number = $4
      AND (is_locked IS NULL OR is_locked = false)
    `;
    await db.query(deleteQuery, [bu_name, year, month, week_number]);
    res.json({ success: true, message: 'Đã xoá dữ liệu chưa bị khóa' });
  } catch (error) {
    console.error('Lỗi khi xoá marketing ads:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Xoá 1 dòng dữ liệu báo cáo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleteQuery = `DELETE FROM marketing_ads_reports WHERE id = $1 AND (is_locked IS NULL OR is_locked = false) RETURNING *`;
    const result = await db.query(deleteQuery, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy dòng báo cáo, hoặc dòng đã bị khóa an toàn' });
    }
    
    res.json({ success: true, message: 'Đã xoá dòng báo cáo' });
  } catch (error) {
    console.error('Lỗi khi xoá dòng marketing ads:', error);
    res.status(500).json({ error: 'Lỗi server xoá dòng' });
  }
});

// Xóa nhiều dòng dữ liệu báo cáo bằng mảng ID
router.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Danh sách ID không hợp lệ' });
    }
    
    // Tạo chuỗi $1, $2, $3...
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
    const deleteQuery = `DELETE FROM marketing_ads_reports WHERE id IN (${placeholders}) AND (is_locked IS NULL OR is_locked = false) RETURNING id`;
    
    const result = await db.query(deleteQuery, ids);
    res.json({ success: true, message: `Đã xoá thành công ${result.rows.length} dòng báo cáo. Những dòng bị khóa đã được bảo vệ.` });
  } catch (error) {
    console.error('Lỗi khi xoá hàng loạt marketing ads:', error);
    res.status(500).json({ error: 'Lỗi server xoá hàng loạt' });
  }
});

// Khóa/Mở khóa nhiều dòng dữ liệu báo cáo bằng mảng ID
router.post('/bulk-lock', async (req, res) => {
  try {
    const { ids, is_locked } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Danh sách ID không hợp lệ' });
    }
    
    const placeholders = ids.map((_, i) => `$${i + 2}`).join(', ');
    const updateQuery = `UPDATE marketing_ads_reports SET is_locked = $1 WHERE id IN (${placeholders})`;
    
    await db.query(updateQuery, [is_locked, ...ids]);
    res.json({ success: true, message: `Đã ${is_locked ? 'khóa' : 'mở khóa'} ${ids.length} dòng báo cáo` });
  } catch (error) {
    console.error('Lỗi khi khóa hàng loạt marketing ads:', error);
    res.status(500).json({ error: 'Lỗi server khóa hàng loạt' });
  }
});

// Import mảng JSON mới (sẽ ghi đè dữ liệu cũ của tuần đó để chống duplicate)
router.post('/import', async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { bu_name, year, month, week_number, dataRows } = req.body;
    if (!bu_name || !year || !month || !week_number || !dataRows || !Array.isArray(dataRows)) {
      return res.status(400).json({ error: 'Data không hợp lệ' });
    }

    await client.query('BEGIN');

    // Xoá dữ liệu cũ
    const deleteQuery = `
      DELETE FROM marketing_ads_reports 
      WHERE bu_name = $1 AND year = $2 AND month = $3 AND week_number = $4
    `;
    await client.query(deleteQuery, [bu_name, year, month, week_number]);

    // Insert dữ liệu mới
    const insertQuery = `
      INSERT INTO marketing_ads_reports (
        bu_name, year, month, week_number, 
        campaign_name, ad_set_name, ad_name, 
        spend, messages, cpl_msg, leads, cpl_lead
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `;

    for (let row of dataRows) {
        await client.query(insertQuery, [
            bu_name, 
            year, 
            month, 
            week_number,
            row.campaign_name || null,
            row.ad_set_name || null,
            row.ad_name || null,
            row.spend ? parseFloat(row.spend) : 0,
            row.messages ? parseInt(row.messages) : 0,
            row.cpl_msg ? parseFloat(row.cpl_msg) : 0,
            row.leads ? parseInt(row.leads) : 0,
            row.cpl_lead ? parseFloat(row.cpl_lead) : 0
        ]);
    }

    await client.query('COMMIT');
    res.json({ success: true, message: `Nhập thành công ${dataRows.length} dòng.` });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Lỗi khi import marketing ads:', error);
    res.status(500).json({ error: 'Lỗi server' });
  } finally {
    client.release();
  }
});

// Cập nhật số liệu thủ công
router.put('/:id', async (req, res) => {
  try {
    const reportId = req.params.id;
    const { crm_leads_manual, crm_won_manual, campaign_name, spend, messages, leads, bu_name } = req.body;
    
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Không có trường cập nhật' });
    }

    let updates = [];
    let params = [];
    let count = 1;

    if (crm_leads_manual !== undefined) {
        updates.push(`crm_leads_manual = $${count++}`);
        params.push(crm_leads_manual === '' ? 0 : parseInt(crm_leads_manual));
    }
    if (crm_won_manual !== undefined) {
        updates.push(`crm_won_manual = $${count++}`);
        params.push(crm_won_manual === '' ? 0 : parseInt(crm_won_manual));
    }
    if (campaign_name !== undefined) {
        updates.push(`campaign_name = $${count++}`);
        params.push(campaign_name);
    }
    if (bu_name !== undefined) {
        updates.push(`bu_name = $${count++}`);
        params.push(bu_name);
    }
    if (spend !== undefined) {
        updates.push(`spend = $${count++}`);
        params.push(parseFloat(spend));
        
        // Auto update CPL
        if (messages) updates.push(`cpl_msg = ${parseFloat(spend) / parseInt(messages)}`);
        else updates.push(`cpl_msg = spend / NULLIF(messages, 0)`);
        
        if (leads) updates.push(`cpl_lead = ${parseFloat(spend) / parseInt(leads)}`);
        else updates.push(`cpl_lead = spend / NULLIF(leads, 0)`);
    }
    if (messages !== undefined) {
        updates.push(`messages = $${count++}`);
        params.push(parseInt(messages));
        if (spend === undefined) updates.push(`cpl_msg = spend / NULLIF($${count - 1}, 0)`);
    }
    if (leads !== undefined) {
        updates.push(`leads = $${count++}`);
        params.push(parseInt(leads));
        if (spend === undefined) updates.push(`cpl_lead = spend / NULLIF($${count - 1}, 0)`);
    }

    if (updates.length > 0) {
        params.push(reportId);
        const query = `UPDATE marketing_ads_reports SET ${updates.join(', ')} WHERE id = $${count} RETURNING *`;
        const result = await db.query(query, params);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy dòng báo cáo này' });
        return res.json({ success: true, data: result.rows[0] });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Lỗi khi update manual CRM ads:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;
