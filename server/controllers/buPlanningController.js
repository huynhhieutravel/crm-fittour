const db = require('../db');
const { BU_TEMPLATES } = require('../data/buPlanningTemplates');

// Helper to determine if user has executive / admin privileges
function isExecutiveOrAdmin(user) {
  if (!user) return false;
  const role = (user.role || user.role_name || '').toLowerCase();
  return ['admin', 'superadmin', 'ceo', 'bod', 'director'].includes(role) || Boolean(user.is_admin);
}

// Helper to determine if user belongs to the specified BU
function userCanAccessBU(user, buId, requireWrite = false) {
  if (isExecutiveOrAdmin(user)) return true;
  if (!user) return false;
  const userBUs = Array.isArray(user.bus) ? user.bus.map(b => String(b).toUpperCase()) : [];
  if (userBUs.includes(String(buId).toUpperCase())) return true;
  if (!requireWrite) {
    // For read-only access, check if user is manager or leader
    return true;
  }
  return false;
}

// 1. GET /api/bu-planning/plans
exports.getPlans = async (req, res) => {
  try {
    const { year, bu_id, status } = req.query;
    const user = req.user;
    const isAdmin = isExecutiveOrAdmin(user);
    const userBUs = Array.isArray(user?.bus) ? user.bus.map(b => String(b).toUpperCase()) : [];

    let query = `
      SELECT 
        p.*,
        u.full_name as creator_name,
        COALESCE(prod_stats.total_products, 0) as total_products,
        COALESCE(dep_stats.total_departures, 0) as total_departures,
        COALESCE(dep_stats.total_pax, 0) as total_planned_pax,
        COALESCE(dep_stats.total_revenue, 0) as total_planned_revenue,
        COALESCE(dep_stats.total_gross_profit, 0) as total_planned_gross_profit,
        COALESCE(task_stats.total_tasks, 0) as total_tasks,
        COALESCE(task_stats.overdue_tasks, 0) as overdue_tasks
      FROM bu_plans p
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN (
        SELECT plan_id, COUNT(id) as total_products
        FROM bu_plan_products
        GROUP BY plan_id
      ) prod_stats ON prod_stats.plan_id = p.id
      LEFT JOIN (
        SELECT 
          d.plan_id,
          SUM(d.groups_count) as total_departures,
          SUM(d.groups_count * d.pax_per_group) as total_pax,
          SUM(d.groups_count * d.pax_per_group * pr.price_per_pax) as total_revenue,
          SUM(d.groups_count * (
            d.pax_per_group * (pr.price_per_pax - pr.variable_cost_per_pax) - pr.fixed_cost_per_group
          )) as total_gross_profit
        FROM bu_plan_departures d
        JOIN bu_plan_products pr ON d.product_id = pr.id
        GROUP BY d.plan_id
      ) dep_stats ON dep_stats.plan_id = p.id
      LEFT JOIN (
        SELECT 
          plan_id,
          COUNT(id) as total_tasks,
          COUNT(CASE WHEN deadline < CURRENT_DATE AND status != 'Đã hoàn tất' THEN 1 END) as overdue_tasks
        FROM bu_plan_tasks
        GROUP BY plan_id
      ) task_stats ON task_stats.plan_id = p.id
      WHERE 1=1
    `;

    const params = [];
    let paramIdx = 1;

    if (year) {
      query += ` AND p.plan_year = $${paramIdx++}`;
      params.push(parseInt(year, 10));
    }

    if (bu_id && bu_id !== 'ALL') {
      query += ` AND p.bu_id = $${paramIdx++}`;
      params.push(bu_id.toUpperCase());
    }

    if (status && status !== 'ALL') {
      query += ` AND p.status = $${paramIdx++}`;
      params.push(status);
    }

    // Test 12 Privacy Rule: Non-admin can ONLY view draft/submitted of their OWN BU;
    // other BUs' plans are visible ONLY if APPROVED!
    if (!isAdmin && userBUs.length > 0) {
      query += ` AND (p.bu_id = ANY($${paramIdx++}) OR p.status = 'APPROVED')`;
      params.push(userBUs);
    }

    query += ` ORDER BY p.plan_year DESC, p.bu_id ASC`;

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching plans:', err);
    res.status(500).json({ success: false, message: 'Lỗi tải danh sách kế hoạch: ' + err.message });
  }
};

