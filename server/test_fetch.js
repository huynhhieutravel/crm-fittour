const axios = require('axios');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config();

async function run() {
    try {
        const token = jwt.sign({ id: 1, username: 'admin', role: 'admin' }, process.env.JWT_SECRET);
        const res = await axios.get('http://localhost:5001/api/hotels?search=&market=&star_rate=', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('HOTELS RES LENGTH:', res.data.length);
        if(res.data.length > 0) {
            console.log('Sample:', res.data[0]);
        }
    } catch(e) {
        console.log('ERROR:', e.response ? e.response.data : e.message);
    }
}
run();
