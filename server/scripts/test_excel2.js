const xlsx = require('xlsx');
const path = require('path');
const inputFile = path.join(__dirname, '../../data_import/BU3-tour-doan.xlsx');
const workbook = xlsx.readFile(inputFile, { raw: false, cellDates: true, dateNF: 'dd-mm/mm' }); 

const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: false });

for (let i = 3; i < 16; i++) {
    console.log(`Row ${i+1}: Col G = ${data[i][6]}`);
}