// 2. GET /api/bu-planning/plans/:id
exports.getPlanDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const isAdmin = isExecutiveOrAdmin(user);
    const userBUs = Array.isArray(user?.bus) ? user.bus.map(b => String(b).toUpperCase()) : [];

    const planRes = await db.query(`
      SELECT p.*, u.full_name as creator_name
      FROM bu_plans p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id = $1
    `, [id]);

    if (planRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy kế hoạch' });
    }

    const plan = planRes.rows[0];

    // Privacy access check
    if (!isAdmin && plan.status !== 'APPROVED' && !userBUs.includes(plan.bu_id.toUpperCase())) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem bản nháp kế hoạch của BU khác.'
      });
    }

    // 2. Products
    const productsRes = await db.query(`
      SELECT 
        pr.*,
        ROUND(CASE WHEN pr.price_per_pax > 0 THEN ((pr.price_per_pax - pr.variable_cost_per_pax) / pr.price_per_pax) * 100 ELSE 0 END, 1) as gross_margin_pct,
        (pr.price_per_pax - pr.variable_cost_per_pax) as gross_profit_per_pax,
        CASE 
          WHEN (pr.price_per_pax - pr.variable_cost_per_pax) > 0 
          THEN CEIL(pr.fixed_cost_per_group / (pr.price_per_pax - pr.variable_cost_per_pax))
          ELSE 0 
        END as break_even_pax
      FROM bu_plan_products pr
      WHERE pr.plan_id = $1
      ORDER BY pr.product_code ASC
    `, [id]);

    // 3. Departures
    const departuresRes = await db.query(`
      SELECT 
        d.*,
        pr.product_code,
        pr.name as product_name,
        pr.price_per_pax,
        pr.variable_cost_per_pax,
        pr.fixed_cost_per_group,
        pr.priority,
        pr.stage,
        (d.groups_count * d.pax_per_group) as total_pax,
        (d.groups_count * d.pax_per_group * pr.price_per_pax) as total_revenue,
        (d.groups_count * (
          d.pax_per_group * (pr.price_per_pax - pr.variable_cost_per_pax) - pr.fixed_cost_per_group
        )) as total_gross_profit
      FROM bu_plan_departures d
      JOIN bu_plan_products pr ON d.product_id = pr.id
      WHERE d.plan_id = $1
      ORDER BY d.month ASC, d.departure_code ASC
    `, [id]);

    // 4. Tasks
    const tasksRes = await db.query(`
      SELECT 
        t.*,
        CASE 
          WHEN t.deadline < CURRENT_DATE AND t.status != 'Đã hoàn tất' THEN true 
          ELSE false 
        END as is_overdue,
        CASE 
          WHEN t.deadline < CURRENT_DATE AND t.status != 'Đã hoàn tất' 
          THEN (CURRENT_DATE - t.deadline) 
          ELSE 0 
        END as days_overdue
      FROM bu_plan_tasks t
      WHERE t.plan_id = $1
      ORDER BY t.deadline ASC NULLS LAST, t.task_code ASC
    `, [id]);

    // 5. Versions
    const versionsRes = await db.query(`
      SELECT id, plan_id, version_label, created_by_name, approval_notes, created_at
      FROM bu_plan_versions
      WHERE plan_id = $1
      ORDER BY created_at DESC
    `, [id]);

    // Compute live matrix 12 months
    const matrix = {};
    productsRes.rows.forEach(p => {
      matrix[p.id] = {
        product_id: p.id,
        product_code: p.product_code,
        name: p.name,
        priority: p.priority,
        stage: p.stage,
        months: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },
        total_groups: 0,
        total_pax: 0,
        total_revenue: 0,
        total_gross_profit: 0
      };
    });

    departuresRes.rows.forEach(d => {
      if (matrix[d.product_id]) {
        const m = d.month;
        if (m >= 1 && m <= 12) {
          matrix[d.product_id].months[m] += Number(d.groups_count);
        }
        matrix[d.product_id].total_groups += Number(d.groups_count);
        matrix[d.product_id].total_pax += Number(d.total_pax);
        matrix[d.product_id].total_revenue += Number(d.total_revenue);
        matrix[d.product_id].total_gross_profit += Number(d.total_gross_profit);
      }
    });

    // Compute Monthly Marketing & Cashflow Breakdown
    const monthlyCashflow = [];
    let grandRevenue = 0;
    let grandGrossProfit = 0;
    let grandPax = 0;
    let grandGroups = 0;

    for (let m = 1; m <= 12; m++) {
      const depsInMonth = departuresRes.rows.filter(d => d.month === m);
      const groups = depsInMonth.reduce((acc, d) => acc + Number(d.groups_count), 0);
      const pax = depsInMonth.reduce((acc, d) => acc + Number(d.total_pax), 0);
      const rev = depsInMonth.reduce((acc, d) => acc + Number(d.total_revenue), 0);
      const gp = depsInMonth.reduce((acc, d) => acc + Number(d.total_gross_profit), 0);

      grandRevenue += rev;
      grandGrossProfit += gp;
      grandPax += pax;
      grandGroups += groups;

      const quota = Number(plan.mkt_budget_quota || 0.01);
      const mktPlanned = Math.round(rev * quota);

      monthlyCashflow.push({
        month: m,
        month_label: `Tháng ${m}`,
        groups_count: groups,
        pax_count: pax,
        revenue: rev,
        gross_profit: gp,
        mkt_budget_planned: mktPlanned,
        mkt_ratio: rev > 0 ? ((mktPlanned / rev) * 100).toFixed(2) + '%' : '0%'
      });
    }

    res.json({
      success: true,
      data: {
        plan,
        products: productsRes.rows,
        departures: departuresRes.rows,
        tasks: tasksRes.rows,
        versions: versionsRes.rows,
        matrix: Object.values(matrix),
        monthly_cashflow: monthlyCashflow,
        summary: {
          total_groups: grandGroups,
          total_pax: grandPax,
          total_revenue: grandRevenue,
          total_gross_profit: grandGrossProfit,
          gross_margin_pct: grandRevenue > 0 ? ((grandGrossProfit / grandRevenue) * 100).toFixed(1) : 0,
          mkt_budget_quota: plan.mkt_budget_quota,
          mkt_budget_total: Number(plan.mkt_budget_total || 0),
          mkt_budget_required_1pct: Math.round(grandRevenue * Number(plan.mkt_budget_quota || 0.01)),
          mkt_ratio_actual: grandRevenue > 0 ? ((Number(plan.mkt_budget_total || 0) / grandRevenue) * 100).toFixed(2) : '0.00'
        }
      }
    });
  } catch (err) {
    console.error('Error fetching plan detail:', err);
    res.status(500).json({ success: false, message: 'Lỗi tải chi tiết kế hoạch: ' + err.message });
  }
};

