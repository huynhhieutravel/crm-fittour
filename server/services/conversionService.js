const db = require('../db');
const { logActivity } = require('../utils/logger');

/**
 * Unified logic to convert a Lead to a Customer
 * @param {Object} client - DB client (for transactions)
 * @param {number} leadId - ID of the lead
 * @param {number} [userId] - ID of the user performing action
 * @returns {Promise<Object>} The created/updated customer
 */
async function convertLeadToCustomer(client, leadId, userId) {
    // 1. Fetch lead info
    const leadRes = await client.query('SELECT * FROM leads WHERE id = $1', [leadId]);
    if (leadRes.rows.length === 0) throw new Error('Không tìm thấy lead');
    const lead = leadRes.rows[0];

    // 2. Normalize data
    const normalizedName = lead.name ? lead.name.toUpperCase().trim() : '';
    
    // 3. Check if customer already exists for this lead or phone
    const existingRes = await client.query(
        'SELECT id FROM customers WHERE lead_id = $1 OR (phone IS NOT NULL AND phone != \'\' AND phone = $2)',
        [leadId, lead.phone]
    );

    let customer;
    if (existingRes.rows.length > 0) {
        // Update existing customer WITHOUT overwriting original lead_id
        const res = await client.query(
            `UPDATE customers SET 
                name = $1, email = $2, gender = $3, birth_date = $4, 
                nationality = COALESCE(nationality, $5),
                facebook_psid = COALESCE(facebook_psid, $6)
             WHERE id = $7 RETURNING *`,
            [
                normalizedName, 
                lead.email, 
                lead.gender, 
                lead.birth_date, 
                lead.nationality || 'Việt Nam', 
                lead.facebook_psid || null,
                existingRes.rows[0].id
            ]
        );
        customer = res.rows[0];
        customer.was_existing_customer = true;
    } else {
        // Create new customer
        const res = await client.query(
            `INSERT INTO customers (
                name, phone, email, gender, birth_date, lead_id, 
                notes, preferred_contact, nationality, role, 
                customer_segment, first_deal_date, assigned_to, facebook_psid
            ) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
            [
                normalizedName, 
                lead.phone, 
                lead.email, 
                lead.gender, 
                lead.birth_date, 
                lead.id,
                `Chuyển đổi từ Lead. Ghi chú tư vấn: ${lead.consultation_note || ''}`,
                lead.source,
                lead.nationality || 'Việt Nam',
                'Người đại diện',
                'New Customer',
                new Date(), // first_deal_date
                lead.assigned_to, // assigned_to (Sales staff)
                lead.facebook_psid || null
            ]
        );
        customer = res.rows[0];
    }

    // 4. Link lead_notes to the customer
    await client.query('UPDATE lead_notes SET customer_id = $1 WHERE lead_id = $2', [customer.id, leadId]);

    // 5. Update Lead Status to 'Chốt đơn' if not already
    await client.query('UPDATE leads SET status = \'Chốt đơn\', won_at = COALESCE(won_at, NOW()) WHERE id = $1', [leadId]);

    // 6. Log activity
    await logActivity({
        user_id: userId,
        action_type: 'CONVERT',
        entity_type: 'LEAD',
        entity_id: leadId,
        details: `Converted lead "${lead.name}" to customer "${customer.name}"`,
        new_data: { customer_id: customer.id }
    });

    return customer;
}

module.exports = { convertLeadToCustomer };
