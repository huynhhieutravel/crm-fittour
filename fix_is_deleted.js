const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'server', 'controllers');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace common patterns carefully
  content = content.replace(/booking_status\s*!=\s*'Huỷ'\s*AND\s*booking_status\s*!=\s*'Mới'/g, "booking_status != 'Huỷ' AND booking_status != 'Mới' AND COALESCE(is_deleted, false) = false");
  content = content.replace(/booking_status\s*!=\s*'Huỷ'/g, "booking_status != 'Huỷ' AND COALESCE(is_deleted, false) = false");
  
  content = content.replace(/booking_status\s*NOT\s*IN\s*\('Huỷ',\s*'Mới'\)/g, "booking_status NOT IN ('Huỷ', 'Mới') AND COALESCE(is_deleted, false) = false");
  content = content.replace(/booking_status\s*NOT\s*IN\s*\('Huỷ',\s*'Hủy'\)/g, "booking_status NOT IN ('Huỷ', 'Hủy') AND COALESCE(is_deleted, false) = false");
  content = content.replace(/booking_status\s*NOT\s*IN\s*\('Huỷ'\)/g, "booking_status NOT IN ('Huỷ') AND COALESCE(is_deleted, false) = false");

  // Fix duplicates if any
  content = content.replace(/AND\s*COALESCE\(is_deleted,\s*false\)\s*=\s*false\s*AND\s*COALESCE\(is_deleted,\s*false\)\s*=\s*false/g, "AND COALESCE(is_deleted, false) = false");

  // For aliases, if there's an ambiguous column error, we might need to fix it. 
  // Let's replace is_deleted with b.is_deleted where the query explicitly aliases bookings as b
  // Actually, COALESCE(is_deleted, false) will only be ambiguous if BOTH tables in a JOIN have is_deleted AND they are not specified.
  // We added is_deleted to BOTH tour_departures AND bookings. So they WILL be ambiguous if joined!
  content = content.replace(/COALESCE\(is_deleted/g, "COALESCE(bookings.is_deleted"); // default to bookings if we just blindly replace
  // But wait! if it's aliased as 'b', 'bookings.is_deleted' will throw "missing FROM-clause entry for table 'bookings'".
  
  // So instead of a naive script, let's just do it manually for the 11 files using multi_replace_file_content!
});
