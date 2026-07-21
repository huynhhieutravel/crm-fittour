const db = require('../db');

exports.getWeeklySchedule = async (req, res) => {
    try {
        const { year, weekNumber } = req.query;
        if (!year || !weekNumber) {
            return res.status(400).json({ message: 'Missing year or weekNumber' });
        }

        // Get responsible BU
        const respRes = await db.query(
            'SELECT bu_group FROM dispatch_weekly_responsibilities WHERE year = $1 AND week_number = $2',
            [year, weekNumber]
        );
        const responsibleBU = respRes.rows.length > 0 ? respRes.rows[0].bu_group : null;

        // Get schedules for that week (date calculation handled by frontend sending start/end dates, but let's accept startDate and endDate instead)
        // Wait, it's easier to just pass startDate and endDate
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Missing startDate or endDate' });
        }

        const schedulesRes = await db.query(`
            SELECT ds.*, ds.date::text as date
            FROM dispatch_schedules ds
            WHERE ds.date >= $1 AND ds.date <= $2
        `, [startDate, endDate]);

        res.json({
            responsibleBU,
            schedules: schedulesRes.rows
        });
    } catch (err) {
        console.error('getWeeklySchedule Error:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.setResponsibleBU = async (req, res) => {
    try {
        const { year, weekNumber, buGroup } = req.body;
        if (!year || !weekNumber) {
            return res.status(400).json({ message: 'Missing year or weekNumber' });
        }

        if (!buGroup) {
            await db.query('DELETE FROM dispatch_weekly_responsibilities WHERE year = $1 AND week_number = $2', [year, weekNumber]);
        } else {
            await db.query(`
                INSERT INTO dispatch_weekly_responsibilities (year, week_number, bu_group, updated_at)
                VALUES ($1, $2, $3, NOW())
                ON CONFLICT (year, week_number) 
                DO UPDATE SET bu_group = EXCLUDED.bu_group, updated_at = NOW()
            `, [year, weekNumber, buGroup]);
        }
        
        res.json({ message: 'Cập nhật BU chịu trách nhiệm thành công' });
    } catch (err) {
        console.error('setResponsibleBU Error:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.saveSchedule = async (req, res) => {
    try {
        const { date, shiftType, buGroup, userIds } = req.body;
        if (!date || !shiftType) {
            return res.status(400).json({ message: 'Missing date or shiftType' });
        }

        const isUserIdsEmpty = !userIds || !Array.isArray(userIds) || userIds.length === 0;

        if (isUserIdsEmpty && !buGroup) {
            // Delete the schedule for this slot
            await db.query('DELETE FROM dispatch_schedules WHERE date = $1 AND shift_type = $2', [date, shiftType]);
        } else {
            // Insert or Update
            await db.query(`
                INSERT INTO dispatch_schedules (date, shift_type, bu_group, user_ids, updated_at)
                VALUES ($1, $2, $3, $4, NOW())
                ON CONFLICT (date, shift_type)
                DO UPDATE SET bu_group = EXCLUDED.bu_group, user_ids = EXCLUDED.user_ids, updated_at = NOW()
            `, [date, shiftType, buGroup || null, isUserIdsEmpty ? '[]' : JSON.stringify(userIds)]);
        }

        res.json({ message: 'Lưu ca trực thành công' });
    } catch (err) {
        console.error('saveSchedule Error:', err);
        res.status(500).json({ message: err.message });
    }
};
