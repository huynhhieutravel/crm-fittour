const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/permCheck');

// GET all mice_leads
router.get('/', auth, async (req, res) => {
    try {
        const query = `
            SELECT l.*, u.full_name as assigned_name
            FROM mice_leads l
            LEFT JOIN users u ON l.assigned_to = u.id
            ORDER BY l.created_at DESC
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST new mice_lead
router.post('/', auth, checkPermission('mice_leads', 'can_create'), async (req, res) => {
    const { name, phone, zalo_name, source, expected_pax, destination, deadline, status, assigned_to, notes, metadata } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO mice_leads (name, phone, zalo_name, source, expected_pax, destination, deadline, status, assigned_to, notes, metadata) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [name, phone, zalo_name, source, expected_pax, destination, deadline, status || 'New', assigned_to || req.user.id, notes, metadata || {}]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT update mice_lead
router.put('/:id', auth, checkPermission('mice_leads', 'can_edit'), async (req, res) => {
    const { id } = req.params;
    const { name, phone, zalo_name, source, expected_pax, destination, deadline, status, assigned_to, notes, metadata, converted_project_id, converted_company_id, converted_leader_id } = req.body;
    try {
        const result = await db.query(
            `UPDATE mice_leads 
             SET name=$1, phone=$2, zalo_name=$3, source=$4, expected_pax=$5, destination=$6, deadline=$7, status=$8, assigned_to=$9, notes=$10, metadata=$11, updated_at=CURRENT_TIMESTAMP,
                 converted_project_id=COALESCE($12, converted_project_id), converted_company_id=COALESCE($13, converted_company_id), converted_leader_id=COALESCE($14, converted_leader_id)
             WHERE id=$15 RETURNING *`,
            [name, phone, zalo_name, source, expected_pax, destination, deadline, status, assigned_to, notes, metadata, converted_project_id, converted_company_id, converted_leader_id, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE mice_lead
router.delete('/:id', auth, checkPermission('mice_leads', 'can_delete'), async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM mice_leads WHERE id=$1 RETURNING id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// CONVERT Endpoint
router.post('/:id/convert', auth, checkPermission('mice_leads', 'can_edit'), async (req, res) => {
    const { id } = req.params;
    const { companyId, companyName, leaderId, leaderName, leaderPhone } = req.body;

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Get Lead
        const leadRes = await client.query('SELECT * FROM mice_leads WHERE id=$1', [id]);
        if (leadRes.rows.length === 0) throw new Error('Lead not found');
        const lead = leadRes.rows[0];

        if (lead.status === 'Converted' || lead.converted_project_id) {
            throw new Error('Lead is already converted');
        }

        // 2. Handle Company
        let finalCompanyId = companyId;
        if (!finalCompanyId && companyName) {
            const newCompany = await client.query(
                'INSERT INTO b2b_companies (name, assigned_to) VALUES ($1, $2) RETURNING id',
                [companyName, req.user.id]
            );
            finalCompanyId = newCompany.rows[0].id;
        }

        // 3. Handle Leader
        let finalLeaderId = leaderId;
        if (!finalLeaderId && leaderName) {
            const newLeader = await client.query(
                'INSERT INTO group_leaders (name, phone, company_id, assigned_to) VALUES ($1, $2, $3, $4) RETURNING id',
                [leaderName, leaderPhone || lead.phone, finalCompanyId, req.user.id]
            );
            finalLeaderId = newLeader.rows[0].id;
        }

        // 4. Create Project
        const newProject = await client.query(
            `INSERT INTO group_projects (name, group_leader_id, expected_pax, destination, assigned_to, source)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [lead.name + ' - Dự án', finalLeaderId, parseInt(lead.expected_pax) || 0, lead.destination, lead.assigned_to || req.user.id, lead.source]
        );
        const projectId = newProject.rows[0].id;

        // 5. Link Project to Company (if linked_company_id exists in schema, otherwise we get it via group_leader_id)
        // Note: group_projects has group_leader_id, and group_leaders has company_id.

        // 6. Update Lead status
        await client.query(
            `UPDATE mice_leads SET status='Converted', converted_project_id=$1, converted_company_id=$2, converted_leader_id=$3 WHERE id=$4`,
            [projectId, finalCompanyId, finalLeaderId, id]
        );

        await client.query('COMMIT');
        res.json({ message: 'Converted successfully', projectId, companyId: finalCompanyId, leaderId: finalLeaderId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: err.message || 'Server error' });
    } finally {
        client.release();
    }
});

module.exports = router;
