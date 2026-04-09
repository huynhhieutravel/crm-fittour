const http = require('http');

console.log('Starting test...');

const req = http.request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/leads',
    method: 'GET',
    headers: { 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDAsInVzZXJuYW1lIjoic2FsZTEiLCJyb2xlIjoic2FsZXMiLCJpYXQiOjE3NzU3MTU0NDEsImV4cCI6MTc3NjkyNTA0MX0.iLM9SLlezFf8ZyRk4XTz6Ev9PKCWnfxd04FU-fEwmPY' },
    timeout: 3000
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Content length: ${data.length} chars`);
        console.log(`First 100 bytes: ${data.substring(0, 100)}...`);
    });
});

req.on('timeout', () => {
    console.error('Request TIMED OUT after 3 seconds!');
    req.destroy();
});

req.on('error', (err) => {
    console.error('Request ERROR:', err.message);
});

req.end();
