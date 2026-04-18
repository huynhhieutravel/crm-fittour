const db = require('../db');

async function up() {
    console.log('Running migration: create leave management tables');
    
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS leave_balances (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                year INTEGER NOT NULL,
                total_days DECIMAL(4,1) DEFAULT 12.0,
                used_days DECIMAL(4,1) DEFAULT 0.0,
                UNIQUE(user_id, year)
            );
        `);
        console.log('Created leave_balances table.');
    } catch (e) {
        console.log('Error creating leave_balances:', e.message);
    }

    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS leave_requests (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                leave_type VARCHAR(50) NOT NULL,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                total_days DECIMAL(4,1) NOT NULL,
                reason TEXT,
                contact_phone VARCHAR(50),
                handover_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                handover_note TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                approved_at TIMESTAMP WITHOUT TIME ZONE,
                reject_reason TEXT,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Created leave_requests table.');
    } catch (e) {
        console.log('Error creating leave_requests:', e.message);
    }

    try {
        await db.query(`
            CREATE OR REPLACE FUNCTION update_leave_used_days()
            RETURNS TRIGGER AS $$
            BEGIN
                IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
                    UPDATE leave_balances
                    SET used_days = used_days + NEW.total_days
                    WHERE user_id = NEW.user_id AND year = EXTRACT(YEAR FROM NEW.start_date);
                ELSIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
                    UPDATE leave_balances
                    SET used_days = GREATEST(used_days - OLD.total_days, 0)
                    WHERE user_id = OLD.user_id AND year = EXTRACT(YEAR FROM OLD.start_date);
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS trigger_update_leave_balance ON leave_requests;
            CREATE TRIGGER trigger_update_leave_balance
            AFTER UPDATE ON leave_requests
            FOR EACH ROW
            EXECUTE FUNCTION update_leave_used_days();
        `);
        console.log('Created trigger for automatic balance deduction.');
    } catch (e) {
        console.log('Error creating balance trigger:', e.message);
    }

    // Auto-seed balances for current users for this year if missing
    try {
        await db.query(`
            INSERT INTO leave_balances (user_id, year, total_days, used_days)
            SELECT id, EXTRACT(YEAR FROM CURRENT_DATE), 12.0, 0.0
            FROM users
            WHERE is_active = true
            ON CONFLICT (user_id, year) DO NOTHING;
        `);
        console.log('Seeded leave_balances for current users.');
    } catch (e) {
        console.log('Error seeding balances:', e.message);
    }

    console.log('Migration completed.');
}

if (require.main === module) {
    up().then(() => process.exit(0)).catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = { up };