// 3. POST /api/bu-planning/plans (Create plan)
exports.createPlan = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { bu_id, plan_year, title, owner_name, mkt_budget_quota, mkt_budget_total, notes, template_mode } = req.body;
    const user = req.user;

    if (!bu_id || !plan_year || !title) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đủ BU, Năm kế hoạch và Tên kế hoạch.' });
    }

    // Permission check
    const userBUs = Array.isArray(user?.bus) ? user.bus.map(b => String(b).toUpperCase()) : [];
    if (!isExecutiveOrAdmin(user) && userBUs.length > 0 && !userBUs.includes(bu_id.toUpperCase())) {
      return res.status(403).json({ success: false, message: `Bạn chỉ có quyền tạo kế hoạch cho đơn vị của mình (${userBUs.join(', ')}).` });
    }

    // Check duplicate
    const checkDup = await client.query(
      'SELECT id FROM bu_plans WHERE bu_id = $1 AND plan_year = $2',
      [bu_id.toUpperCase(), parseInt(plan_year, 10)]
    );
    if (checkDup.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Đơn vị ${bu_id.toUpperCase()} đã tồn tại kế hoạch cho năm ${plan_year}. Vui lòng mở kế hoạch hiện có để chỉnh sửa.`
      });
    }

    await client.query('BEGIN');

    let validUserId = null;
    if (user?.id) {
      const uCheck = await client.query('SELECT id FROM users WHERE id = $1', [user.id]);
      if (uCheck.rows.length > 0) validUserId = user.id;
    }

    const tRev = Number(req.body.target_revenue || 15000000000);
    const tGroups = parseInt(req.body.target_groups || 15, 10);
    const tPax = parseInt(req.body.target_pax || 150, 10);
    const tGP = Number(req.body.target_gross_profit || 2500000000);
    const tMargin = Number(req.body.target_margin_pct || 16.7);
    const mktTotal = Math.round(tRev * 0.0100);

    const insertPlan = await client.query(`
      INSERT INTO bu_plans (
        bu_id, plan_year, title, owner_name, owner_id, status, 
        mkt_budget_quota, mkt_budget_total, notes, created_by,
        target_revenue, target_groups, target_pax, target_gross_profit, target_margin_pct
      ) VALUES ($1, $2, $3, $4, $5, 'DRAFT', 0.0100, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      bu_id.toUpperCase(),
      parseInt(plan_year, 10),
      title.trim(),
      owner_name || user?.full_name || 'BUM ' + bu_id,
      validUserId,
      mktTotal,
      notes || '',
      validUserId,
      tRev,
      tGroups,
      tPax,
      tGP,
      tMargin
    ]);

    const newPlan = insertPlan.rows[0];

    // If template_mode is 'template', seed from BU_TEMPLATES
    const template = BU_TEMPLATES[bu_id.toUpperCase()];
    if (template_mode === 'template' && template) {
      const prodIdMap = {};
      // Insert products
      for (const p of template.products) {
        const prodRes = await client.query(`
          INSERT INTO bu_plan_products (
            plan_id, product_code, name, group_type, season, priority, stage,
            person_in_charge, target_pax_per_group, price_per_pax, variable_cost_per_pax,
            fixed_cost_per_group, strategy_notes, color, icon
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          RETURNING id, product_code
        `, [
          newPlan.id, p.product_code, p.name, p.group_type, p.season, p.priority, p.stage,
          p.person_in_charge, p.target_pax_per_group, p.price_per_pax, p.variable_cost_per_pax,
          p.fixed_cost_per_group, p.strategy_notes, p.color, p.icon
        ]);
        prodIdMap[p.product_code] = prodRes.rows[0].id;
      }

      // Insert departures
      if (template.departures) {
        for (const d of template.departures) {
          const pId = prodIdMap[d.product_code];
          if (pId) {
            await client.query(`
              INSERT INTO bu_plan_departures (
                plan_id, product_id, departure_code, month, original_milestone,
                groups_count, pax_per_group, sales_status, person_in_charge, notes
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `, [
              newPlan.id, pId, d.departure_code, d.month, d.original_milestone,
              d.groups_count, d.pax_per_group, d.sales_status, d.person_in_charge || newPlan.owner_name, d.notes || ''
            ]);
          }
        }
      }

      // Insert tasks
      if (template.tasks) {
        for (const t of template.tasks) {
          await client.query(`
            INSERT INTO bu_plan_tasks (
              plan_id, task_code, season_stage, related_products, category,
              deadline, completed_date, assignee, status, obstacles_notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `, [
            newPlan.id, t.task_code, t.season_stage, t.related_products, t.category,
            t.deadline, t.completed_date, t.assignee, t.status, t.obstacles_notes
          ]);
        }
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: newPlan, message: 'Đã tạo kế hoạch mới thành công!' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating plan:', err);
    res.status(500).json({ success: false, message: 'Lỗi tạo kế hoạch: ' + err.message });
  } finally {
    client.release();
  }
};

