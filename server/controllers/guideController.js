const db = require('../db');

exports.getAllGuides = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT g.*, 
                   COUNT(td.id)::int as total_tours,
                   (
                       SELECT json_build_object('name', tt.name, 'start_date', td2.start_date, 'end_date', td2.end_date, 'status', td2.status)
                       FROM tour_departures td2
                       JOIN tour_templates tt ON td2.tour_template_id = tt.id
                       WHERE td2.guide_id = g.id AND td2.end_date >= CURRENT_DATE
                       ORDER BY td2.start_date ASC
                       LIMIT 1
                   ) as next_tour
            FROM guides g
            LEFT JOIN tour_departures td ON g.id = td.guide_id
            GROUP BY g.id
            ORDER BY g.name ASC;
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Lỗi lấy Guides:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.createGuide = async (req, res) => {
    const { name, phone, email, languages, rating, status, experience, bio, specialties, avatar_url, dob, address, gender, passport } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO guides (name, phone, email, languages, rating, status, experience, bio, specialties, avatar_url, dob, address, gender, passport) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *',
            [
                name, phone, email, languages, 
                rating || 5, 
                status || 'Active', 
                parseInt(experience) || 0, 
                bio, specialties, avatar_url, 
                (dob && dob.trim() !== '') ? dob : null, 
                address,
                gender,
                passport
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Create Guide Error:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.getGuideById = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM guides WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy hướng dẫn viên' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateGuide = async (req, res) => {
    const { name, phone, email, languages, rating, status, experience, bio, specialties, avatar_url, dob, address, gender, passport } = req.body;
    try {
        const result = await db.query(
            'UPDATE guides SET name=$1, phone=$2, email=$3, languages=$4, rating=$5, status=$6, experience=$7, bio=$8, specialties=$9, avatar_url=$10, dob=$11, address=$12, gender=$13, passport=$14 WHERE id=$15 RETURNING *',
            [
                name, phone, email, languages || '', 
                rating || null, 
                status || 'Active', 
                parseInt(experience) || 0, 
                bio || '', specialties || '', avatar_url || '', 
                (dob && dob.trim() !== '') ? dob : null, 
                address || '', 
                gender,
                passport,
                req.params.id
            ]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy hướng dẫn viên' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Update Guide Error:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.getGuideTimeline = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                g.id as guide_id, g.name as guide_name, g.status as guide_status,
                td.id as departure_id, td.start_date, td.end_date, td.status as departure_status,
                tt.name as tour_name
            FROM guides g
            LEFT JOIN tour_departures td ON g.id = td.guide_id
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            ORDER BY g.name ASC, td.start_date ASC
        `);

        // Format data: group by guide
        const timeline = [];
        const guidesMap = {};

        result.rows.forEach(row => {
            if (!guidesMap[row.guide_id]) {
                guidesMap[row.guide_id] = {
                    id: row.guide_id,
                    name: row.guide_name,
                    status: row.guide_status,
                    assignments: []
                };
                timeline.push(guidesMap[row.guide_id]);
            }
            if (row.departure_id) {
                guidesMap[row.guide_id].assignments.push({
                    id: row.departure_id,
                    start: row.start_date,
                    end: row.end_date,
                    tourName: row.tour_name,
                    status: row.departure_status
                });
            }
        });

        res.json(timeline);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteGuide = async (req, res) => {
    try {
        // Kiểm tra HDV đang gắn với bao nhiêu lịch khởi hành
        const deps = await db.query('SELECT COUNT(*)::int as count FROM tour_departures WHERE guide_id = $1', [req.params.id]);
        const depCount = deps.rows[0].count;
        
        // Nếu có tour gắn VÀ client chưa xác nhận force=true → cảnh báo
        if (depCount > 0 && req.query.force !== 'true') {
            return res.status(409).json({ 
                message: `HDV này đang gắn với ${depCount} lịch khởi hành. Xóa sẽ hủy liên kết HDV khỏi các tour đó.`,
                has_deps: true,
                dep_count: depCount
            });
        }
        
        const result = await db.query('DELETE FROM guides WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy hướng dẫn viên' });
        res.json({ message: 'Đã xoá hướng dẫn viên thành công' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

