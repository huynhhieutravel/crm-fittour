const db = require('../db');
const ExcelJS = require('exceljs');

// Helper to compute derived metrics for a plan row (matches Excel formula logic)
function calculateRowMetrics(row) {
  const target_pax = Number(row.target_pax || 0);
  const break_even_pax = Number(row.break_even_pax || 0);
  const price_per_pax = Number(row.price_per_pax || 0);
  const cost_per_pax = Number(row.cost_per_pax || 0);
  const cpl_target = Number(row.cpl_target || 0);
  const cr_sale = Number(row.cr_sale || 0.10);
  const mkt_percentage = Number(row.mkt_percentage !== undefined ? row.mkt_percentage : 0.01); // 1% Doanh thu

  // Cột tự tính (Màu vàng)
  const gross_profit_per_pax = price_per_pax - cost_per_pax;
  const expected_revenue = target_pax * price_per_pax;
  const expected_gross_profit = target_pax * gross_profit_per_pax;
  const required_leads = cr_sale > 0 ? Math.ceil(target_pax / cr_sale) : 0;
  const budget_ads = required_leads * cpl_target;
  const ads_to_profit_ratio = expected_gross_profit > 0 
    ? Number((budget_ads / expected_gross_profit).toFixed(4)) 
    : 0;
  
  // Chi phí MKT = 1% Doanh thu dự kiến
  const mkt_cost = Math.round(expected_revenue * mkt_percentage);

  // Đánh giá
  let evaluation = 'An toàn';
  if (ads_to_profit_ratio > 0.25) {
    evaluation = 'VƯỢT TRẦN';
  } else if (ads_to_profit_ratio > 0.20) {
    evaluation = 'Cận trần';
  }

  // Month label calculation
  let month_label = row.month_label;
  if (!month_label && row.departure_date) {
    const d = new Date(row.departure_date);
    month_label = `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
  }

  // Pax đang có & Doanh thu đang có (Lấy từ Giữ chỗ / Cọc / Booking thực tế trong ERP)
  const current_pax = Number(row.real_paid_pax || 0);
  const current_revenue = Number(row.real_paid_revenue || 0);

  const current_gross_profit = current_pax * gross_profit_per_pax;
  const pax_completion_rate = target_pax > 0 ? Number(((current_pax / target_pax) * 100).toFixed(1)) : 0;

  return {
    ...row,
    target_pax,
    break_even_pax,
    price_per_pax,
    cost_per_pax,
    cpl_target,
    cr_sale,
    mkt_percentage,
    gross_profit_per_pax,
    expected_revenue,
    expected_gross_profit,
    required_leads,
    budget_ads,
    ads_to_profit_ratio,
    mkt_cost,
    evaluation,
    month_label,
    current_pax,
    current_revenue,
    current_gross_profit,
    pax_completion_rate
  };
}

// 1. Get all plans with filters
exports.getPlans = async (req, res) => {
  try {
    const { bu_id, quarter, year, search, status, evaluation } = req.query;

    let query = `
      SELECT 
        mbp.*,
        td.status as erp_status,
        td.actual_price as erp_actual_price,
        td.min_participants as erp_min_pax,
        td.max_participants as erp_max_pax,
        tt.name as erp_tour_name,
        tt.destination as destination,
        tt.duration as duration,
        COALESCE(b_stat.paid_pax, 0) as real_paid_pax,
        COALESCE(b_stat.paid_revenue, 0) as real_paid_revenue
      FROM marketing_budget_plans mbp
      LEFT JOIN tour_departures td ON mbp.departure_id = td.id
      LEFT JOIN tour_templates tt ON mbp.tour_template_id = tt.id
      LEFT JOIN (
        SELECT 
          tour_departure_id,
          COALESCE(SUM(pax_count), 0) as paid_pax,
          COALESCE(SUM(total_price), 0) as paid_revenue
        FROM bookings
        WHERE COALESCE(is_deleted, false) = false
          AND booking_status NOT IN ('Huỷ', 'Hủy', 'CANCELLED', 'EXPIRED')
        GROUP BY tour_departure_id
      ) b_stat ON mbp.departure_id = b_stat.tour_departure_id
      WHERE 1=1
    `;
    const params = [];

    if (bu_id && bu_id !== 'ALL' && bu_id !== 'all') {
      params.push(bu_id);
      query += ` AND mbp.bu_id = $${params.length}`;
    }

    if (year) {
      params.push(parseInt(year));
      query += ` AND (mbp.year = $${params.length} OR EXTRACT(YEAR FROM mbp.departure_date) = $${params.length})`;
    }

    if (quarter && quarter !== 'ALL' && quarter !== 'all') {
      params.push(parseInt(quarter));
      query += ` AND (mbp.quarter = $${params.length} OR EXTRACT(QUARTER FROM mbp.departure_date) = $${params.length})`;
    }

    if (search) {
      params.push(`%${search.trim()}%`);
      query += ` AND (mbp.tuyen ILIKE $${params.length} OR mbp.departure_code ILIKE $${params.length} OR COALESCE(mbp.notes, '') ILIKE $${params.length})`;
    }

    if (status && status !== 'ALL' && status !== 'all') {
      params.push(status);
      query += ` AND mbp.status_text = $${params.length}`;
    }

    query += ` ORDER BY mbp.tuyen ASC, mbp.departure_date ASC`;

    const result = await db.query(query, params);
    let plans = result.rows.map(calculateRowMetrics);

    if (evaluation && evaluation !== 'ALL' && evaluation !== 'all') {
      plans = plans.filter(p => p.evaluation.toLowerCase() === evaluation.toLowerCase());
    }

    res.json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (err) {
    console.error('getPlans error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Summary & KPIs aggregated (like sheet DASHBOARD)
exports.getSummary = async (req, res) => {
  try {
    const { bu_id, quarter, year, search } = req.query;

    let query = `
      SELECT 
        mbp.*,
        COALESCE(b_stat.paid_pax, 0) as real_paid_pax,
        COALESCE(b_stat.paid_revenue, 0) as real_paid_revenue
      FROM marketing_budget_plans mbp
      LEFT JOIN (
        SELECT 
          tour_departure_id,
          COALESCE(SUM(pax_count), 0) as paid_pax,
          COALESCE(SUM(total_price), 0) as paid_revenue
        FROM bookings
        WHERE COALESCE(is_deleted, false) = false
          AND booking_status NOT IN ('Huỷ', 'Hủy', 'CANCELLED', 'EXPIRED')
        GROUP BY tour_departure_id
      ) b_stat ON mbp.departure_id = b_stat.tour_departure_id
      WHERE 1=1
    `;
    const params = [];

    if (bu_id && bu_id !== 'ALL' && bu_id !== 'all') {
      params.push(bu_id);
      query += ` AND mbp.bu_id = $${params.length}`;
    }

    if (year) {
      params.push(parseInt(year));
      query += ` AND (mbp.year = $${params.length} OR EXTRACT(YEAR FROM mbp.departure_date) = $${params.length})`;
    }

    if (quarter && quarter !== 'ALL' && quarter !== 'all') {
      params.push(parseInt(quarter));
      query += ` AND (mbp.quarter = $${params.length} OR EXTRACT(QUARTER FROM mbp.departure_date) = $${params.length})`;
    }

    if (search) {
      params.push(`%${search.trim()}%`);
      query += ` AND (mbp.tuyen ILIKE $${params.length} OR mbp.departure_code ILIKE $${params.length})`;
    }

    const result = await db.query(query, params);
    const plans = result.rows.map(calculateRowMetrics);

    let total_revenue = 0;
    let total_gross_profit = 0;
    let total_budget_ads = 0;
    let total_mkt_cost = 0;
    let total_target_pax = 0;
    let total_current_pax = 0;
    let total_current_revenue = 0;
    let total_current_gross_profit = 0;
    let safe_count = 0;
    let warning_count = 0;
    let danger_count = 0;

    // Group by Tuyến (Route)
    const routeMap = {};

    for (const p of plans) {
      total_revenue += p.expected_revenue;
      total_gross_profit += p.expected_gross_profit;
      total_budget_ads += p.budget_ads;
      total_mkt_cost += p.mkt_cost;
      total_target_pax += p.target_pax;
      total_current_pax += p.current_pax;
      total_current_revenue += p.current_revenue;
      total_current_gross_profit += p.current_gross_profit;

      if (p.evaluation === 'An toàn') safe_count++;
      else if (p.evaluation === 'Cận trần') warning_count++;
      else danger_count++;

      const routeKey = p.tuyen || 'Chưa phân tuyến';
      if (!routeMap[routeKey]) {
        routeMap[routeKey] = {
          tuyen: routeKey,
          bu_id: p.bu_id,
          departure_count: 0,
          total_target_pax: 0,
          mkt_percentage: p.mkt_percentage,
          total_mkt_cost: 0,
          expected_revenue: 0,
          expected_gross_profit: 0,
          budget_ads: 0,
          drive_link: p.drive_link,
          approval_status: p.approval_status,
          departures: []
        };
      }

      routeMap[routeKey].departure_count += 1;
      routeMap[routeKey].total_target_pax += p.target_pax;
      routeMap[routeKey].total_mkt_cost += p.mkt_cost;
      routeMap[routeKey].expected_revenue += p.expected_revenue;
      routeMap[routeKey].expected_gross_profit += p.expected_gross_profit;
      routeMap[routeKey].budget_ads += p.budget_ads;
      routeMap[routeKey].departures.push({
        id: p.id,
        departure_code: p.departure_code,
        departure_date: p.departure_date,
        target_pax: p.target_pax,
        expected_revenue: p.expected_revenue,
        expected_gross_profit: p.expected_gross_profit,
        budget_ads: p.budget_ads,
        evaluation: p.evaluation
      });
    }

    const avg_ads_profit_ratio = total_gross_profit > 0 
      ? Number((total_budget_ads / total_gross_profit).toFixed(4)) 
      : 0;

    const routes_summary = Object.values(routeMap).map(r => ({
      ...r,
      ads_profit_ratio: r.expected_gross_profit > 0 
        ? Number((r.budget_ads / r.expected_gross_profit).toFixed(4)) 
        : 0
    }));

    res.json({
      success: true,
      summary: {
        total_departures: plans.length,
        total_revenue,
        total_gross_profit,
        total_budget_ads,
        total_mkt_cost,
        avg_ads_profit_ratio,
        total_target_pax,
        total_current_pax,
        total_current_revenue,
        total_current_gross_profit,
        safe_count,
        warning_count,
        danger_count
      },
      routes_summary
    });
  } catch (err) {
    console.error('getSummary error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Upsert a single plan item
exports.upsertPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = (req.user?.role || '').toLowerCase();
    const isAdminOrBOD = ['admin', 'ceo', 'bod', 'director', 'superadmin'].includes(userRole) || req.user?.is_admin;
    const canEdit = isAdminOrBOD || ['manager', 'marketing', 'bu_lead', 'leader'].includes(userRole) || req.user?.is_bu_leader;

    if (!canEdit) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền chỉnh sửa kế hoạch ngân sách marketing' });
    }

    const {
      target_pax,
      break_even_pax,
      price_per_pax,
      cost_per_pax,
      cpl_target,
      cr_sale,
      status_text,
      notes,
      mkt_percentage,
      approval_status,
      drive_link,
      tuyen,
      bu_id,
      departure_date
    } = req.body;

    // Check approval privilege
    if (approval_status === 'Đã duyệt' && !isAdminOrBOD) {
      return res.status(403).json({ success: false, message: 'Chỉ Ban Giám Đốc (BOD) hoặc Admin mới có quyền phê duyệt ngân sách' });
    }

    const query = `
      UPDATE marketing_budget_plans
      SET
        target_pax = COALESCE($1, target_pax),
        break_even_pax = COALESCE($2, break_even_pax),
        price_per_pax = COALESCE($3, price_per_pax),
        cost_per_pax = COALESCE($4, cost_per_pax),
        cpl_target = COALESCE($5, cpl_target),
        cr_sale = COALESCE($6, cr_sale),
        status_text = COALESCE($7, status_text),
        notes = COALESCE($8, notes),
        mkt_percentage = COALESCE($9, mkt_percentage),
        approval_status = COALESCE($10, approval_status),
        drive_link = COALESCE($11, drive_link),
        tuyen = COALESCE($12, tuyen),
        bu_id = COALESCE($13, bu_id),
        departure_date = COALESCE($14, departure_date),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $15
      RETURNING *;
    `;
    const result = await db.query(query, [
      target_pax,
      break_even_pax,
      price_per_pax,
      cost_per_pax,
      cpl_target,
      cr_sale,
      status_text,
      notes,
      mkt_percentage,
      approval_status,
      drive_link,
      tuyen,
      bu_id,
      departure_date,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy kế hoạch' });
    }

    const calculated = calculateRowMetrics(result.rows[0]);
    res.json({ success: true, data: calculated });
  } catch (err) {
    console.error('upsertPlan error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Batch update multiple plans
exports.batchSavePlans = async (req, res) => {
  try {
    const userRole = (req.user?.role || '').toLowerCase();
    const isAdminOrBOD = ['admin', 'ceo', 'bod', 'director', 'superadmin'].includes(userRole) || req.user?.is_admin;
    const canEdit = isAdminOrBOD || ['manager', 'marketing', 'bu_lead', 'leader'].includes(userRole) || req.user?.is_bu_leader;

    if (!canEdit) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền chỉnh sửa kế hoạch ngân sách marketing' });
    }

    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Không có dữ liệu cập nhật' });
    }

    const updatedRows = [];
    for (const item of updates) {
      const {
        id, target_pax, break_even_pax, price_per_pax, cost_per_pax,
        cpl_target, cr_sale, status_text, notes, mkt_percentage,
        approval_status, drive_link
      } = item;

      // Check approval privilege on each row if modified to approved
      if (approval_status === 'Đã duyệt' && !isAdminOrBOD) {
        return res.status(403).json({ success: false, message: 'Chỉ Ban Giám Đốc (BOD) hoặc Admin mới có quyền phê duyệt ngân sách' });
      }

      const q = `
        UPDATE marketing_budget_plans
        SET
          target_pax = COALESCE($1, target_pax),
          break_even_pax = COALESCE($2, break_even_pax),
          price_per_pax = COALESCE($3, price_per_pax),
          cost_per_pax = COALESCE($4, cost_per_pax),
          cpl_target = COALESCE($5, cpl_target),
          cr_sale = COALESCE($6, cr_sale),
          status_text = COALESCE($7, status_text),
          notes = COALESCE($8, notes),
          mkt_percentage = COALESCE($9, mkt_percentage),
          approval_status = COALESCE($10, approval_status),
          drive_link = COALESCE($11, drive_link),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $12
        RETURNING *;
      `;
      const resU = await db.query(q, [
        target_pax, break_even_pax, price_per_pax, cost_per_pax,
        cpl_target, cr_sale, status_text, notes, mkt_percentage,
        approval_status, drive_link, id
      ]);
      if (resU.rows.length > 0) {
        updatedRows.push(calculateRowMetrics(resU.rows[0]));
      }
    }

    res.json({ success: true, count: updatedRows.length, data: updatedRows });
  } catch (err) {
    console.error('batchSavePlans error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 5. Sync from ERP tour_departures
exports.syncFromERP = async (req, res) => {
  try {
    const syncQuery = `
      INSERT INTO marketing_budget_plans (
        departure_id, tour_template_id, departure_code, tuyen, bu_id,
        departure_date, target_pax, break_even_pax, price_per_pax, cost_per_pax,
        cpl_target, cr_sale, status_text, mkt_percentage, approval_status, drive_link,
        year, quarter
      )
      SELECT 
        td.id as departure_id,
        td.tour_template_id,
        COALESCE(NULLIF(TRIM(td.code), ''), CONCAT('DEP-', td.id)) as departure_code,
        COALESCE(tt.name, td.code, CONCAT('Đoàn khởi hành #', td.id)) as tuyen,
        CASE
          WHEN tt.name ILIKE '%Đài Loan%' OR tt.name ILIKE '%Nhật Bản%' OR tt.name ILIKE '%Hàn Quốc%' OR tt.name ILIKE '%Hokkaido%' OR tt.name ILIKE '%Cung Đường Vàng%' THEN 'BU2'
          WHEN tt.name ILIKE '%Châu Âu%' OR tt.name ILIKE '%Pháp%' OR tt.name ILIKE '%Thụy%' OR tt.name ILIKE '%Ý%' OR tt.name ILIKE '%Úc%' OR tt.name ILIKE '%Séc%' OR tt.name ILIKE '%Áo%' THEN 'BU3'
          WHEN tt.name ILIKE '%Bhutan%' OR tt.name ILIKE '%Ladakh%' OR tt.name ILIKE '%Sri Lanka%' OR tt.name ILIKE '%Nepal%' OR tt.name ILIKE '%Himalaya%' THEN 'BU4'
          WHEN tt.name ILIKE '%Ai Cập%' OR tt.name ILIKE '%Ma Rốc%' OR tt.name ILIKE '%Pakistan%' OR tt.name ILIKE '%Trung Á%' OR tt.name ILIKE '%Tây Á%' OR tt.name ILIKE '%Nga%' OR tt.name ILIKE '%Murmansk%' THEN 'BU5'
          WHEN tt.bu_group IN ('BU1', 'BU2', 'BU3', 'BU4', 'BU5') THEN tt.bu_group
          ELSE 'BU1'
        END as bu_id,
        td.start_date as departure_date,
        COALESCE(
          NULLIF((td.tour_info->>'total_seats')::int, 0),
          NULLIF(td.max_participants, 0),
          NULLIF(tt.max_pax, 0),
          16
        ) as target_pax,
        COALESCE(
          NULLIF(td.break_even_pax, 0),
          ROUND(COALESCE(
            NULLIF((td.tour_info->>'total_seats')::int, 0),
            NULLIF(td.max_participants, 0),
            NULLIF(tt.max_pax, 0),
            16
          ) * 0.70)
        ) as break_even_pax,
        COALESCE(
          NULLIF((td.tour_info->>'price_adult')::numeric, 0),
          NULLIF((td.tour_info->>'price_tour')::numeric, 0),
          NULLIF(td.price_adult, 0),
          NULLIF(td.actual_price, 0),
          NULLIF(tt.base_price, 0),
          NULLIF(tt.price, 0),
          30000000
        ) as price_per_pax,
        COALESCE(
          NULLIF(tt.internal_cost, 0), 
          ROUND(COALESCE(
            NULLIF((td.tour_info->>'price_adult')::numeric, 0),
            NULLIF((td.tour_info->>'price_tour')::numeric, 0),
            NULLIF(td.price_adult, 0),
            NULLIF(td.actual_price, 0),
            NULLIF(tt.base_price, 0),
            NULLIF(tt.price, 0),
            30000000
          ) * 0.80)
        ) as cost_per_pax,
        CASE
          WHEN tt.name ILIKE '%Nhật Bản%' OR tt.name ILIKE '%Hokkaido%' OR tt.name ILIKE '%Cung Đường Vàng%' THEN 200000
          WHEN tt.name ILIKE '%Đài Loan%' OR tt.name ILIKE '%Hàn Quốc%' THEN 130000
          WHEN tt.name ILIKE '%Châu Âu%' OR tt.name ILIKE '%Úc%' THEN 450000
          WHEN tt.name ILIKE '%Bhutan%' OR tt.name ILIKE '%Ladakh%' OR tt.name ILIKE '%Sri Lanka%' OR tt.name ILIKE '%Nepal%' THEN 240000
          WHEN tt.name ILIKE '%Ai Cập%' OR tt.name ILIKE '%Ma Rốc%' OR tt.name ILIKE '%Pakistan%' OR tt.name ILIKE '%Trung Á%' OR tt.name ILIKE '%Nga%' THEN 260000
          ELSE 150000
        END as cpl_target,
        CASE
          WHEN tt.name ILIKE '%Châu Âu%' OR tt.name ILIKE '%Úc%' THEN 0.05
          WHEN tt.name ILIKE '%Nhật Bản%' OR tt.name ILIKE '%Hokkaido%' OR tt.name ILIKE '%Cung Đường Vàng%' THEN 0.08
          WHEN tt.name ILIKE '%Đài Loan%' OR tt.name ILIKE '%Hàn Quốc%' THEN 0.10
          WHEN tt.name ILIKE '%Bhutan%' OR tt.name ILIKE '%Ladakh%' OR tt.name ILIKE '%Sri Lanka%' THEN 0.07
          WHEN tt.name ILIKE '%Ai Cập%' OR tt.name ILIKE '%Ma Rốc%' OR tt.name ILIKE '%Pakistan%' OR tt.name ILIKE '%Trung Á%' THEN 0.075
          ELSE 0.10
        END as cr_sale,
        COALESCE(NULLIF(td.status, ''), 'Đang mở bán') as status_text,
        0.01 as mkt_percentage,
        'Chờ BOD duyệt' as approval_status,
        COALESCE(
          NULLIF(td.tour_info->>'tour_itinerary_link', ''),
          NULLIF(td.tour_info->>'tour_itinerary_web_link', ''),
          NULLIF(tt.schedule_link, ''),
          'https://drive.google.com/'
        ) as drive_link,
        EXTRACT(YEAR FROM td.start_date)::int as year,
        EXTRACT(QUARTER FROM td.start_date)::int as quarter
      FROM tour_departures td
      LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
      WHERE td.is_deleted = false AND td.start_date IS NOT NULL
      ON CONFLICT (departure_code) DO UPDATE SET
        departure_id = EXCLUDED.departure_id,
        tour_template_id = EXCLUDED.tour_template_id,
        departure_date = EXCLUDED.departure_date,
        bu_id = EXCLUDED.bu_id,
        tuyen = EXCLUDED.tuyen,
        target_pax = EXCLUDED.target_pax,
        break_even_pax = EXCLUDED.break_even_pax,
        price_per_pax = EXCLUDED.price_per_pax,
        cost_per_pax = EXCLUDED.cost_per_pax,
        cpl_target = EXCLUDED.cpl_target,
        cr_sale = EXCLUDED.cr_sale,
        drive_link = EXCLUDED.drive_link,
        year = EXCLUDED.year,
        quarter = EXCLUDED.quarter;
    `;
    const syncRes = await db.query(syncQuery);
    res.json({
      success: true,
      message: `Đã đồng bộ ${syncRes.rowCount} lịch khởi hành từ ERP vào ngân sách Marketing!`,
      rowCount: syncRes.rowCount
    });
  } catch (err) {
    console.error('syncFromERP error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 6. Export to Excel matching ngan-sach-mkt-sale.xlsx
exports.exportExcel = async (req, res) => {
  try {
    const { bu_id = 'BU1', year = 2026, quarter = 4 } = req.query;

    let query = `
      SELECT mbp.*,
        COALESCE(b_stat.paid_pax, 0) as real_paid_pax,
        COALESCE(b_stat.paid_revenue, 0) as real_paid_revenue
      FROM marketing_budget_plans mbp
      LEFT JOIN (
        SELECT 
          tour_departure_id,
          COALESCE(SUM(pax_count), 0) as paid_pax,
          COALESCE(SUM(total_price), 0) as paid_revenue
        FROM bookings
        WHERE COALESCE(is_deleted, false) = false
          AND booking_status NOT IN ('Huỷ', 'Hủy', 'CANCELLED', 'EXPIRED')
        GROUP BY tour_departure_id
      ) b_stat ON mbp.departure_id = b_stat.tour_departure_id
      WHERE 1=1
    `;
    const params = [];
    if (bu_id && bu_id !== 'ALL') {
      params.push(bu_id);
      query += ` AND mbp.bu_id = $${params.length}`;
    }
    if (year) {
      params.push(parseInt(year));
      query += ` AND (mbp.year = $${params.length} OR EXTRACT(YEAR FROM mbp.departure_date) = $${params.length})`;
    }
    if (quarter && quarter !== 'ALL') {
      params.push(parseInt(quarter));
      query += ` AND (mbp.quarter = $${params.length} OR EXTRACT(QUARTER FROM mbp.departure_date) = $${params.length})`;
    }
    query += ` ORDER BY mbp.tuyen ASC, mbp.departure_date ASC`;

    const result = await db.query(query, params);
    const plans = result.rows.map(calculateRowMetrics);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'FIT Tour ERP CRM';
    workbook.created = new Date();

    const sheetName = bu_id && bu_id !== 'ALL' ? bu_id : 'KE_HOACH_MKT';
    const ws = workbook.addWorksheet(sheetName);

    // Title Row
    ws.mergeCells('A1:W1');
    const titleCell = ws.getCell('A1');
    titleCell.value = `${sheetName} – KẾ HOẠCH ĐOÀN & NGÂN SÁCH MARKETING Q${quarter}/${year}`;
    titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3989' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 36;

    // Header labels (Row 4)
    const headers = [
      { key: 'stt', label: 'STT', isYellow: true, width: 6 },
      { key: 'tuyen', label: 'Tuyến', isYellow: false, width: 25 },
      { key: 'departure_code', label: 'Lịch khởi hành', isYellow: false, width: 26 },
      { key: 'departure_date', label: 'Ngày khởi hành', isYellow: false, width: 14 },
      { key: 'target_pax', label: 'Pax mục tiêu', isYellow: false, width: 14 },
      { key: 'break_even_pax', label: 'Pax hòa vốn', isYellow: false, width: 14 },
      { key: 'price_per_pax', label: 'Giá bán / khách', isYellow: false, width: 18 },
      { key: 'cost_per_pax', label: 'Giá vốn / khách', isYellow: false, width: 18 },
      { key: 'cpl_target', label: 'CPL kỳ vọng', isYellow: false, width: 16 },
      { key: 'status_text', label: 'Tình trạng đoàn', isYellow: false, width: 16 },
      { key: 'notes', label: 'Ghi chú / Đề xuất', isYellow: false, width: 30 },
      { key: 'month_label', label: 'Tháng', isYellow: true, width: 14 },
      { key: 'gross_profit_per_pax', label: 'Lãi gộp / khách', isYellow: true, width: 18 },
      { key: 'expected_revenue', label: 'Doanh thu dự kiến', isYellow: true, width: 20 },
      { key: 'expected_gross_profit', label: 'Lãi gộp dự kiến', isYellow: true, width: 20 },
      { key: 'required_leads', label: 'Lead cần', isYellow: true, width: 12 },
      { key: 'budget_ads', label: 'Budget Ads dự toán', isYellow: true, width: 20 },
      { key: 'ads_to_profit_ratio', label: '% Ads / Lãi gộp', isYellow: true, width: 16 },
      { key: 'mkt_percentage', label: 'Đề xuất % Marketing', isYellow: false, width: 18 },
      { key: 'mkt_cost', label: 'Chi phí MKT Quý / Tuyến', isYellow: false, width: 22 },
      { key: 'approval_status', label: 'Trạng thái phê duyệt', isYellow: true, width: 20 },
      { key: 'drive_link', label: 'Link Drive dự toán chi tiết', isYellow: false, width: 26 },
      { key: 'evaluation', label: 'Đánh giá', isYellow: true, width: 16 }
    ];

    ws.columns = headers.map(h => ({ key: h.key, width: h.width }));

    // Write Header Row 4
    const headerRow = ws.getRow(4);
    headers.forEach((h, idx) => {
      const cell = headerRow.getCell(idx + 1);
      cell.value = h.label;
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: h.isYellow ? 'FF000000' : 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: h.isYellow ? 'FFF6B26B' : 'FF1E3989' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    headerRow.height = 30;

    // Write Data Rows
    plans.forEach((p, idx) => {
      const r = ws.getRow(5 + idx);
      r.getCell(1).value = idx + 1;
      r.getCell(2).value = p.tuyen;
      r.getCell(3).value = p.departure_code;
      r.getCell(4).value = p.departure_date ? new Date(p.departure_date).toLocaleDateString('vi-VN') : '';
      r.getCell(5).value = p.target_pax;
      r.getCell(6).value = p.break_even_pax;
      r.getCell(7).value = p.price_per_pax;
      r.getCell(8).value = p.cost_per_pax;
      r.getCell(9).value = p.cpl_target;
      r.getCell(10).value = p.status_text;
      r.getCell(11).value = p.notes || '';
      r.getCell(12).value = p.month_label;
      r.getCell(13).value = p.gross_profit_per_pax;
      r.getCell(14).value = p.expected_revenue;
      r.getCell(15).value = p.expected_gross_profit;
      r.getCell(16).value = p.required_leads;
      r.getCell(17).value = p.budget_ads;
      r.getCell(18).value = (p.ads_to_profit_ratio * 100).toFixed(1) + '%';
      r.getCell(19).value = (p.mkt_percentage * 100).toFixed(1) + '%';
      r.getCell(20).value = p.mkt_cost;
      r.getCell(21).value = p.approval_status;
      r.getCell(22).value = p.drive_link;
      r.getCell(23).value = p.evaluation;

      // Currency format on columns 7, 8, 9, 13, 14, 15, 17, 20
      [7, 8, 9, 13, 14, 15, 17, 20].forEach(colIdx => {
        r.getCell(colIdx).numFmt = '#,##0';
      });

      // Highlight Yellow auto-calc cells
      [12, 13, 14, 15, 16, 17, 18, 23].forEach(colIdx => {
        r.getCell(colIdx).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF2CC' }
        };
      });

      // Evaluation styling
      const evalCell = r.getCell(23);
      if (p.evaluation === 'VƯỢT TRẦN') {
        evalCell.font = { color: { argb: 'FFDC2626' }, bold: true };
      } else if (p.evaluation === 'Cận trần') {
        evalCell.font = { color: { argb: 'FFD97706' }, bold: true };
      } else {
        evalCell.font = { color: { argb: 'FF16A34A' }, bold: true };
      }

      r.height = 24;
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="ngan-sach-mkt-${sheetName}-Q${quarter}-${year}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('exportExcel error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
