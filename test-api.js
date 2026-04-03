const axios = require('axios');
async function test() {
  try {
    const res = await axios.get("http://localhost:5001/api/leads/stats?startDate=2026-04-02&endDate=2026-04-02&groupBy=day&tsStartDate=2026-03-27&tsEndDate=2026-04-02");
    console.log(res.data.timeSeriesStats);
  } catch (e) {
    if (e.response) console.log(e.response.data);
    else console.log(e.message);
  }
}
test();
