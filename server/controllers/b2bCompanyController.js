const db = require('../db');
const { logActivity } = require('../utils/logger');

exports.getAllCompanies = async (req, res) => {
    try {
        const isPrivileged = ['admin', 'manager', 'group_manager', 'group_operations', 'group_operations_lead'].includes(req.user.role);
        // Non-privileged users only see companies assigned to them
        const whereClause = !isPrivileged 
            ? 'WHERE c.assigned_to = $1' 
            : '';
        const params = !isPrivileged 
            ? [req.user.id] 
            : [];

        const result = await db.query(`
            SELECT c.*,
                   u.full_name as assigned_name,
                   u.username as assigned_username,
                   COALESCE(contact_stats.total_contacts, 0) as total_contacts,
                   COALESCE(project_stats.total_projects, 0) as total_projects,
                   COALESCE(project_stats.total_revenue, 0) as total_revenue
            FROM b2b_companies c
            LEFT JOIN users u ON c.assigned_to = u.id
            LEFT JOIN (
                SELECT company_id, COUNT(*) as total_contacts
                FROM group_leaders WHERE contact_status = 'active'
                GROUP BY company_id
            ) contact_stats ON contact_stats.company_id = c.id
            LEFT JOIN (
                SELECT company_id, COUNT(*) as total_projects, SUM(total_revenue) as total_revenue
                FROM group_projects
                GROUP BY company_id
            ) project_stats ON project_stats.company_id = c.id
            ${whereClause}
            ORDER BY c.name ASC
        `, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getCompanyById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Company info
        const companyRes = await db.query(`
            SELECT c.*, u.full_name as assigned_name
            FROM b2b_companies c
            LEFT JOIN users u ON c.assigned_to = u.id
            WHERE c.id = $1
        `, [id]);
        
        if (companyRes.rows.length === 0) {
            return res.status(404).json({ message: 'Company not found' });
        }
        
        const company = companyRes.rows[0];

        // Data-level access: group_staff can only view their assigned companies
        const isPrivileged = ['admin', 'manager', 'group_manager'].includes(req.user.role);
        if (!isPrivileged && req.user.role === 'group_staff' && company.assigned_to !== req.user.id) {
            return res.status(403).json({ message: 'Bạn không có quyền xem doanh nghiệp này.' });
        }
        
        // Contacts (group_leaders)
        const contactsRes = await db.query(`
            SELECT gl.*, u.full_name as assigned_name
            FROM group_leaders gl
            LEFT JOIN users u ON gl.assigned_to = u.id
            WHERE gl.company_id = $1
            ORDER BY gl.is_primary DESC, gl.name ASC
        `, [id]);
        
        // Projects
        const projectsRes = await db.query(`
            SELECT gp.*, gl.name as leader_name
            FROM group_projects gp
            LEFT JOIN group_leaders gl ON gp.group_leader_id = gl.id
            WHERE gp.company_id = $1
            ORDER BY gp.departure_date DESC NULLS FIRST
        `, [id]);
        
        // Notes (interaction history)
        const notesRes = await db.query(`
            SELECT n.*, u.full_name as creator_name
            FROM b2b_company_notes n
            LEFT JOIN users u ON n.created_by = u.id
            WHERE n.company_id = $1
            ORDER BY n.created_at DESC
        `, [id]);
        
        // Events
        const eventsRes = await db.query(`
            SELECT e.*, u.full_name as creator_name
            FROM group_leader_events e
            LEFT JOIN users u ON e.created_by = u.id
            WHERE e.company_id = $1
            ORDER BY e.event_date DESC
        `, [id]);
        
        res.json({
            ...company,
            contacts: contactsRes.rows,
            projects: projectsRes.rows,
            interaction_history: notesRes.rows,
            events: eventsRes.rows
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createCompany = async (req, res) => {
    try {
        const { name, tax_id, industry, phone, email, address, founded_date, website, assigned_to, notes, travel_styles, experiences, internal_notes, special_requests, first_deal_date } = req.body;
        
        const result = await db.query(`
            INSERT INTO b2b_companies (name, tax_id, industry, phone, email, address, founded_date, website, assigned_to, notes, travel_styles, experiences, internal_notes, special_requests, first_deal_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *
        `, [name, tax_id, industry, phone, email, address, founded_date || null, website, assigned_to || req.user.id, notes, JSON.stringify(travel_styles || []), JSON.stringify(experiences || []), internal_notes, special_requests, first_deal_date || null]);
        
        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'CREATE',
                entity_type: 'B2B_COMPANY',
                entity_id: result.rows[0].id,
                details: `Tạo DN B2B: ${name}`,
                new_data: result.rows[0]
            });
        }
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, tax_id, industry, phone, email, address, founded_date, website, assigned_to, notes, travel_styles, experiences, internal_notes, special_requests, first_deal_date } = req.body;
        
        // Fetch old data for logging
        const oldCompanyRes = await db.query('SELECT * FROM b2b_companies WHERE id = $1', [id]);
        if (oldCompanyRes.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        const oldCompany = oldCompanyRes.rows[0];

        const result = await db.query(`
            UPDATE b2b_companies 
            SET name=$1, tax_id=$2, industry=$3, phone=$4, email=$5, address=$6, 
                founded_date=$7, website=$8, assigned_to=$9, notes=$10, 
                travel_styles=$11, experiences=$12, internal_notes=$13, special_requests=$14, first_deal_date=$15,
                updated_at=CURRENT_TIMESTAMP
            WHERE id=$16 RETURNING *
        `, [name, tax_id, industry, phone, email, address, founded_date || null, website, assigned_to || null, notes, JSON.stringify(travel_styles || []), JSON.stringify(experiences || []), internal_notes, special_requests, first_deal_date || null, id]);
        
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });

        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'UPDATE',
                entity_type: 'B2B_COMPANY',
                entity_id: id,
                details: `Cập nhật DN B2B: ${name}`,
                old_data: oldCompany,
                new_data: result.rows[0]
            });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch old data for logging
        const oldCompanyRes = await db.query('SELECT * FROM b2b_companies WHERE id = $1', [id]);
        if (oldCompanyRes.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        const oldCompany = oldCompanyRes.rows[0];

        // Unlink leaders and projects first (SET NULL via FK)
        await db.query('DELETE FROM b2b_companies WHERE id = $1', [id]);

        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'DELETE',
                entity_type: 'B2B_COMPANY',
                entity_id: id,
                details: `Xóa DN B2B: ${oldCompany.name}`,
                old_data: oldCompany
            });
        }

        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addCompanyNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        if (!content) return res.status(400).json({ message: 'Content is required' });

        const result = await db.query(`
            INSERT INTO b2b_company_notes (company_id, content, created_by)
            VALUES ($1, $2, $3) RETURNING *
        `, [id, content, req.user.id]);

        const noteRes = await db.query(`
            SELECT n.*, u.full_name as creator_name
            FROM b2b_company_notes n
            LEFT JOIN users u ON n.created_by = u.id
            WHERE n.id = $1
        `, [result.rows[0].id]);

        res.status(201).json(noteRes.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addCompanyEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, event_type, event_date, description } = req.body;
        const result = await db.query(`
            INSERT INTO group_leader_events (company_id, title, event_type, event_date, description, created_by)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `, [id, title, event_type, event_date, description, req.user.id]);

        const r = await db.query(`SELECT e.*, u.full_name as creator_name FROM group_leader_events e LEFT JOIN users u ON e.created_by=u.id WHERE e.id=$1`, [result.rows[0].id]);
        res.status(201).json(r.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateEventStatus = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { status } = req.body;
        await db.query('UPDATE group_leader_events SET status=$1 WHERE id=$2', [status, eventId]);
        res.json({ message: 'Updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