// 4. PUT /api/bu-planning/plans/:id/setup
exports.updatePlanSetup = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      plan_year, title, owner_name, notes,
      target_revenue, target_groups, target_pax, target_gross_profit, target_margin_pct 
    } = req.body;
    const user = req.user;

    const check = await db.query('SELECT * FROM bu_plans WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy kế hoạch' });
    }
    const current = check.rows[0];

    // Check BU write permission
    const userBUs = Array.isArray(user?.bus) ? user.bus.map(b => String(b).toUpperCase()) : [];
    if (!isExecutiveOrAdmin(user) && userBUs.length > 0 && !userBUs.includes(current.bu_id.toUpperCase())) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền chỉnh sửa kế hoạch của BU khác.' });
    }

    if (current.status === 'APPROVED' && !isExecutiveOrAdmin(user)) {
      return res.status(400).json({ success: false, message: 'Kế hoạch đã được BOD phê duyệt, không thể chỉnh sửa trực tiếp.' });
    }

    const tRev = target_revenue !== undefined ? Number(target_revenue) : Number(current.target_revenue || 0);
    const mktQuota = 0.0100; // Cố định 1% mặc định của chính sách FIT Tour
    const mktTotal = Math.round(tRev * mktQuota);

    const result = await db.query(`
      UPDATE bu_plans SET
        plan_year = COALESCE($1, plan_year),
        title = COALESCE($2, title),
        owner_name = COALESCE($3, owner_name),
        mkt_budget_quota = $4,
        mkt_budget_total = $5,
        target_revenue = COALESCE($6, target_revenue),
        target_groups = COALESCE($7, target_groups),
        target_pax = COALESCE($8, target_pax),
        target_gross_profit = COALESCE($9, target_gross_profit),
        target_margin_pct = COALESCE($10, target_margin_pct),
        notes = COALESCE($11, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *
    `, [
      plan_year ? parseInt(plan_year, 10) : null,
      title ? title.trim() : null,
      owner_name ? owner_name.trim() : null,
      mktQuota,
      mktTotal,
      target_revenue !== undefined ? Number(target_revenue) : null,
      target_groups !== undefined ? parseInt(target_groups, 10) : null,
      target_pax !== undefined ? parseInt(target_pax, 10) : null,
      target_gross_profit !== undefined ? Number(target_gross_profit) : null,
      target_margin_pct !== undefined ? Number(target_margin_pct) : null,
      notes !== undefined ? notes : null,
      id
    ]);

    res.json({ success: true, data: result.rows[0], message: 'Cập nhật mục tiêu kinh doanh BU thành công!' });
  } catch (err) {
    console.error('Error updating plan setup:', err);
    res.status(500).json({ success: false, message: 'Lỗi cập nhật thiết lập: ' + err.message });
  }
};

// 5. POST /api/bu-planning/plans/:id/products
exports.saveProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      product_id, product_code, name, group_type, season, priority, stage,
      person_in_charge, target_pax_per_group, price_per_pax, variable_cost_per_pax,
      fixed_cost_per_group, strategy_notes, color, icon
    } = req.body;

    if (!product_code || !name) {
      return res.status(400).json({ success: false, message: 'Mã sản phẩm và Tên sản phẩm không được để trống.' });
    }

    // Number validation (Test 10)
    const price = Number(price_per_pax);
    const varCost = Number(variable_cost_per_pax);
    const fixedCost = Number(fixed_cost_per_group);
    const pax = Number(target_pax_per_group);

    if (isNaN(price) || price < 0 || isNaN(varCost) || varCost < 0 || isNaN(fixedCost) || fixedCost < 0) {
      return res.status(400).json({ success: false, message: 'Giá bán, biến phí và định phí phải là số hợp lệ không âm.' });
    }

    if (product_id) {
      // Update
      const result = await db.query(`
        UPDATE bu_plan_products SET
          product_code = $1, name = $2, group_type = $3, season = $4,
          priority = $5, stage = $6, person_in_charge = $7, target_pax_per_group = $8,
          price_per_pax = $9, variable_cost_per_pax = $10, fixed_cost_per_group = $11,
          strategy_notes = $12, color = $13, icon = $14, updated_at = CURRENT_TIMESTAMP
        WHERE id = $15 AND plan_id = $16
        RETURNING *
      `, [
        product_code.trim(), name.trim(), group_type || 'Tuyến trụ cột', season || '',
        priority || 'Cao', stage || 'Đang bán', person_in_charge || '', pax || 10,
        price, varCost, fixedCost, strategy_notes || '', color || '#0284c7', icon || 'Compass',
        product_id, id
      ]);
      return res.json({ success: true, data: result.rows[0], message: 'Đã cập nhật sản phẩm!' });
    } else {
      // Check duplicate code (Test 10)
      const dup = await db.query('SELECT id FROM bu_plan_products WHERE plan_id = $1 AND product_code = $2', [id, product_code.trim()]);
      if (dup.rows.length > 0) {
        return res.status(400).json({ success: false, message: `Mã sản phẩm ${product_code} đã tồn tại trong kế hoạch này!` });
      }

      const result = await db.query(`
        INSERT INTO bu_plan_products (
          plan_id, product_code, name, group_type, season, priority, stage,
          person_in_charge, target_pax_per_group, price_per_pax, variable_cost_per_pax,
          fixed_cost_per_group, strategy_notes, color, icon
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `, [
        id, product_code.trim(), name.trim(), group_type || 'Tuyến trụ cột', season || '',
        priority || 'Cao', stage || 'Đang bán', person_in_charge || '', pax || 10,
        price, varCost, fixedCost, strategy_notes || '', color || '#0284c7', icon || 'Compass'
      ]);
      return res.status(201).json({ success: true, data: result.rows[0], message: 'Đã thêm sản phẩm mới!' });
    }
  } catch (err) {
    console.error('Error saving product:', err);
    res.status(500).json({ success: false, message: 'Lỗi lưu sản phẩm: ' + err.message });
  }
};

