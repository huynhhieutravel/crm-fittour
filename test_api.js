// We'll just trace hotelController.updateHotel by modifying it slightly to print req.body
const fs = require('fs');
let content = fs.readFileSync('server/controllers/hotelController.js', 'utf8');
if (!content.includes('console.log("PAYLOAD RECEIVED:", req.body)')) {
    content = content.replace("const { \n            code, name", "console.log('PAYLOAD RECEIVED:', req.body);\n        const { \n            code, name");
    fs.writeFileSync('server/controllers/hotelController.js', content);
    console.log('Injected payload log');
}
