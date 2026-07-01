const XLSX = require('xlsx');
const path = require('path');
const file = path.join(__dirname, '../data_import/bao-cao-facebook-ads/tuan5-thang5-nam2026.xlsx');
const workbook = XLSX.readFile(file);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);
console.log("Total rows:", data.length);
console.log("First row:", data[0]);
