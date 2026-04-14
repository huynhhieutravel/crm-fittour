const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' });

async function run() {
    try {
        const token = jwt.sign({ id: 1, role: 'admin' }, process.env.JWT_SECRET);
        const res = await axios.get('http://localhost:5001/api/leads', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const haoZen = res.data.find(l => l.name === 'Hao Zen' && l.created_at.includes('2026-04-13'));
        console.log('API RESPONSE FOR HAO ZEN BU_GROUP:', haoZen ? haoZen.bu_group : 'NOT FOUND');
    } catch(err) {
        console.log('ERROR:', err.response ? err.response.data : err.message);
    }
}
run();
