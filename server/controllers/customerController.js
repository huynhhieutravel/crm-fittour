const db = require('../db');

exports.getAllCustomers = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM customers ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createCustomer = async (req, res) => {
    const { name, phone, email, nationality, notes, tags } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO customers (name, phone, email, nationality, notes, tags) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, phone, email, nationality, notes, tags]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getCustomerById = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateCustomer = async (req, res) => {
    const { name, phone, email, nationality, notes, tags } = req.body;
    try {
        const result = await db.query(
            'UPDATE customers SET name=$1, phone=$2, email=$3, nationality=$4, notes=$5, tags=$6 WHERE id=$7 RETURNING *',
            [name, phone, email, nationality, notes, tags, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        await db.query('DELETE FROM customers WHERE id = $1', [req.params.id]);
        res.json({ message: 'Đã xoá khách hàng thành công' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
