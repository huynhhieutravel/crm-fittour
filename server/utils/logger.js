const db = require('../db');

/**
 * Log an activity to the database
 * @param {Object} params
 * @param {number} params.user_id - ID of the user performing the action
 * @param {string} params.action_type - 'CREATE', 'UPDATE', 'DELETE', 'CONVERT'
 * @param {string} params.entity_type - 'LEAD', 'CUSTOMER', 'BOOKING'
 * @param {number} params.entity_id - ID of the record being acted upon
 * @param {string} [params.details] - Optional description
 * @param {Object} [params.old_data] - Optional JSON of old state
 * @param {Object} [params.new_data] - Optional JSON of new state
 */
async function logActivity({ user_id, action_type, entity_type, entity_id, details, old_data, new_data }) {
    try {
        await db.query(
            `INSERT INTO activity_logs (user_id, action_type, entity_type, entity_id, details, old_data, new_data) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [user_id || null, action_type, entity_type, entity_id, details || null, old_data || null, new_data || null]
        );
    } catch (err) {
        console.error('FAILED TO LOG ACTIVITY:', err.message);
        // We don't throw here to avoid failing the main request if logging fails
    }
}

module.exports = { logActivity };
