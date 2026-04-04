const db = require('../db');
const { logActivity } = require('../utils/logger');

// === HOTELS ===
exports.getHotels = async (req, res) => {
    try {
        const { search, province, star_rate, market } = req.query;
        let query = 'SELECT * FROM hotels WHERE 1=1';
        let params = [];
        let paramIndex = 1;

        if (search) {
            query += ` AND (name ILIKE $${paramIndex} OR code ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        if (market) {
            query += ` AND market = $${paramIndex}`;
            params.push(market);
            paramIndex++;
        }
        if (province) {
            query += ` AND province = $${paramIndex}`;
            params.push(province);
            paramIndex++;
        }
        if (star_rate) {
            query += ` AND star_rate = $${paramIndex}`;
            params.push(star_rate);
            paramIndex++;
        }

        query += ' ORDER BY id DESC';
        console.log("Executing query:", query, "with params:", params);
        const result = await db.query(query, params);
        console.log("Returned hotels count:", result.rows.length);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

exports.getHotelDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const hotelRes = await db.query('SELECT * FROM hotels WHERE id = $1', [id]);
        if (hotelRes.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy khách sạn' });
        const hotel = hotelRes.rows[0];

        const contactsRes = await db.query('SELECT * FROM hotel_contacts WHERE hotel_id = $1 ORDER BY id ASC', [id]);
        const roomTypesRes = await db.query('SELECT * FROM hotel_room_types WHERE hotel_id = $1 ORDER BY id ASC', [id]);
        const contractsRes = await db.query('SELECT * FROM hotel_contracts WHERE hotel_id = $1 ORDER BY valid_from DESC', [id]);
        
        // Fetch all rates for this hotel (joined with contracts)
        const ratesRes = await db.query(`
            SELECT r.* 
            FROM hotel_contract_rates r
            JOIN hotel_contracts c ON r.contract_id = c.id
            WHERE c.hotel_id = $1
        `, [id]);

        const allotmentsRes = await db.query('SELECT * FROM hotel_allotments WHERE hotel_id = $1 ORDER BY start_date DESC', [id]);

        hotel.contacts = contactsRes.rows;
        hotel.room_types = roomTypesRes.rows;
        hotel.contracts = contractsRes.rows;
        hotel.allotments = allotmentsRes.rows;
        
        // Attach rates to contracts
        hotel.contracts.forEach(contract => {
            contract.rates = ratesRes.rows.filter(r => r.contract_id === contract.id);
        });

        res.json(hotel);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

exports.createHotel = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { 
            code, name, tax_id, build_year, phone, email, country, province, 
            address, notes, star_rate, website, hotel_class, project_name, 
            bank_account_name, bank_account_number, bank_name, market,
            contacts, services, allotments
        } = req.body;

        await client.query('BEGIN');

        const result = await client.query(
            `INSERT INTO hotels (
                code, name, tax_id, build_year, phone, email, country, province, 
                address, notes, star_rate, website, hotel_class, project_name, 
                bank_account_name, bank_account_number, bank_name, market
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *`,
            [code, name, tax_id, build_year, phone, email, country, province, address, notes, star_rate, website, hotel_class, project_name, bank_account_name, bank_account_number, bank_name, market]
        );
        const newHotelId = result.rows[0].id;

        // Xử lý Contacts
        if (contacts && Array.isArray(contacts)) {
            for (const c of contacts) {
                await client.query(
                    'INSERT INTO hotel_contacts (hotel_id, name, position, dob, phone, email) VALUES ($1, $2, $3, $4, $5, $6)',
                    [newHotelId, c.name, c.position, c.dob || null, c.phone, c.email]
                );
            }
        }

        // Tạo 1 Hợp Đồng chung tĩnh (Vì form nhập cũ không có khái niệm tạo nhiều hợp đồng riêng)
        let defaultContractId = null;
        if ((services && services.length > 0) || (allotments && allotments.length > 0)) {
            const contractRes = await client.query(
                `INSERT INTO hotel_contracts (hotel_id, contract_name, status) VALUES ($1, $2, $3) RETURNING id`,
                [newHotelId, 'Hợp đồng Hệ thống mặc định', 'active']
            );
            defaultContractId = contractRes.rows[0].id;
        }

        // Xử lý Services (Phòng + Giá)
        if (services && Array.isArray(services)) {
            for (const s of services) {
                // Upsert Room Type by SKU
                let roomRes = await client.query('SELECT id FROM hotel_room_types WHERE hotel_id = $1 AND sku = $2', [newHotelId, s.sku || 'N/A']);
                let roomId;
                if (roomRes.rows.length === 0) {
                    const insertRoom = await client.query(
                        'INSERT INTO hotel_room_types (hotel_id, sku, name) VALUES ($1, $2, $3) RETURNING id',
                        [newHotelId, s.sku || 'N/A', s.name || 'Dịch vụ chưa đặt tên']
                    );
                    roomId = insertRoom.rows[0].id;
                } else {
                    roomId = roomRes.rows[0].id;
                }

                await client.query(
                    `INSERT INTO hotel_contract_rates 
                    (contract_id, room_type_id, start_date, end_date, day_type, contract_price, net_price, sell_price, description, notes) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                    [defaultContractId, roomId, s.start_date || new Date(), s.end_date || new Date(), s.day_type || 'Ngày thường', s.contract_price || 0, s.net_price || 0, s.sell_price || 0, s.description, s.notes]
                );
            }
        }

        // Xử lý Allotments
        if (allotments && Array.isArray(allotments)) {
            for (const a of allotments) {
                let roomRes = await client.query('SELECT id FROM hotel_room_types WHERE hotel_id = $1 AND sku = $2', [newHotelId, a.sku || 'N/A']);
                let roomId;
                if (roomRes.rows.length === 0) {
                    const insertRoom = await client.query(
                        'INSERT INTO hotel_room_types (hotel_id, sku, name) VALUES ($1, $2, $3) RETURNING id',
                        [newHotelId, a.sku || 'N/A', a.name || 'Dịch vụ chưa đặt tên']
                    );
                    roomId = insertRoom.rows[0].id;
                } else {
                    roomId = roomRes.rows[0].id;
                }

                await client.query(
                    `INSERT INTO hotel_allotments 
                    (hotel_id, room_type_id, start_date, end_date, day_type, allotment_count, cut_off_days, net_price, sell_price, description, notes) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                    [newHotelId, roomId, a.start_date || new Date(), a.end_date || new Date(), a.day_type || 'Ngày thường', a.allotment_count || 0, a.cut_off_days || 0, a.net_price || 0, a.sell_price || 0, a.description, a.notes]
                );
            }
        }

        await client.query('COMMIT');

        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'CREATE',
                entity_type: 'HOTEL',
                entity_id: newHotelId,
                details: `Đã thêm mới Khách sạn: ${name}`
            });
        }

        res.status(201).json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        if (err.code === '23505') {
            return res.status(400).json({ message: 'Mã Nhà cung cấp đã tồn tại!' });
        }
        console.error(err);
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
};

exports.updateHotel = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { id } = req.params;
        const { 
            code, name, tax_id, build_year, phone, email, country, province, 
            address, notes, star_rate, website, hotel_class, project_name, 
            bank_account_name, bank_account_number, bank_name, market,
            contacts, services, allotments
        } = req.body;

        await client.query('BEGIN');

        const result = await client.query(
            `UPDATE hotels SET 
                code=$1, name=$2, tax_id=$3, build_year=$4, phone=$5, email=$6, country=$7, province=$8, 
                address=$9, notes=$10, star_rate=$11, website=$12, hotel_class=$13, project_name=$14, 
                bank_account_name=$15, bank_account_number=$16, bank_name=$17, market=$18, updated_at=CURRENT_TIMESTAMP
            WHERE id=$19 RETURNING *`,
            [code, name, tax_id, build_year, phone, email, country, province, address, notes, star_rate, website, hotel_class, project_name, bank_account_name, bank_account_number, bank_name, market, id]
        );

        // Update Contacts (Xóa cũ, Thêm mới)
        if (contacts !== undefined) {
            await client.query('DELETE FROM hotel_contacts WHERE hotel_id = $1', [id]);
            for (const c of contacts) {
                if (c.name && c.name.trim() !== '') {
                    await client.query(
                        'INSERT INTO hotel_contacts (hotel_id, name, position, dob, phone, email) VALUES ($1, $2, $3, $4, $5, $6)',
                        [id, c.name, c.position, c.dob || null, c.phone, c.email]
                    );
                }
            }
        }

        // Lấy hoặc tạo Default Contract
        let contractRes = await client.query("SELECT id FROM hotel_contracts WHERE hotel_id = $1 AND contract_name = 'Hợp đồng Hệ thống mặc định'", [id]);
        let defaultContractId;
        if (contractRes.rows.length === 0) {
            const insertCont = await client.query(
                `INSERT INTO hotel_contracts (hotel_id, contract_name, status) VALUES ($1, $2, $3) RETURNING id`,
                [id, 'Hợp đồng Hệ thống mặc định', 'active']
            );
            defaultContractId = insertCont.rows[0].id;
        } else {
            defaultContractId = contractRes.rows[0].id;
        }

        // Update Services
        if (services !== undefined) {
            await client.query('DELETE FROM hotel_contract_rates WHERE contract_id = $1', [defaultContractId]);
            for (const s of services) {
                if (!s.name && !s.sku) continue; // Skip empty rows
                
                let roomRes = await client.query('SELECT id FROM hotel_room_types WHERE hotel_id = $1 AND sku = $2', [id, s.sku || 'N/A']);
                let roomId;
                if (roomRes.rows.length === 0) {
                    const insertRoom = await client.query(
                        'INSERT INTO hotel_room_types (hotel_id, sku, name) VALUES ($1, $2, $3) RETURNING id',
                        [id, s.sku || 'N/A', s.name || 'Dịch vụ chưa đặt tên']
                    );
                    roomId = insertRoom.rows[0].id;
                } else {
                    roomId = roomRes.rows[0].id;
                    // Update name in case changed
                    await client.query('UPDATE hotel_room_types SET name = $1 WHERE id = $2', [s.name, roomId]);
                }

                await client.query(
                    `INSERT INTO hotel_contract_rates 
                    (contract_id, room_type_id, start_date, end_date, day_type, contract_price, net_price, sell_price, description, notes) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                    [defaultContractId, roomId, s.start_date || new Date(), s.end_date || new Date(), s.day_type || 'Ngày thường', s.contract_price || 0, s.net_price || 0, s.sell_price || 0, s.description, s.notes]
                );
            }
        }

        // Update Allotments
        if (allotments !== undefined) {
            await client.query('DELETE FROM hotel_allotments WHERE hotel_id = $1', [id]);
            for (const a of allotments) {
                if (!a.name && !a.sku) continue; 

                let roomRes = await client.query('SELECT id FROM hotel_room_types WHERE hotel_id = $1 AND sku = $2', [id, a.sku || 'N/A']);
                let roomId;
                if (roomRes.rows.length === 0) {
                    const insertRoom = await client.query(
                        'INSERT INTO hotel_room_types (hotel_id, sku, name) VALUES ($1, $2, $3) RETURNING id',
                        [id, a.sku || 'N/A', a.name || 'Dịch vụ chưa đặt tên']
                    );
                    roomId = insertRoom.rows[0].id;
                } else {
                    roomId = roomRes.rows[0].id;
                }

                await client.query(
                    `INSERT INTO hotel_allotments 
                    (hotel_id, room_type_id, start_date, end_date, day_type, allotment_count, cut_off_days, net_price, sell_price, description, notes) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                    [id, roomId, a.start_date || new Date(), a.end_date || new Date(), a.day_type || 'Ngày thường', a.allotment_count || 0, a.cut_off_days || 0, a.net_price || 0, a.sell_price || 0, a.description, a.notes]
                );
            }
        }

        await client.query('COMMIT');

        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'UPDATE',
                entity_type: 'HOTEL',
                entity_id: id,
                details: `Cập nhật thông tin Khách sạn & Bảng giá: ${name}`
            });
        }

        res.json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
};

exports.deleteHotel = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM hotels WHERE id = $1', [id]);
        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'DELETE',
                entity_type: 'HOTEL',
                entity_id: id,
                details: `Xóa Khách sạn ID ${id}`
            });
        }
        res.json({ message: 'Xóa thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// === CONTACTS ===
exports.createContact = async (req, res) => {
    try {
        const { hotel_id } = req.params;
        const { name, position, dob, phone, email } = req.body;
        const result = await db.query(
            'INSERT INTO hotel_contacts (hotel_id, name, position, dob, phone, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [hotel_id, name, position, dob || null, phone, email]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateContact = async (req, res) => {
    try {
        const { contact_id } = req.params;
        const { name, position, dob, phone, email } = req.body;
        const result = await db.query(
            'UPDATE hotel_contacts SET name=$1, position=$2, dob=$3, phone=$4, email=$5 WHERE id=$6 RETURNING *',
            [name, position, dob || null, phone, email, contact_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteContact = async (req, res) => {
    try {
        const { contact_id } = req.params;
        await db.query('DELETE FROM hotel_contacts WHERE id = $1', [contact_id]);
        res.json({ message: 'Deleted contact' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === ROOM TYPES ===
exports.createRoomType = async (req, res) => {
    try {
        const { hotel_id } = req.params;
        const { sku, name, description, max_occupancy } = req.body;
        const result = await db.query(
            'INSERT INTO hotel_room_types (hotel_id, sku, name, description, max_occupancy) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [hotel_id, sku, name, description, max_occupancy || 2]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateRoomType = async (req, res) => {
    try {
        const { room_id } = req.params;
        const { sku, name, description, max_occupancy } = req.body;
        const result = await db.query(
            'UPDATE hotel_room_types SET sku=$1, name=$2, description=$3, max_occupancy=$4 WHERE id=$5 RETURNING *',
            [sku, name, description, max_occupancy, room_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteRoomType = async (req, res) => {
    try {
        const { room_id } = req.params;
        await db.query('DELETE FROM hotel_room_types WHERE id = $1', [room_id]);
        res.json({ message: 'Deleted room type' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === CONTRACTS ===
exports.createContract = async (req, res) => {
    try {
        const { hotel_id } = req.params;
        const { contract_name, valid_from, valid_to, status, notes } = req.body;
        const result = await db.query(
            'INSERT INTO hotel_contracts (hotel_id, contract_name, valid_from, valid_to, status, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [hotel_id, contract_name, valid_from || null, valid_to || null, status || 'active', notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateContract = async (req, res) => {
    try {
        const { contract_id } = req.params;
        const { contract_name, valid_from, valid_to, status, notes } = req.body;
        const result = await db.query(
            'UPDATE hotel_contracts SET contract_name=$1, valid_from=$2, valid_to=$3, status=$4, notes=$5, updated_at=CURRENT_TIMESTAMP WHERE id=$6 RETURNING *',
            [contract_name, valid_from || null, valid_to || null, status, notes, contract_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteContract = async (req, res) => {
    try {
        const { contract_id } = req.params;
        await db.query('DELETE FROM hotel_contracts WHERE id = $1', [contract_id]);
        res.json({ message: 'Deleted contract' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === RATES ===
exports.createContractRate = async (req, res) => {
    try {
        const { contract_id } = req.params;
        const { room_type_id, start_date, end_date, day_type, currency, contract_price, net_price, sell_price, description, notes } = req.body;
        const result = await db.query(
            `INSERT INTO hotel_contract_rates 
             (contract_id, room_type_id, start_date, end_date, day_type, currency, contract_price, net_price, sell_price, description, notes) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [contract_id, room_type_id, start_date, end_date, day_type || 'All', currency || 'VND', contract_price, net_price, sell_price, description, notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateContractRate = async (req, res) => {
    try {
        const { rate_id } = req.params;
        const { room_type_id, start_date, end_date, day_type, currency, contract_price, net_price, sell_price, description, notes } = req.body;
        const result = await db.query(
            `UPDATE hotel_contract_rates SET 
             room_type_id=$1, start_date=$2, end_date=$3, day_type=$4, currency=$5, contract_price=$6, net_price=$7, sell_price=$8, description=$9, notes=$10 
             WHERE id=$11 RETURNING *`,
            [room_type_id, start_date, end_date, day_type, currency, contract_price, net_price, sell_price, description, notes, rate_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteContractRate = async (req, res) => {
    try {
        const { rate_id } = req.params;
        await db.query('DELETE FROM hotel_contract_rates WHERE id = $1', [rate_id]);
        res.json({ message: 'Deleted rate' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === ALLOTMENTS ===
exports.createAllotment = async (req, res) => {
    try {
        const { hotel_id } = req.params;
        const { room_type_id, start_date, end_date, day_type, allotment_count, cut_off_days, currency, net_price, sell_price, description, notes } = req.body;
        
        const result = await db.query(
            `INSERT INTO hotel_allotments 
             (hotel_id, room_type_id, start_date, end_date, day_type, allotment_count, cut_off_days, currency, net_price, sell_price, description, notes) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [hotel_id, room_type_id, start_date, end_date, day_type || 'All', allotment_count || 0, cut_off_days || 0, currency || 'VND', net_price, sell_price, description, notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateAllotment = async (req, res) => {
    try {
        const { allotment_id } = req.params;
        const { room_type_id, start_date, end_date, day_type, allotment_count, cut_off_days, currency, net_price, sell_price, description, notes } = req.body;
        const result = await db.query(
            `UPDATE hotel_allotments SET 
             room_type_id=$1, start_date=$2, end_date=$3, day_type=$4, allotment_count=$5, cut_off_days=$6, currency=$7, net_price=$8, sell_price=$9, description=$10, notes=$11 
             WHERE id=$12 RETURNING *`,
            [room_type_id, start_date, end_date, day_type, allotment_count, cut_off_days, currency, net_price, sell_price, description, notes, allotment_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteAllotment = async (req, res) => {
    try {
        const { allotment_id } = req.params;
        await db.query('DELETE FROM hotel_allotments WHERE id = $1', [allotment_id]);
        res.json({ message: 'Deleted allotment' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === NOTES ===
exports.getHotelNotes = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT n.*, u.full_name as creator_name FROM hotel_notes n LEFT JOIN users u ON n.created_by = u.id WHERE n.hotel_id = $1 ORDER BY n.created_at DESC',
            [req.params.hotel_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addHotelNote = async (req, res) => {
    const { hotel_id } = req.params;
    const { content } = req.body;
    const created_by = req.user.id;
    try {
        const result = await db.query(
            'INSERT INTO hotel_notes (hotel_id, content, created_by) VALUES ($1, $2, $3) RETURNING *',
            [hotel_id, content, created_by]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Add Hotel Note Error:', err);
        res.status(500).json({ message: err.message });
    }
};
