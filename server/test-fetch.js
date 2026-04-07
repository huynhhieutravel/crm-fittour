const axios = require('axios');
const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: 1, role: 'admin' }, 'tranthihong_dev_dz', { expiresIn: '1h' });
axios.get('http://localhost:5001/api/customers', {
  headers: { Authorization: `Bearer ${token}` }
}).then(res => {
  console.log("Is Array?", Array.isArray(res.data));
  console.log("Length:", res.data.length);
  if (!Array.isArray(res.data)) console.log("Data:", res.data);
}).catch(err => console.error(err.message));
