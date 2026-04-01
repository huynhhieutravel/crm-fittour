const axios = require('axios');
async function run() {
  try {
    const res = await axios.get('http://localhost:5001/api/guides/stats?startDate=2026-04-01&endDate=2026-04-30', {
      headers: { Authorization: `Bearer ${process.env.TEST_TOKEN || ''}` } // We don't have token...
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
run();
