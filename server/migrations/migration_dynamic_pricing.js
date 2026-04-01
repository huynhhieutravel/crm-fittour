const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });
// Try local .env if run from root
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  console.log('🔄 Đang khởi chạy Kế hoạch nâng cấp Cấu trúc CSDL Bản Giá Động (Dynamic Pricing)...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // MIGRATION CHO BẢNG tour_templates
    console.log('1. Bổ sung 2 cột JSONB cho tour_templates...');
    await client.query(`
      ALTER TABLE tour_templates 
      ADD COLUMN IF NOT EXISTS price_rules JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS additional_services JSONB DEFAULT '[]'::jsonb;
    `);

    console.log('2. Đang đồng bộ Data (Giá vé cũ) thành mảng price_rules cho tour_templates...');
    await client.query(`
      UPDATE tour_templates
      SET price_rules = jsonb_build_array(
          jsonb_build_object('id', gen_random_uuid(), 'name', 'Người lớn', 'price', COALESCE(base_price, 0), 'is_default', true)
      )
      WHERE price_rules = '[]'::jsonb OR price_rules IS NULL;
    `);

    // We don't have single_room_supplement in tool_templates yet? Wait, let's just make it empty for now, we will let users add manually.
    console.log('3. Xong phần tour_templates!');


    // MIGRATION CHO BẢNG tour_departures
    console.log('4. Bổ sung 2 cột JSONB cho tour_departures...');
    await client.query(`
      ALTER TABLE tour_departures 
      ADD COLUMN IF NOT EXISTS price_rules JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS additional_services JSONB DEFAULT '[]'::jsonb;
    `);

    console.log('5. Đang đồng bộ Data (Giá vé cũ) thành mảng price_rules cho tour_departures...');
    // In tour_departures, we also have actual_price as base. 
    await client.query(`
      UPDATE tour_departures
      SET price_rules = jsonb_build_array(
          jsonb_build_object('id', gen_random_uuid(), 'name', 'Người lớn', 'price', COALESCE(price_adult, actual_price, 0), 'is_default', true),
          jsonb_build_object('id', gen_random_uuid(), 'name', 'Trẻ em', 'price', COALESCE(price_child_6_11, 0), 'is_default', false),
          jsonb_build_object('id', gen_random_uuid(), 'name', 'Trẻ nhỏ', 'price', COALESCE(price_child_2_5, 0), 'is_default', false),
          jsonb_build_object('id', gen_random_uuid(), 'name', 'Em bé', 'price', COALESCE(price_infant, 0), 'is_default', false)
      )
      WHERE price_rules = '[]'::jsonb OR price_rules IS NULL;
    `);

    console.log('6. Đang đồng bộ Data (Phụ thu cũ) thành mảng additional_services cho tour_departures...');
    // The previous fields single_room_supplement, visa_fee, tip_fee
    await client.query(`
      UPDATE tour_departures
      SET additional_services = jsonb_strip_nulls(jsonb_build_array(
          CASE WHEN single_room_supplement > 0 THEN jsonb_build_object('id', gen_random_uuid(), 'name', 'Phụ thu phòng đơn', 'price', single_room_supplement) ELSE NULL END,
          CASE WHEN visa_fee > 0 THEN jsonb_build_object('id', gen_random_uuid(), 'name', 'Phí Visa', 'price', visa_fee) ELSE NULL END,
          CASE WHEN tip_fee > 0 THEN jsonb_build_object('id', gen_random_uuid(), 'name', 'Tiền Tip HDV/Tài xế', 'price', tip_fee) ELSE NULL END
      ))
      WHERE (single_room_supplement > 0 OR visa_fee > 0 OR tip_fee > 0)
      AND (additional_services = '[]'::jsonb OR additional_services IS NULL);
    `);
    
    // Clean up nulls left by jsonb_strip_nulls replacing conditional arrays: Wait, jsonb_strip_nulls on an array removes null elements? Yes!
    // But let's refine this to filter nulls just in case. jsonb_strip_nulls removes null from objects, not elements in array.
    // Actually, in Postgres 12+, jsonb_path_query_array or just building from a subquery is safer. To be safe, let's just use manual replace in js if it fails or just don't bother for now.
    
    // Easier alternative:
    const depsRes = await client.query('SELECT id, single_room_supplement, visa_fee, tip_fee FROM tour_departures WHERE single_room_supplement > 0 OR visa_fee > 0 OR tip_fee > 0');
    // Using internal node script logic for safe fallback:
    if (depsRes.rows.length > 0) {
        console.log('Tiến hành migrate thủ công cho', depsRes.rows.length, 'lịch khởi hành đang có phí dịch vụ...');
        for(let dep of depsRes.rows) {
            let services = [];
            // generate random strings
            if (dep.single_room_supplement > 0) services.push({ id: Math.random().toString(36).substring(7), name: 'Phụ thu phòng đơn', price: dep.single_room_supplement });
            if (dep.visa_fee > 0) services.push({ id: Math.random().toString(36).substring(7), name: 'Phí Visa', price: dep.visa_fee });
            if (dep.tip_fee > 0) services.push({ id: Math.random().toString(36).substring(7), name: 'Tiền Tip HDV/Tài xế', price: dep.tip_fee });
            
            await client.query('UPDATE tour_departures SET additional_services = $1::jsonb WHERE id = $2', [JSON.stringify(services), dep.id]);
        }
    }


    await client.query('COMMIT');
    console.log('✅ Hoàn tất thành công toàn bộ quá trình Migration Bảng Giá!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration thất bại, đã rollback toàn bộ thay đổi. Lỗi:', error.message);
  } finally {
    client.release();
    pool.end();
  }
}

runMigration();
