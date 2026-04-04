const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../raw/BU1-MKT.xlsx');
const workbook = xlsx.readFile(filePath, { cellDates: true });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const data = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

function parsePhone(phone) {
    if (!phone) return "";
    let str = phone.toString().trim();
    if (str.length === 9) str = '0' + str;
    return str;
}

const cleaned = data.slice(0, 3).map(row => {
    let pastTrips = 0;
    if (row['Tuyến đã đi']) {
        const trips = row['Tuyến đã đi'].split(',').filter(x => x.trim().length > 0);
        pastTrips = trips.length;
    }
    
    // formatting date
    let formattedDate = "";
    if (row['Date of Birth'] instanceof Date) {
        formattedDate = row['Date of Birth'].toISOString().split('T')[0];
    } else if (typeof row['Date of Birth'] === 'string') {
        formattedDate = row['Date of Birth']; // Might already be parsed
    }

    return {
        name: row['Full name'] || "",
        birth_date: formattedDate,
        gender: row['Gender'] || "",
        phone: parsePhone(row['Phone Number']),
        past_trip_count: pastTrips,
        internal_notes: row['Tuyến đã đi'] ? `Các tuyến đã đi: ${row['Tuyến đã đi']}` : "",
        notes: row['Ghi chú'] || "",
        tags: 'BU1, VIP'
    };
});

console.log(JSON.stringify(cleaned, null, 2));
