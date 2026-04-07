const xlsx = require('xlsx');
const db = require('../db');
const path = require('path');
const excelFile = path.join(__dirname, '../../data_import/BU3-tour-doan-cleaned.xlsx');

const MERGE_MAP = {
    'VIB': 'VIB BANK',
    'Ngân hàng VIB': 'VIB BANK', 
    'VIB BANK': 'VIB BANK',
    'Kiểm TOÁN EY': 'KIỂM TOÁN EY',
};
function normalizeName(name) {
    if (!name) return null;
    const trimmed = name.trim();
    return MERGE_MAP[trimmed] || trimmed;
}

async function importBU3() {
    const client = await db.pool.connect();
    try {
        console.log("Loading Excel file...");
        const workbook = xlsx.readFile(excelFile);
        const sheetName = workbook.SheetNames[0]; 
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
        
        const usersRes = await client.query("SELECT id, full_name, username FROM users WHERE is_active=true");
        const usersMap = {};
        for (let u of usersRes.rows) {
            usersMap[u.full_name.toLowerCase()] = u.id;
            const parts = u.full_name.split(' ');
            const shortName = parts[parts.length-1] + ' ' + parts[parts.length-2]; 
            usersMap[shortName.toLowerCase()] = u.id;
            usersMap[u.full_name.split(' ').reverse().join(' ').toLowerCase()] = u.id; 
            if (parts.length >= 2) {
                const last2 = parts[parts.length-2] + ' ' + parts[parts.length-1];
                usersMap[last2.toLowerCase()] = u.id;
                usersMap[(parts[parts.length-1] + ' ' + parts[parts.length-2]).toLowerCase()] = u.id;
            }
            if (u.full_name === 'Vy Phan' || u.full_name === 'Thảo Vy Manager') usersMap['vy phan'] = u.id;
            if (u.full_name.includes('Hoàng') && u.full_name.includes('Hoa')) usersMap['hoàng hoa'] = u.id;
            if (u.full_name.includes('Hầu') && u.full_name.includes('Hưng')) usersMap['hầu hưng'] = u.id;
            if (u.full_name.includes('Hồng Trang')) usersMap['hồng trang'] = u.id;
            if (u.full_name.includes('Thị Trang') || u.full_name.includes('Lê Thị Trang')) usersMap['thị trang'] = u.id;
        }

        await client.query('BEGIN');
        
        console.log("Truncating old group_projects, group_leaders...");
        await client.query('TRUNCATE TABLE group_projects CASCADE');
        await client.query('TRUNCATE TABLE group_leaders CASCADE');
        
        const existingComps = await client.query('SELECT id, name FROM b2b_companies');
        const companyMap = new Map();
        for (const c of existingComps.rows) {
            companyMap.set(c.name, c.id);
        }

        let newCompaniesCount = 0;
        let leadersCount = 0;
        let projectsCount = 0;

        for (let i = 2; i < data.length; i++) {
            const row = data[i];
            if (!row || !row[5] || row[1] === 'Stt') continue; 

            const source = row[2]; 
            const saleName = row[3]; 
            let status = row[4]; 
            const projectName = row[5]; 
            const rawDeparture = row[6]; 
            const rawReturn = row[7]; 
            const destination = row[8]; 
            const pax = parseInt(row[9]) || 0; 
            const leaderName = row[10]; 
            const leaderPhone = row[11] ? String(row[11]).replace(/\s/g,'') : null; 
            const leaderEmail = row[12]; 
            const totalRevenue = parseFloat(row[14]) || 0; 
            const expectedMonth = row[15]; 
            
            if (!projectName || String(projectName).trim() === '') continue;

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
            }

            if (status === 'Done') status = 'Thành công';

            // UPSERT B2B COMPANY
            const cName = normalizeName(projectName);
            let companyId = companyMap.get(cName);
            if (!companyId) {
                const cRes = await client.query(
                    'INSERT INTO b2b_companies (name, assigned_to) VALUES ($1, $2) RETURNING id',
                    [cName, assigned_to]
                );
                companyId = cRes.rows[0].id;
                companyMap.set(cName, companyId);
                newCompaniesCount++;
            }

            // INSERT LEADER
            let leaderId = null;
            if (leaderName || leaderPhone) {
                const lName = leaderName || 'Chưa rõ tên';
                const lRes = await client.query(`
                    INSERT INTO group_leaders (name, phone, email, company_name, company_id, assigned_to, is_primary)
                    VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING id
                `, [lName, leaderPhone, leaderEmail, projectName, companyId, assigned_to]);
                leaderId = lRes.rows[0].id;
                leadersCount++;
            }

            // INSERT PROJECT
            let parsedDeparture = null;
            let parsedReturn = null;
            
            if (rawDeparture && typeof rawDeparture === 'string') {
                let parts = rawDeparture.split('/');
                if (parts.length === 3) parsedDeparture = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            if (rawReturn && typeof rawReturn === 'string') {
                let parts = rawReturn.split('/');
                if (parts.length === 3) parsedReturn = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            
            await client.query(`
                INSERT INTO group_projects 
                (name, group_leader_id, company_id, source, status, destination, expected_pax, departure_date, return_date, expected_month, total_revenue, assigned_to, notes)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            `, [
                projectName, leaderId, companyId, source, status || 'Báo giá', destination, pax, parsedDeparture, parsedReturn, expectedMonth, totalRevenue, assigned_to, null
            ]);
            projectsCount++;
        }
        
        await client.query('COMMIT');
        console.log(`✅ EXCEL TO DB SUCCESS!`);
        console.log(`- New B2B Companies Created: ${newCompaniesCount}`);
        console.log(`- Connected Group Leaders:   ${leadersCount}`);
        console.log(`- Connected Group Projects:  ${projectsCount}`);
    } catch(err) {
        await client.query('ROLLBACK');
        console.error("❌ Import failed:", err);
    } finally {
        client.release();
        process.exit(0);
    }
}

importBU3();
