const db = require('./server/db');

async function migrate() {
  try {
    console.log('Adding "code" column to tour_templates...');
    try {
      await db.query('ALTER TABLE tour_templates ADD COLUMN code VARCHAR(50) UNIQUE');
      console.log('Column added.');
    } catch (e) {
      if (e.code === '42701') {
        console.log('Column already exists.');
      } else {
        throw e;
      }
    }

    console.log('Generating codes for existing tours...');
    const result = await db.query('SELECT id, name, duration FROM tour_templates WHERE code IS NULL OR code = \'\'');
    const tours = result.rows;

    for (const tour of tours) {
      let baseCode = generateTourCode(tour.name, tour.duration);
      let finalCode = baseCode;
      let counter = 1;

      // Check for uniqueness
      while (true) {
        const check = await db.query('SELECT id FROM tour_templates WHERE code = $1 AND id != $2', [finalCode, tour.id]);
        if (check.rows.length === 0) break;
        finalCode = `${baseCode}-${counter++}`;
      }

      await db.query('UPDATE tour_templates SET code = $1 WHERE id = $2', [finalCode, tour.id]);
      console.log(`Updated tour ID ${tour.id}: ${tour.name} -> ${finalCode}`);
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

function removeAccents(str) {
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

function generateTourCode(name, duration) {
  // Remove "Tour" prefix if exists
  let cleanName = name.replace(/^Tour\s+/i, '');
  
  // Remove accents
  cleanName = removeAccents(cleanName);
  
  // Get first 2-3 words or just the main destination
  let words = cleanName.split(/\s+/).filter(w => w.length > 1);
  let abbreviated = words.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  
  // Handle duration: "10N9Đ" -> "10N9D"
  let durCode = removeAccents(duration || '').replace(/\s+/g, '').toUpperCase();
  
  return (abbreviated + durCode).replace(/[^a-zA-Z0-9]/g, '');
}

migrate();
