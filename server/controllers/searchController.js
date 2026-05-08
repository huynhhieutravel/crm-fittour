const db = require('../db');

// Utility to normalize string (lowercase + unaccent)
const normalize = (str) => {
    if (!str) return '';
    // This client-side normalization helps with frontend cache keying and initial cleanup
    // But we rely on backend q_norm for actual SQL
    return str.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
};

const normalizePhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
};

exports.globalSearch = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json({ results: [] });
        }

        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin' || req.user.role === 'ceo' || req.user.role === 'manager';
        
        // Normalize ONCE here to avoid repeated unaccent(lower()) calls in SQL
        const q_norm = normalize(q);
        const q_phone = normalizePhone(q);
        const hasPhoneDigits = q_phone.length >= 3; // Only search by phone if 3+ digits
        const requestId = Math.random().toString(36).substring(7);

        // Wrapper to handle individual query timeouts
        const queryWithTimeout = (queryPromise, tableName) => {
            return Promise.race([
                queryPromise,
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error(`Timeout searching ${tableName}`)), 500)
                )
            ]).catch(err => {
                console.warn(`[SearchTimeout][${requestId}] Table: ${tableName}`, err.message);
                return { rows: [] };
            });
        };

        const searchPromises = [];

        // 1. Leads Search
        searchPromises.push(queryWithTimeout(db.query(`
            SELECT id, name as title, phone as subtitle, 'lead' as type, '/leads' as path,
            (CASE 
                WHEN name_norm = $1 THEN 3.5
                WHEN $5 AND phone LIKE $2 || '%' THEN 2.5
                WHEN name_norm LIKE $1 || '%' THEN 2.0 + similarity(name_norm, $1) * 0.1
                ELSE similarity(name_norm, $1)
            END) as search_score
            FROM leads
            WHERE (name_norm LIKE $1 || '%' OR name_norm % $1 OR ($5 AND phone LIKE $2 || '%'))
            AND ($3 OR assigned_to = $4)
            ORDER BY search_score DESC LIMIT 10
        `, [q_norm, q_phone, isAdmin, userId, hasPhoneDigits]), 'leads'));

        // 2. Customers Search
        searchPromises.push(queryWithTimeout(db.query(`
            SELECT id, name as title, phone as subtitle, 'customer' as type, '/customers' as path,
            (CASE 
                WHEN name_norm = $1 THEN 3.5
                WHEN $5 AND phone LIKE $2 || '%' THEN 2.5
                WHEN name_norm LIKE $1 || '%' THEN 2.0 + similarity(name_norm, $1) * 0.1
                ELSE similarity(name_norm, $1)
            END) as search_score
            FROM customers
            WHERE (name_norm LIKE $1 || '%' OR name_norm % $1 OR ($5 AND phone LIKE $2 || '%'))
            AND ($3 OR assigned_to = $4)
            ORDER BY search_score DESC LIMIT 10
        `, [q_norm, q_phone, isAdmin, userId, hasPhoneDigits]), 'customers'));

        // 3. Tour Templates
        searchPromises.push(queryWithTimeout(db.query(`
            SELECT id, name as title, 'Chương trình Tour' as subtitle, 'tour' as type, '/tours' as path,
            (CASE 
                WHEN name_norm = $1 THEN 3.5
                WHEN name_norm LIKE $1 || '%' THEN 2.0 + similarity(name_norm, $1) * 0.1
                ELSE similarity(name_norm, $1)
            END) as search_score
            FROM tour_templates
            WHERE (name_norm LIKE $1 || '%' OR name_norm % $1)
            ORDER BY search_score DESC LIMIT 8
        `, [q_norm]), 'tours'));

        // 4. Bookings
        searchPromises.push(queryWithTimeout(db.query(`
            SELECT b.id, b.booking_code as title, COALESCE(c.name, b.group_name) as subtitle, 'booking' as type, '/bookings' as path,
            (CASE 
                WHEN b.booking_code ILIKE $1 || '%' THEN 3.5
                WHEN b.name_norm LIKE $1 || '%' THEN 2.5
                ELSE similarity(b.name_norm, $1)
            END) as search_score
            FROM bookings b
            LEFT JOIN customers c ON b.customer_id = c.id
            WHERE (b.booking_code ILIKE $1 || '%' OR b.name_norm % $1)
            ORDER BY search_score DESC LIMIT 8
        `, [q_norm]), 'bookings'));


        // 5. Guides
        searchPromises.push(queryWithTimeout(db.query(`
            SELECT id, name as title, phone as subtitle, 'guide' as type, '/guides' as path,
            (CASE 
                WHEN name_norm = $1 THEN 3.5
                WHEN $3 AND phone LIKE $2 || '%' THEN 2.5
                WHEN name_norm LIKE $1 || '%' THEN 2.0 + similarity(name_norm, $1) * 0.1
                ELSE similarity(name_norm, $1)
            END) as search_score
            FROM guides
            WHERE (name_norm LIKE $1 || '%' OR name_norm % $1 OR ($3 AND phone LIKE $2 || '%'))
            ORDER BY search_score DESC LIMIT 5
        `, [q_norm, q_phone, hasPhoneDigits]), 'guides'));

        // 6. Customer Reviews
        searchPromises.push(queryWithTimeout(db.query(`
            SELECT id, reviewer_name as title, comment as subtitle, 'review' as type, '/customer-reviews' as path,
            (CASE 
                WHEN name_norm = $1 THEN 3.5
                WHEN name_norm LIKE $1 || '%' THEN 2.0 + similarity(name_norm, $1) * 0.1
                ELSE similarity(name_norm, $1)
            END) as search_score
            FROM customer_reviews
            WHERE (name_norm LIKE $1 || '%' OR name_norm % $1)
            ORDER BY search_score DESC LIMIT 5
        `, [q_norm]), 'customer_reviews'));


        const results = await Promise.all(searchPromises);
        
        // Merge and Global Rank
        let merged = results.flatMap(r => r.rows);
        merged.sort((a, b) => b.search_score - a.search_score);

        res.json({ results: merged.slice(0, 15) });

    } catch (err) {
        console.error('Global search error:', err);
        res.status(500).json({ error: 'Search failed' });
    }
};