// 6. DELETE /api/bu-planning/plans/:id/products/:productId
exports.deleteProduct = async (req, res) => {
  try {
    const { id, productId } = req.params;
    await db.query('DELETE FROM bu_plan_products WHERE id = $1 AND plan_id = $2', [productId, id]);
    res.json({ success: true, message: 'Đã xóa sản phẩm và các đợt khởi hành liên quan!' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ success: false, message: 'Lỗi xóa sản phẩm: ' + err.message });
  }
};

// 7. POST /api/bu-planning/plans/:id/departures
exports.saveDeparture = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      departure_id, product_id, departure_code, month, original_milestone,
      groups_count, pax_per_group, sales_status, person_in_charge, notes
    } = req.body;

    if (!product_id || !month) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn sản phẩm và tháng khởi hành.' });
    }

    const m = parseInt(month, 10);
    if (isNaN(m) || m < 1 || m > 12) {
      return res.status(400).json({ success: false, message: 'Tháng khởi hành phải từ 1 đến 12.' });
    }

    const groups = parseInt(groups_count, 10) || 1;
    const pax = parseInt(pax_per_group, 10) || 10;
    const code = (departure_code || '').trim();

    if (departure_id) {
      const result = await db.query(`
        UPDATE bu_plan_departures SET
          product_id = $1, departure_code = $2, month = $3, original_milestone = $4,
          groups_count = $5, pax_per_group = $6, sales_status = $7, person_in_charge = $8,
          notes = $9, updated_at = CURRENT_TIMESTAMP
        WHERE id = $10 AND plan_id = $11
        RETURNING *
      `, [
        product_id, code, m, original_milestone || `T${m}`,
        groups, pax, sales_status || 'Đang bán', person_in_charge || '', notes || '',
        departure_id, id
      ]);
      return res.json({ success: true, data: result.rows[0], message: 'Đã cập nhật đợt khởi hành!' });
    } else {
      // Generate departure code if not provided
      let finalCode = code;
      if (!finalCode) {
        const countRes = await db.query('SELECT COUNT(id) FROM bu_plan_departures WHERE plan_id = $1', [id]);
        const nextNum = parseInt(countRes.rows[0].count, 10) + 1;
        finalCode = `DEP-${String(nextNum).padStart(3, '0')}`;
      } else {
        const dup = await db.query('SELECT id FROM bu_plan_departures WHERE plan_id = $1 AND departure_code = $2', [id, finalCode]);
        if (dup.rows.length > 0) {
          return res.status(400).json({ success: false, message: `Mã đợt ${finalCode} đã tồn tại trong kế hoạch!` });
        }
      }

      const result = await db.query(`
        INSERT INTO bu_plan_departures (
          plan_id, product_id, departure_code, month, original_milestone,
          groups_count, pax_per_group, sales_status, person_in_charge, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        id, product_id, finalCode, m, original_milestone || `T${m}`,
        groups, pax, sales_status || 'Đang bán', person_in_charge || '', notes || ''
      ]);
      return res.status(201).json({ success: true, data: result.rows[0], message: 'Đã thêm đợt khởi hành!' });
    }
  } catch (err) {
    console.error('Error saving departure:', err);
    res.status(500).json({ success: false, message: 'Lỗi lưu đợt khởi hành: ' + err.message });
  }
};

// 8. DELETE /api/bu-planning/plans/:id/departures/:departureId
exports.deleteDeparture = async (req, res) => {
  try {
    const { id, departureId } = req.params;
    await db.query('DELETE FROM bu_plan_departures WHERE id = $1 AND plan_id = $2', [departureId, id]);
    res.json({ success: true, message: 'Đã xóa đợt khởi hành!' });
  } catch (err) {
    console.error('Error deleting departure:', err);
    res.status(500).json({ success: false, message: 'Lỗi xóa đợt khởi hành: ' + err.message });
  }
};

// 9. POST /api/bu-planning/plans/:id/tasks
exports.saveTask = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      task_id, task_code, season_stage, related_products, category,
      deadline, completed_date, assignee, status, obstacles_notes
    } = req.body;

    if (!category) {
      return res.status(400).json({ success: false, message: 'Tên hạng mục công việc không được để trống.' });
    }

    if (task_id) {
      const result = await db.query(`
        UPDATE bu_plan_tasks SET
          task_code = $1, season_stage = $2, related_products = $3, category = $4,
          deadline = $5, completed_date = $6, assignee = $7, status = $8,
          obstacles_notes = $9, updated_at = CURRENT_TIMESTAMP
        WHERE id = $10 AND plan_id = $11
        RETURNING *
      `, [
        task_code, season_stage || '', related_products || '', category.trim(),
        deadline || null, completed_date || null, assignee || '', status || 'Đang chạy',
        obstacles_notes || '', task_id, id
      ]);
      return res.json({ success: true, data: result.rows[0], message: 'Đã cập nhật công việc!' });
    } else {
      let finalCode = (task_code || '').trim();
      if (!finalCode) {
        const countRes = await db.query('SELECT COUNT(id) FROM bu_plan_tasks WHERE plan_id = $1', [id]);
        const nextNum = parseInt(countRes.rows[0].count, 10) + 1;
        finalCode = `TSK-${String(nextNum).padStart(3, '0')}`;
      } else {
        const dup = await db.query('SELECT id FROM bu_plan_tasks WHERE plan_id = $1 AND task_code = $2', [id, finalCode]);
        if (dup.rows.length > 0) {
          return res.status(400).json({ success: false, message: `Mã việc ${finalCode} đã tồn tại trong kế hoạch!` });
        }
      }

      const result = await db.query(`
        INSERT INTO bu_plan_tasks (
          plan_id, task_code, season_stage, related_products, category,
          deadline, completed_date, assignee, status, obstacles_notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        id, finalCode, season_stage || '', related_products || '', category.trim(),
        deadline || null, completed_date || null, assignee || '', status || 'Đang chạy',
        obstacles_notes || ''
      ]);
      return res.status(201).json({ success: true, data: result.rows[0], message: 'Đã thêm công việc mới!' });
    }
  } catch (err) {
    console.error('Error saving task:', err);
    res.status(500).json({ success: false, message: 'Lỗi lưu công việc: ' + err.message });
  }
};

