const { AsyncLocalStorage } = require('async_hooks');
const db = require('../db');

const asyncLocalStorage = new AsyncLocalStorage();

function getCorrelationId() {
    return asyncLocalStorage.getStore();
}

function patchConsole() {
    if (globalThis.__correlationConsolePatched) {
        return;
    }
    
    globalThis.__correlationConsolePatched = true;

    const methods = ['log', 'error', 'warn', 'info', 'debug'];

    methods.forEach((method) => {
        const originalMethod = console[method];
        
        console[method] = function (...args) {
            const correlationId = getCorrelationId();
            
            if (correlationId) {
                const tracePrefix = `[Trace: ${correlationId}]`;
                
                // If first arg is a string and already contains the exact trace prefix, don't duplicate
                if (args.length > 0 && typeof args[0] === 'string') {
                    if (args[0].includes(tracePrefix)) {
                        return originalMethod.apply(console, args);
                    }
                    args[0] = `${tracePrefix} ${args[0]}`;
                    return originalMethod.apply(console, args);
                }
                
                // Prepend the trace prefix to the arguments array if first arg is not string
                return originalMethod.apply(console, [tracePrefix, ...args]);
            }
            
            // If no context, just log normally
            return originalMethod.apply(console, args);
        };
    });
}

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

module.exports = {
    asyncLocalStorage,
    getCorrelationId,
    patchConsole,
    logActivity
};
