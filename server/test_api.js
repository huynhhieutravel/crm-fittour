const http = require('http');
const req = http.request({
  hostname: 'localhost',
  port: 5001,
  path: '/api/leads',
  method: 'GET'
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', body));
});
req.on('error', console.error);
req.end();