// 10. DELETE /api/bu-planning/plans/:id/tasks/:taskId
exports.deleteTask = async (req, res) => {
  try {
    const { id, taskId } = req.params;
    await db.query('DELETE FROM bu_plan_tasks WHERE id = $1 AND plan_id = $2', [taskId, id]);
    res.json({ success: true, message: 'Đã xóa công việc!' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ success: false, message: 'Lỗi xóa công việc: ' + err.message });
  }
};

// 11. POST /api/bu-planning/plans/:id/status (Approval State Machine)
exports.updateStatus = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { id } = req.params;
    const { action, feedback_notes, approval_notes } = req.body;
    const user = req.user;
    const isAdmin = isExecutiveOrAdmin(user);

    const planRes = await client.query('SELECT * FROM bu_plans WHERE id = $1', [id]);
    if (planRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy kế hoạch.' });
    }
    const plan = planRes.rows[0];

    await client.query('BEGIN');

    if (action === 'SUBMIT') {
      // Staff or BUM submits for review
      await client.query(`
        UPDATE bu_plans SET status = 'SUBMITTED', updated_at = CURRENT_TIMESTAMP WHERE id = $1
      `, [id]);
      await client.query('COMMIT');
      return res.json({ success: true, message: 'Kế hoạch đã được gửi lên Ban Giám Đốc phê duyệt!' });
    }

    if (action === 'REQUEST_CHANGES') {
      // Only BOD / Admin can request changes
      if (!isAdmin) {
        return res.status(403).json({ success: false, message: 'Chỉ Ban Giám Đốc hoặc Quản trị viên mới có quyền yêu cầu chỉnh sửa.' });
      }
      await client.query(`
        UPDATE bu_plans SET 
          status = 'CHANGES_REQUESTED', 
          feedback_notes = $1, 
          updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2
      `, [feedback_notes || 'Cần điều chỉnh chỉ tiêu hoặc chi phí.', id]);
      await client.query('COMMIT');
      return res.json({ success: true, message: 'Đã gửi phản hồi yêu cầu BU điều chỉnh kế hoạch.' });
    }

    if (action === 'APPROVE') {
      // Only BOD / Admin can approve
      if (!isAdmin) {
        return res.status(403).json({ success: false, message: 'Chỉ Ban Giám Đốc hoặc Quản trị viên mới có quyền phê duyệt kế hoạch.' });
      }

      // Update plan to APPROVED
      await client.query(`
        UPDATE bu_plans SET 
          status = 'APPROVED', 
          feedback_notes = NULL,
          updated_at = CURRENT_TIMESTAMP 
        WHERE id = $1
      `, [id]);

      // Create snapshot version in bu_plan_versions
      const products = await client.query('SELECT * FROM bu_plan_products WHERE plan_id = $1', [id]);
      const departures = await client.query('SELECT * FROM bu_plan_departures WHERE plan_id = $1', [id]);
      const tasks = await client.query('SELECT * FROM bu_plan_tasks WHERE plan_id = $1', [id]);
      const versionCountRes = await client.query('SELECT COUNT(id) FROM bu_plan_versions WHERE plan_id = $1', [id]);
      const vCount = parseInt(versionCountRes.rows[0].count, 10);
      const nextVersionLabel = vCount === 0 ? 'v1.0' : `v1.${vCount}`;

      const snapshot = {
        plan,
        products: products.rows,
        departures: departures.rows,
        tasks: tasks.rows,
        approved_at: new Date().toISOString(),
        approved_by: user?.full_name || 'BOD'
      };

      await client.query(`
        INSERT INTO bu_plan_versions (
          plan_id, version_label, snapshot_data, created_by_name, approval_notes
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        id, nextVersionLabel, JSON.stringify(snapshot), user?.full_name || 'BOD', approval_notes || 'Phê duyệt chính thức'
      ]);

      await client.query('COMMIT');
      return res.json({ success: true, message: `Kế hoạch đã được phê duyệt và đóng băng thành phiên bản ${nextVersionLabel}!` });
    }

    if (action === 'REVERT_DRAFT') {
      await client.query(`
        UPDATE bu_plans SET status = 'DRAFT', updated_at = CURRENT_TIMESTAMP WHERE id = $1
      `, [id]);
      await client.query('COMMIT');
      return res.json({ success: true, message: 'Đã chuyển kế hoạch về trạng thái Bản nháp để tiếp tục chỉnh sửa.' });
    }

    return res.status(400).json({ success: false, message: 'Hành động không hợp lệ.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating plan status:', err);
    res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái: ' + err.message });
  } finally {
    client.release();
  }
};

// 12. POST /api/bu-planning/dev-seed-demo (Localhost 1-Click Seed)
exports.devSeedDemo = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { buId = 'BU5', year = 2027 } = req.body;
    const template = BU_TEMPLATES[buId.toUpperCase()] || BU_TEMPLATES.BU5;

    // Delete existing demo plan for this BU & year
    await client.query('DELETE FROM bu_plans WHERE bu_id = $1 AND plan_year = $2', [buId.toUpperCase(), parseInt(year, 10)]);

    // Insert Plan
    const insertPlan = await client.query(`
      INSERT INTO bu_plans (
        bu_id, plan_year, title, owner_name, status, mkt_budget_quota, mkt_budget_total, notes
      ) VALUES ($1, $2, $3, $4, 'DRAFT', $5, $6, $7)
      RETURNING *
    `, [
      buId.toUpperCase(),
      parseInt(year, 10),
      template.title,
      template.ownerName,
      template.mktBudgetQuota,
      316460000, // 316.46M marketing budget
      template.notes
    ]);
    const plan = insertPlan.rows[0];

    const prodIdMap = {};
    for (const p of template.products) {
      const prodRes = await client.query(`
        INSERT INTO bu_plan_products (
          plan_id, product_code, name, group_type, season, priority, stage,
          person_in_charge, target_pax_per_group, price_per_pax, variable_cost_per_pax,
          fixed_cost_per_group, strategy_notes, color, icon
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id, product_code
      `, [
        plan.id, p.product_code, p.name, p.group_type, p.season, p.priority, p.stage,
        p.person_in_charge, p.target_pax_per_group, p.price_per_pax, p.variable_cost_per_pax,
        p.fixed_cost_per_group, p.strategy_notes, p.color, p.icon
      ]);
      prodIdMap[p.product_code] = prodRes.rows[0].id;
    }

    for (const d of template.departures) {
      const pId = prodIdMap[d.product_code];
      if (pId) {
        await client.query(`
          INSERT INTO bu_plan_departures (
            plan_id, product_id, departure_code, month, original_milestone,
            groups_count, pax_per_group, sales_status, person_in_charge, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          plan.id, pId, d.departure_code, d.month, d.original_milestone,
          d.groups_count, d.pax_per_group, d.sales_status, d.person_in_charge || plan.owner_name, d.notes || ''
        ]);
      }
    }

    for (const t of template.tasks) {
      await client.query(`
        INSERT INTO bu_plan_tasks (
          plan_id, task_code, season_stage, related_products, category,
          deadline, completed_date, assignee, status, obstacles_notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        plan.id, t.task_code, t.season_stage, t.related_products, t.category,
        t.deadline, t.completed_date, t.assignee, t.status, t.obstacles_notes
      ]);
    }

    await client.query('COMMIT');
    res.json({ success: true, message: `Đã nạp thành công bộ dữ liệu chuẩn ${buId} năm ${year} (Google Sheet Master Template)!`, planId: plan.id });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding demo data:', err);
    res.status(500).json({ success: false, message: 'Lỗi nạp dữ liệu mẫu: ' + err.message });
  } finally {
    client.release();
  }
};

// 13. POST /api/bu-planning/dev-reset-sandbox (Localhost 1-Click Reset)
exports.devResetSandbox = async (req, res) => {
  try {
    await db.query('TRUNCATE TABLE bu_plans CASCADE');
    res.json({ success: true, message: 'Đã dọn sạch toàn bộ dữ liệu kiểm thử Sandbox!' });
  } catch (err) {
    console.error('Error resetting sandbox:', err);
    res.status(500).json({ success: false, message: 'Lỗi dọn sandbox: ' + err.message });
  }
};

// 14. POST /api/bu-planning/plans/:id/batch-products (Excel-like Grid Batch Save)
exports.batchSaveProducts = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { id } = req.params;
    const { products } = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ success: false, message: 'Danh sách sản phẩm không hợp lệ' });
    }

    await client.query('BEGIN');
    const saved = [];
    for (const p of products) {
      if (!p.product_code || !p.name) continue;
      const price = Number(p.price_per_pax) || 0;
      const varCost = Number(p.variable_cost_per_pax) || 0;
      const fixedCost = Number(p.fixed_cost_per_group) || 0;
      const pax = Number(p.target_pax_per_group) || 10;

      if (p.id && typeof p.id === 'number') {
        const upRes = await client.query(`
          UPDATE bu_plan_products SET
            product_code = $1, name = $2, group_type = $3, season = $4,
            priority = $5, stage = $6, person_in_charge = $7, target_pax_per_group = $8,
            price_per_pax = $9, variable_cost_per_pax = $10, fixed_cost_per_group = $11,
            strategy_notes = $12, updated_at = CURRENT_TIMESTAMP
          WHERE id = $13 AND plan_id = $14
          RETURNING *
        `, [
          p.product_code.trim(), p.name.trim(), p.group_type || 'Tuyến trụ cột', p.season || '',
          p.priority || 'Cao', p.stage || 'Đang bán', p.person_in_charge || '', pax,
          price, varCost, fixedCost, p.strategy_notes || '', p.id, id
        ]);
        if (upRes.rows.length > 0) saved.push(upRes.rows[0]);
      } else {
        // Check duplicate code before insert
        const dup = await client.query('SELECT id FROM bu_plan_products WHERE plan_id = $1 AND product_code = $2', [id, p.product_code.trim()]);
        if (dup.rows.length > 0) {
          const upRes = await client.query(`
            UPDATE bu_plan_products SET
              name = $1, group_type = $2, season = $3, priority = $4, stage = $5,
              person_in_charge = $6, target_pax_per_group = $7, price_per_pax = $8,
              variable_cost_per_pax = $9, fixed_cost_per_group = $10, strategy_notes = $11, updated_at = CURRENT_TIMESTAMP
            WHERE id = $12
            RETURNING *
          `, [
            p.name.trim(), p.group_type || 'Tuyến trụ cột', p.season || '', p.priority || 'Cao', p.stage || 'Đang bán',
            p.person_in_charge || '', pax, price, varCost, fixedCost, p.strategy_notes || '', dup.rows[0].id
          ]);
          saved.push(upRes.rows[0]);
        } else {
          const insRes = await client.query(`
            INSERT INTO bu_plan_products (
              plan_id, product_code, name, group_type, season, priority, stage,
              person_in_charge, target_pax_per_group, price_per_pax, variable_cost_per_pax,
              fixed_cost_per_group, strategy_notes, color, icon
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *
          `, [
            id, p.product_code.trim(), p.name.trim(), p.group_type || 'Tuyến trụ cột', p.season || '',
            p.priority || 'Cao', p.stage || 'Đang bán', p.person_in_charge || '', pax,
            price, varCost, fixedCost, p.strategy_notes || '', p.color || '#0284c7', p.icon || 'Compass'
          ]);
          saved.push(insRes.rows[0]);
        }
      }
    }
    await client.query('COMMIT');
    res.json({ success: true, message: `Đã lưu thành công ${saved.length} sản phẩm dạng bảng tính!`, data: saved });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error batch saving products:', err);
    res.status(500).json({ success: false, message: 'Lỗi lưu danh mục sản phẩm: ' + err.message });
  } finally {
    client.release();
  }
};

// 15. POST /api/bu-planning/plans/:id/matrix-cell (Excel-like Direct Matrix Cell Edit)
exports.updateMatrixCell = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_id, month, groups_count } = req.body;

    const m = parseInt(month, 10);
    const groups = parseInt(groups_count, 10) || 0;
    if (!product_id || isNaN(m) || m < 1 || m > 12) {
      return res.status(400).json({ success: false, message: 'Dữ liệu ô ma trận không hợp lệ.' });
    }

    const prodRes = await db.query('SELECT * FROM bu_plan_products WHERE id = $1 AND plan_id = $2', [product_id, id]);
    if (prodRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }
    const prod = prodRes.rows[0];

    const existing = await db.query(
      'SELECT id FROM bu_plan_departures WHERE plan_id = $1 AND product_id = $2 AND month = $3',
      [id, product_id, m]
    );

    if (groups <= 0) {
      if (existing.rows.length > 0) {
        await db.query('DELETE FROM bu_plan_departures WHERE id = $1', [existing.rows[0].id]);
      }
      return res.json({ success: true, message: `Đã xóa lịch khởi hành tháng ${m}` });
    } else {
      if (existing.rows.length > 0) {
        const upRes = await db.query(`
          UPDATE bu_plan_departures SET
            groups_count = $1, pax_per_group = $2, updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
          RETURNING *
        `, [groups, prod.target_pax_per_group || 10, existing.rows[0].id]);
        return res.json({ success: true, data: upRes.rows[0], message: `Đã cập nhật tháng ${m}: ${groups} đoàn` });
      } else {
        const depCode = `${prod.product_code}-T${String(m).padStart(2, '0')}`;
        const insRes = await db.query(`
          INSERT INTO bu_plan_departures (
            plan_id, product_id, departure_code, month, original_milestone,
            groups_count, pax_per_group, sales_status, person_in_charge, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *
        `, [
          id, product_id, depCode, m, `T${m}`,
          groups, prod.target_pax_per_group || 10, 'Đang bán', prod.person_in_charge || '', ''
        ]);
        return res.json({ success: true, data: insRes.rows[0], message: `Đã tạo đợt khởi hành tháng ${m}: ${groups} đoàn` });
      }
    }
  } catch (err) {
    console.error('Error updating matrix cell:', err);
    res.status(500).json({ success: false, message: 'Lỗi cập nhật ma trận: ' + err.message });
  }
};
