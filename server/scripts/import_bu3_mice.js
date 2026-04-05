const xlsx = require('xlsx');
const db = require('../db');

const path = require('path');
const excelFile = path.join(__dirname, '../../data_import/BU3-tour-doan-cleaned.xlsx');

async function importBU3() {
    const client = await db.pool.connect();
    try {
        console.log("Loading Excel file...");
        const workbook = xlsx.readFile(excelFile);
        const sheetName = workbook.SheetNames[0]; // DATA 2026
        const sheet = workbook.Sheets[sheetName];
        
        // Skip first 2 headers, data starts at row 3 (JS array index 2)
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
        
        // Find users mapped by name
        const usersRes = await client.query("SELECT id, full_name, username FROM users WHERE is_active=true");
        const usersMap = {};
        for (let u of usersRes.rows) {
            usersMap[u.full_name.toLowerCase()] = u.id;
            // Also map first names roughly
            const parts = u.full_name.split(' ');
            const shortName = parts[parts.length-1] + ' ' + parts[parts.length-2]; // e.g. Vy Phan -> Phan Vy
            usersMap[shortName.toLowerCase()] = u.id;
            usersMap[u.full_name.split(' ').reverse().join(' ').toLowerCase()] = u.id; // Phan Vy => Vy Phan
            
            // Map last 2 name parts for fuzzy matching (Hoàng Hoa -> Hoàng Thị Hoa)
            if (parts.length >= 2) {
                const last2 = parts[parts.length-2] + ' ' + parts[parts.length-1];
                usersMap[last2.toLowerCase()] = u.id;
                // Also reversed
                usersMap[(parts[parts.length-1] + ' ' + parts[parts.length-2]).toLowerCase()] = u.id;
            }
            // Hardcode known BU3 MICE Excel → Production mappings
            if (u.full_name === 'Vy Phan' || u.full_name === 'Thảo Vy Manager') usersMap['vy phan'] = u.id;
            if (u.full_name.includes('Hoàng') && u.full_name.includes('Hoa')) usersMap['hoàng hoa'] = u.id;
            if (u.full_name.includes('Hầu') && u.full_name.includes('Hưng')) usersMap['hầu hưng'] = u.id;
            if (u.full_name.includes('Hồng Trang')) usersMap['hồng trang'] = u.id;
            if (u.full_name.includes('Thị Trang') || u.full_name.includes('Lê Thị Trang')) usersMap['thị trang'] = u.id;
        }

        console.log("Mapping users:", Object.keys(usersMap).length);

        await client.query('BEGIN');
        
        console.log("Truncating old imports...");
        await client.query('TRUNCATE TABLE group_projects CASCADE');
        await client.query('TRUNCATE TABLE group_leaders CASCADE');

        for (let i = 2; i < data.length; i++) {
            const row = data[i];
            if (!row || !row[5] || row[1] === 'Stt') continue; // Skip empty rows or header rows

            const source = row[2]; // Nguồn thông tin
            const saleName = row[3]; // Sale
            let status = row[4]; // Tình trạng
            const projectName = row[5]; // Tên đoàn
            const rawDeparture = row[6]; // NGÀY ĐI
            const rawReturn = row[7]; // NGÀY VỀ
            const destination = row[8]; // Tuyến điểm
            const pax = parseInt(row[9]) || 0; // Số lượng
            const leaderName = row[10]; // Đại diện
            const leaderPhone = row[11] ? String(row[11]).replace(/\\s/g,'') : null; // Phone
            const leaderEmail = row[12]; // Mail
            const totalRevenue = parseFloat(row[14]) || 0; // Doanh thu
            const expectedMonth = row[15]; // THÁNG KH
            
            if (!projectName || String(projectName).trim() === '') continue;

            // Map Sale
            let assigned_to = null;
            if (saleName && typeof saleName === 'string') {
                const lower = saleName.trim().toLowerCase();
                if (usersMap[lower]) assigned_to = usersMap[lower];
                else {
                    for(let key of Object.keys(usersMap)) {
                        if (key.includes(lower) || lower.includes(key)) {
                            assigned_to = usersMap[key];
                            break;
                        }
                    }
                }
                if (!assigned_to) {
                    console.warn(`⚠️  UNMAPPED SALE: "${saleName}" -> Không tìm thấy user tương ứng! Dự án: ${projectName}`);
                }
            }

            // Clean status mapping
            if (status === 'Done') status = 'Thành công';

            // 1. Group Leader creation
            let leaderId = null;
            if (leaderName || leaderPhone) {
                const lName = leaderName || 'Chưa rõ tên';
                const res = await client.query(`
                    INSERT INTO group_leaders (name, phone, email, company_name, assigned_to)
                    VALUES ($1, $2, $3, $4, $5) RETURNING id
                `, [lName, leaderPhone, leaderEmail, projectName, assigned_to]);
                leaderId = res.rows[0].id;
            }

            // 2. Project creation
            let parsedDeparture = null;
            let parsedReturn = null;
            
            // Format is DD/MM/YYYY
            if (rawDeparture && typeof rawDeparture === 'string') {
                let parts = rawDeparture.split('/');
                if (parts.length === 3) {
                    parsedDeparture = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
            }
            if (rawReturn && typeof rawReturn === 'string') {
                let parts = rawReturn.split('/');
                if (parts.length === 3) {
                    parsedReturn = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
            }
            
            await client.query(`
                INSERT INTO group_projects 
                (name, group_leader_id, source, status, destination, expected_pax, departure_date, return_date, expected_month, total_revenue, assigned_to, notes)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `, [
                projectName, leaderId, source, status || 'Báo giá', destination, pax, parsedDeparture, parsedReturn, expectedMonth, totalRevenue, assigned_to, null
            ]);
            console.log(`Imported: ${projectName}`);
        }
        
        await client.query('COMMIT');
        console.log("BU3 MICE data import completed successfully.");
    } catch(err) {
        await client.query('ROLLBACK');
        console.error("Import failed:", err);
    } finally {
        client.release();
    }
}

importBU3();
