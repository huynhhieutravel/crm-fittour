const fs = require('fs');
const content = fs.readFileSync('controllers/webhookController.js', 'utf8');
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("INSERT INTO leads")) {
        console.log(`Line ${i+1}: ${lines[i]}`);
    }
}
