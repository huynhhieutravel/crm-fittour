const http = require('http');
const req = http.request({
    hostname: 'localhost', port: 5001, path: '/api/users', method: 'GET',
    headers: { 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDAsInVzZXJuYW1lIjoic2FsZTEiLCJyb2xlIjoic2FsZXMiLCJpYXQiOjE3NzU3MTU0NDEsImV4cCI6MTc3NjkyNTA0MX0.iLM9SLlezFf8ZyRk4XTz6Ev9PKCWnfxd04FU-fEwmPY' },
}, res => {
    let raw = '';
    res.on('data', chunk => raw += chunk);
    res.on('end', () => console.log(res.statusCode, raw.substring(0, 500)));
});
req.end();
