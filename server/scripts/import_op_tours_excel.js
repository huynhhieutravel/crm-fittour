const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const db = require('../db');

async function importData() {
  const results = [];
  const csvPath = path.join(__dirname, '../../data_import/cleaned/export-lich-khoi-hanh-CLEANED.csv');

  console.log('Loading CSV from:', csvPath);

  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        console.log(`Bắt đầu Import ${results.length} records vào tour_departures...`);
        let count = 0;
        
        for (const row of results) {
          const checkRes = await db.query('SELECT id FROM tour_departures WHERE code = $1', [row['Mã Tour']]);
          const tourInfo = {
             tour_name: row['Lịch trình'],
             creator: row['Người tạo'],
             imported_from_excel: true
          };

          if (checkRes.rows.length === 0) {
            await db.query(
              `INSERT INTO tour_departures (
                 code, start_date, end_date, market, status, 
                 total_revenue, actual_revenue, total_expense, profit, tour_info
               ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
              [
                row['Mã Tour'],
                row['Ngày Check In'] || null,
                row['Ngày Check Out'] || null,
                row['Nhóm/Thị trường'] || null,
                'Sắp chạy', // default status
                row['Tổng thu'] || 0,
                row['Thực thu'] || 0,
                row['Tổng chi'] || 0,
                row['Lợi nhuận'] || 0,
                JSON.stringify(tourInfo)
              ]
            );
            console.log(`✅ Đã thêm mới: ${row['Mã Tour']}`);
            count++;
          } else {
             // UPDATE if exists to overwrite stats
             await db.query(
               `UPDATE tour_departures SET 
                  start_date = $2, end_date = $3, market = $4, status = $5,
                  total_revenue = $6, actual_revenue = $7, total_expense = $8, profit = $9,
                  tour_info = $10
               WHERE code = $1`,
               [
                 row['Mã Tour'],
                 row['Ngày Check In'] || null,
                 row['Ngày Check Out'] || null,
                 row['Nhóm/Thị trường'] || null,
                 'Sắp chạy', // default status
                 row['Tổng thu'] || 0,
                 row['Thực thu'] || 0,
                 row['Tổng chi'] || 0,
                 row['Lợi nhuận'] || 0,
                 JSON.stringify(tourInfo)
               ]
             );
             console.log(`🔄 Đã Cập nhật (Overwrite): ${row['Mã Tour']}`);
             count++;
          }
        }
        
        console.log(`\\n🎉 IMPORT THÀNH CÔNG: ${count}/${results.length} tours.`);
      } catch (err) {
        console.error('LỖI IMPORT:', err);
      } finally {
        db.pool.end();
      }
    });
}

importData();
