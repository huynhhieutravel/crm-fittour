const fs = require('fs');

const files = [
    'server/controllers/ticketController.js',
    'server/controllers/airlineController.js',
    'server/controllers/landtourController.js',
    'server/controllers/insuranceController.js',
    'server/controllers/transportController.js'
];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');

    // CREATE Extract
    content = content.replace(/bank_name, market, contacts, services/g, 'bank_name, market, rating, contacts, services');
    
    // CREATE SQL
    content = content.replace(/bank_name, market\) VALUES \(\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8, \$9, \$10, \$11, \$12, \$13, \$14, \$15, \$16\)/g, 'bank_name, market, rating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)');
    content = content.replace(/bank_name, market\) VALUES \(\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8, \$9, \$10, \$11, \$12, \$13, \$14, \$15\)/g, 'bank_name, market, rating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)');
    
    // CREATE Array
    content = content.replace(/bank_name, market\]/g, 'bank_name, market, rating || 0]');


    // UPDATE Extract
    content = content.replace(/bank_name, market,\n(.*)contacts, services,/g, 'bank_name, market, rating,\n$1contacts, services,');

    // UPDATE SQL
    content = content.replace(/bank_name=\$15, market=\$16, updated_at=CURRENT_TIMESTAMP WHERE id=\$17/g, 'bank_name=$15, market=$16, rating=$17, updated_at=CURRENT_TIMESTAMP WHERE id=$18');
    content = content.replace(/bank_name=\$14, market=\$15, updated_at=CURRENT_TIMESTAMP WHERE id=\$16/g, 'bank_name=$14, market=$15, rating=$16, updated_at=CURRENT_TIMESTAMP WHERE id=$17');

    // UPDATE Array
    content = content.replace(/bank_name, market, id\]/g, 'bank_name, market, rating || 0, id]');

    fs.writeFileSync(file, content);
    console.log('Patched', file);
}
