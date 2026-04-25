const db = require('../db');

exports.getAllTours = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT tt.*, 
                   (SELECT COUNT(*) FROM tour_departures td WHERE td.tour_template_id = tt.id) as departures_count
            FROM tour_templates tt 
            ORDER BY COALESCE(tt.is_active, true) DESC, tt.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createTour = async (req, res) => {
    const { 
        name, destination, duration, price, max_pax, start_date, 
        description, tour_type, tags, highlights, inclusions, 
        exclusions, base_price, internal_cost, expected_margin, 
        schedule_link, code, bu_group, image_url, website_link, is_active
    } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO tour_templates (
                name, destination, duration, price, max_pax, start_date, 
                description, tour_type, tags, highlights, inclusions, 
                exclusions, base_price, internal_cost, expected_margin, 
                schedule_link, code, bu_group, image_url, website_link, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, COALESCE($21, true)) 
            RETURNING *`,
            [
                name, destination, duration, price || 0, max_pax || 0, start_date || null, 
                description, tour_type, 
                typeof tags === 'object' ? JSON.stringify(tags) : tags, 
                typeof highlights === 'object' ? JSON.stringify(highlights) : highlights, 
                typeof inclusions === 'object' ? JSON.stringify(inclusions) : inclusions, 
                typeof exclusions === 'object' ? JSON.stringify(exclusions) : exclusions, 
                base_price || 0, internal_cost || 0, expected_margin || 0, 
                schedule_link, code, bu_group, image_url, website_link, is_active
            ]
        );
        
        const newTour = result.rows[0];

        // Background Meta Sync đã được gỡ bỏ theo yêu cầu của user. 
        // Sync sẽ chỉ diễn ra thủ công thông qua nút Đồng bộ Toàn bộ ở Cài đặt.

        res.status(201).json(newTour);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getTourById = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM tour_templates WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy tour' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateTour = async (req, res) => {
    const { 
        name, destination, duration, price, max_pax, start_date, description, status,
        tour_type, tags, itinerary, highlights, inclusions, exclusions,
        base_price, internal_cost, expected_margin, schedule_link, code, bu_group,
        image_url, website_link, is_active
    } = req.body;
    try {
        const result = await db.query(
            `UPDATE tour_templates SET 
                name=$1, destination=$2, duration=$3, price=$4, max_pax=$5, 
                start_date=$6, description=$7, status=$8, tour_type=$9, tags=$10, 
                itinerary=$11, highlights=$12, inclusions=$13, exclusions=$14, 
                base_price=$15, internal_cost=$16, expected_margin=$17, schedule_link=$18, code=$19, bu_group=$20, image_url=$21, website_link=$22, is_active=COALESCE($23, is_active)
            WHERE id=$24 RETURNING *`,
            [
                name, destination, duration, price || base_price, max_pax, 
                start_date || null, description, status, tour_type, 
                typeof tags === 'object' ? JSON.stringify(tags) : tags, 
                typeof itinerary === 'object' ? JSON.stringify(itinerary) : itinerary, 
                typeof highlights === 'object' ? JSON.stringify(highlights) : highlights, 
                typeof inclusions === 'object' ? JSON.stringify(inclusions) : inclusions, 
                typeof exclusions === 'object' ? JSON.stringify(exclusions) : exclusions, 
                base_price || price, internal_cost, expected_margin, schedule_link, code, bu_group, image_url, website_link, is_active, req.params.id
            ]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy tour' });
        
        const updatedTour = result.rows[0];

        // Background Meta Sync đã được gỡ bỏ theo yêu cầu.

        res.json(updatedTour);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteTour = async (req, res) => {
    try {
        const tourId = req.params.id;

        // FK Guard: Check tour_departures
        const depsCount = await db.query('SELECT COUNT(*)::int as c FROM tour_departures WHERE tour_template_id = $1', [tourId]);
        if (depsCount.rows[0].c > 0) {
            return res.status(409).json({
                message: `Tour này đang có ${depsCount.rows[0].c} lịch khởi hành. Vui lòng xóa các lịch khởi hành trước.`,
                has_deps: true
            });
        }

        // FK Guard: Check leads referencing this tour
        const leadsCount = await db.query('SELECT COUNT(*)::int as c FROM leads WHERE tour_id = $1', [tourId]);
        if (leadsCount.rows[0].c > 0) {
            return res.status(409).json({
                message: `Tour này đang có ${leadsCount.rows[0].c} Lead liên kết. Vui lòng hủy liên kết Lead với Tour trước khi xóa.`,
                has_leads: true
            });
        }

        const result = await db.query('DELETE FROM tour_templates WHERE id = $1 RETURNING *', [tourId]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy tour' });
        res.json({ message: 'Đã xoá tour thành công' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.bulkDeleteTours = async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'Không có ID nào được gửi' });

    try {
        let successCount = 0, failDepsCount = 0, failLeadsCount = 0;
        for (const tourId of ids) {
            const depsCount = await db.query('SELECT COUNT(*)::int as c FROM tour_departures WHERE tour_template_id = $1', [tourId]);
            if (depsCount.rows[0].c > 0) {
                failDepsCount++;
                continue;
            }
            const leadsCount = await db.query('SELECT COUNT(*)::int as c FROM leads WHERE tour_id = $1', [tourId]);
            if (leadsCount.rows[0].c > 0) {
                failLeadsCount++;
                continue;
            }
            const result = await db.query('DELETE FROM tour_templates WHERE id = $1', [tourId]);
            if (result.rowCount > 0) successCount++;
        }
        let msg = `Đã xóa ${successCount} sản phẩm tour.`;
        if (failDepsCount > 0) msg += ` Bỏ qua ${failDepsCount} tour vì đang có Lịch Khởi Hành.`;
        if (failLeadsCount > 0) msg += ` Bỏ qua ${failLeadsCount} tour vì có Lead liên kết.`;
        res.json({ message: msg });
    } catch (error) {
        console.error('Error in bulkDeleteTours:', error);
        res.status(500).json({ error: 'Lỗi khi xóa hàng loạt' });
    }
};

exports.getTourNotes = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT tn.*, u.username as creator_name 
             FROM tour_notes tn 
             LEFT JOIN users u ON tn.created_by = u.id 
             WHERE tn.tour_id = $1 
             ORDER BY tn.created_at DESC`,
            [req.params.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addTourNote = async (req, res) => {
    const { tour_id, content } = req.body;
    const created_by = req.user?.id;
    try {
        const result = await db.query(
            'INSERT INTO tour_notes (tour_id, content, created_by) VALUES ($1, $2, $3) RETURNING *',
            [tour_id, content, created_by]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
