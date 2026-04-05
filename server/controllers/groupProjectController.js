const db = require('../db');
const { logActivity } = require('../utils/logger');

exports.getAllProjects = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT gp.*, gl.name as leader_name, gl.company_name, 
                   gl.phone as leader_phone, gl.email as leader_email,
                   u.full_name as assigned_name, u.username as assigned_username
            FROM group_projects gp
            LEFT JOIN group_leaders gl ON gp.group_leader_id = gl.id
            LEFT JOIN users u ON gp.assigned_to = u.id
            ORDER BY gp.created_at DESC
        `);

        // Masking logic based on ownership of the project
        const isPrivileged = ['admin', 'manager', 'group_manager'].includes(req.user.role);
        
        const projects = result.rows.map(p => {
            const isOwner = p.assigned_to === req.user.id;
            const canViewRaw = isPrivileged || isOwner;

            if (!canViewRaw) {
                return {
                    ...p,
                    leader_name: p.leader_name ? p.leader_name + ' (***)' : null,
                    company_name: p.company_name ? p.company_name + ' (***)' : null,
                    leader_phone: p.leader_phone ? '***' : null,
                    leader_email: p.leader_email ? '***' : null
                };
            }
            return p;
        });

        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createProject = async (req, res) => {
    try {
        const { name, group_leader_id, source, status, destination, expected_pax, price_per_pax, departure_date, return_date, expected_month, total_revenue, assigned_to } = req.body;
        
        const result = await db.query(`
            INSERT INTO group_projects 
            (name, group_leader_id, source, status, destination, expected_pax, price_per_pax, departure_date, return_date, expected_month, total_revenue, assigned_to)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *
        `, [name, group_leader_id, source, status || 'Báo giá', destination, parseInt(expected_pax)||0, parseFloat(price_per_pax)||0, departure_date||null, return_date||null, expected_month, parseFloat(total_revenue)||0, assigned_to || req.user.id]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, group_leader_id, source, status, destination, expected_pax, price_per_pax, departure_date, return_date, expected_month, total_revenue, assigned_to } = req.body;
        
        const result = await db.query(`
            UPDATE group_projects
            SET name=$1, group_leader_id=$2, source=$3, status=$4, destination=$5, expected_pax=$6, price_per_pax=$7, departure_date=$8, return_date=$9, expected_month=$10, total_revenue=$11, assigned_to=$12, updated_at=CURRENT_TIMESTAMP
            WHERE id=$13 RETURNING *
        `, [name, group_leader_id, source, status, destination, parseInt(expected_pax)||0, parseFloat(price_per_pax)||0, departure_date||null, return_date||null, expected_month, parseFloat(total_revenue)||0, assigned_to, id]);

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        await db.query('DELETE FROM group_projects WHERE id=$1', [req.params.id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
