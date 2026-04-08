const axios = require('axios');
const payload = {
  tour_name: "TOUR FIT: HÀNG CHÂU",
  tour_code: "123124",
  start_date: "",
  end_date: "",
  status: "Đang chạy"
};
axios.put('http://localhost:5001/api/op-tours/1', payload)
  .then(r => console.log(r.data))
  .catch(e => console.log(e.response ? e.response.data : e.message));
