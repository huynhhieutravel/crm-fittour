const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../raw/BU1-MKT.xlsx');
const workbook = xlsx.readFile(filePath, { cellDates: true, dateNF: "yyyy-mm-dd" });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

function parsePhone(phone) {
    if (!phone) return "";
    let str = phone.toString().trim();
    if (str.length === 9 && !str.startsWith('0')) str = '0' + str;
    return str;
}

const cleaned = data.map(row => {
    let pastTrips = 0;
    let destinations = [];

    if (row['Tuyến đã đi']) {
        const trips = row['Tuyến đã đi'].split(',').map(x => x.trim()).filter(x => x.length > 0);
        pastTrips = trips.length;
        destinations = trips; // Convert to array of strings
    }
    
    let formattedDate = null;
    if (row['Date of Birth'] instanceof Date) {
        formattedDate = new Date(row['Date of Birth'].getTime() - (row['Date of Birth'].getTimezoneOffset() * 60000))
            .toISOString()
            .split('T')[0];
    } else if (typeof row['Date of Birth'] === 'string' && row['Date of Birth'].length > 0) {
        let dStr = row['Date of Birth'];
        if (dStr.includes('/')) {
            const parts = dStr.split('/');
            if (parts.length === 3) {
                formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            } else {
                formattedDate = dStr;
            }
        } else {
            formattedDate = dStr; 
        }
    }

    return {
        "Họ Tên": row['Full name'] || "Khách hàng Mới",
        "Ngày sinh": formattedDate || "",
        "Nữ/Nam": row['Gender'] || "",
        "SĐT": parsePhone(row['Phone Number']) || "",
        "Tổng số chuyến (Gắn VIP)": pastTrips,
        "Đã đi (Thẻ Destinations)": destinations.join(" | "), // Visual separator to show it's an array
        "Ghi chú (Cột rỗng sẽ bỏ qua)": row['Ghi chú'] || ""
    };
});

const newWorkbook = xlsx.utils.book_new();
const newWorksheet = xlsx.utils.json_to_sheet(cleaned);

// Auto-size columns slightly for better view
const wscols = [
    {wch: 25}, // Họ tên
    {wch: 15}, // Ngày sinh
    {wch: 10}, // Nữ/Nam
    {wch: 15}, // SĐT
    {wch: 20}, // VIP
    {wch: 50}, // Destinations
    {wch: 30}  // Ghi chú
];
newWorksheet['!cols'] = wscols;

xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, "Preview CRM");

const outPath = path.join(__dirname, '../cleaned/Cleaned_BU1-MKT.xlsx');
xlsx.writeFile(newWorkbook, outPath);

console.log(`Đã xuất file excel làm sạch cập nhật tại: ${outPath}`);
