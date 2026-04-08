/**
 * Patch script: Add drive_link to all supplier controllers and detail drawers
 * Run: node patch_drive_link.js
 */
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════
// PART 1: Patch Controllers (backend)
// ═══════════════════════════════════

const CONTROLLER_CONFIGS = [
  {
    file: 'server/controllers/hotelController.js',
    // hotel has unique structure with extra fields (star_rate, hotel_class, project_name, build_year)
    custom: true
  },
  { file: 'server/controllers/airlineController.js', classField: 'airline_class' },
  { file: 'server/controllers/landtourController.js', classField: 'landtour_class' },
  { file: 'server/controllers/ticketController.js', classField: 'ticket_type', extraField: 'ticket_class' },
  { file: 'server/controllers/transportController.js', classField: 'vehicle_type', extraField: 'transport_class' },
  { file: 'server/controllers/insuranceController.js', classField: 'insurance_class' },
];

function patchController(config) {
  const filePath = path.join(__dirname, config.file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('drive_link')) {
    console.log(`  SKIP (already has drive_link): ${config.file}`);
    return;
  }

  // Pattern 1: Add drive_link to destructuring in create (req.body)
  // Find: `market, rating, contacts` or `market, rating,\n            contacts`
  content = content.replace(
    /market, rating,(\s*)(contacts)/g,
    'market, rating, drive_link,$1$2'
  );

  // Pattern 2: Add drive_link to INSERT column list
  // Find: `market, rating) VALUES`
  content = content.replace(
    /market, rating\) VALUES/g,
    'market, rating, drive_link) VALUES'
  );

  // Pattern 3: Fix INSERT $N values - add one more parameter
  // Find the INSERT params array and add drive_link
  // Match: `rating || 0]` at end of INSERT params
  content = content.replace(
    /rating \|\| 0\](\s*\);?\s*\/\/ INSERT|(?=\s*\);\s*(?:const|\/\/|$)))/gm,
    'rating || 0, drive_link || null]$1'
  );
  
  // Simpler approach: just match `rating || 0]` followed by newline+closing
  content = content.replace(
    /market, rating \|\| 0\]/g,
    'market, rating || 0, drive_link || null]'
  );

  // Pattern 4: Add drive_link to UPDATE SET clause
  // Find: `rating=$N, updated_at` or `rating=$17, updated_at`
  content = content.replace(
    /rating=\$(\d+), updated_at/g,
    (match, num) => {
      const nextNum = parseInt(num) + 1;
      return `rating=$${num}, drive_link=$${nextNum}, updated_at`;
    }
  );

  // Pattern 5: Fix UPDATE WHERE id=$N
  content = content.replace(
    /WHERE id=\$(\d+) RETURNING/g,
    (match, num) => {
      const newNum = parseInt(num) + 1;
      return `WHERE id=$${newNum} RETURNING`;
    }
  );

  // Pattern 6: Fix UPDATE params array
  content = content.replace(
    /market, rating \|\| 0, id\]/g,
    'market, rating || 0, drive_link || null, id]'
  );

  // Pattern 7: Fix INSERT $N counts - need to add one more $N
  // Find VALUES ($1, $2, ..., $16) and add $17
  content = content.replace(
    /VALUES \(([^)]+)\) RETURNING/g,
    (match, params) => {
      const parts = params.split(',').map(s => s.trim());
      const lastNum = parseInt(parts[parts.length - 1].replace('$', ''));
      const newParam = `$${lastNum + 1}`;
      return `VALUES (${params}, ${newParam}) RETURNING`;
    }
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  PATCHED: ${config.file}`);
}

// Hotel controller is special - handle manually
function patchHotelController() {
  const filePath = path.join(__dirname, 'server/controllers/hotelController.js');
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('drive_link')) {
    console.log('  SKIP (already has drive_link): hotelController.js');
    return;
  }

  // CREATE: destructuring
  content = content.replace(
    /bank_account_name, bank_account_number, bank_name, market, rating,\s*contacts/,
    'bank_account_name, bank_account_number, bank_name, market, rating, drive_link,\n            contacts'
  );

  // CREATE: INSERT columns
  content = content.replace(
    /bank_account_name, bank_account_number, bank_name, market, rating\n\s*\) VALUES/,
    'bank_account_name, bank_account_number, bank_name, market, rating, drive_link\n            ) VALUES'
  );
  
  // CREATE: INSERT values - find the right $N pattern
  content = content.replace(
    /bank_account_name, bank_account_number, bank_name, market, rating \|\| 0\]/,
    'bank_account_name, bank_account_number, bank_name, market, rating || 0, drive_link || null]'
  );

  // CREATE: Fix VALUES $N count
  content = content.replace(
    /VALUES \(([^)]+)\) RETURNING \*`/g,
    (match, params) => {
      if (match.includes('drive_link')) return match; // already patched
      const parts = params.split(',').map(s => s.trim());
      const lastNum = parseInt(parts[parts.length - 1].replace('$', ''));
      return `VALUES (${params}, $${lastNum + 1}) RETURNING *\``;
    }
  );

  // UPDATE: destructuring
  content = content.replace(
    /bank_account_name, bank_account_number, bank_name, market, rating,\s*contacts, room_types/,
    'bank_account_name, bank_account_number, bank_name, market, rating, drive_link,\n            contacts, room_types'
  );

  // UPDATE: SET clause  
  content = content.replace(
    /rating=\$(\d+), updated_at/,
    (match, num) => `rating=$${num}, drive_link=$${parseInt(num)+1}, updated_at`
  );

  // UPDATE: WHERE id
  content = content.replace(
    /WHERE id=\$(\d+) RETURNING/,
    (match, num) => `WHERE id=$${parseInt(num)+1} RETURNING`
  );

  // UPDATE: params array
  content = content.replace(
    /market, rating \|\| 0, id\]/,
    'market, rating || 0, drive_link || null, id]'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('  PATCHED: server/controllers/hotelController.js');
}

console.log('=== Patching Controllers ===');
patchHotelController();
for (const config of CONTROLLER_CONFIGS) {
  if (!config.custom) patchController(config);
}

// ═══════════════════════════════════
// PART 2: Patch Detail Drawers (frontend)
// ═══════════════════════════════════

const DRAWER_FILES = [
  'client/src/components/modals/HotelDetailDrawer.jsx',
  'client/src/components/modals/AirlineDetailDrawer.jsx',
  'client/src/components/modals/LandtourDetailDrawer.jsx',
  'client/src/components/modals/TicketDetailDrawer.jsx',
  'client/src/components/modals/TransportDetailDrawer.jsx',
  'client/src/components/modals/InsuranceDetailDrawer.jsx',
];

function patchDrawer(filePath) {
  const fullPath = path.join(__dirname, filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  if (content.includes('drive_link')) {
    console.log(`  SKIP (already has drive_link): ${filePath}`);
    return;
  }

  // 1. Add ExternalLink and Link2 to lucide imports
  if (!content.includes('ExternalLink')) {
    content = content.replace(
      /from 'lucide-react';/,
      (match) => {
        // Find the import line and add icons
        return match.replace("from 'lucide-react';", ", ExternalLink, Link2 } from 'lucide-react';").replace(', ExternalLink, Link2 }', ', ExternalLink, Link2 }');
      }
    );
    // More reliable: find closing } before from 'lucide-react'
    content = content.replace(
      /(\s*)\} from 'lucide-react';/,
      '$1, ExternalLink, Link2 } from \'lucide-react\';'
    );
  }

  // 2. Add drive_link to formData useState
  content = content.replace(
    /website: '', (.+?)market: '',/,
    "website: '', $1market: '', drive_link: '',"
  );
  // Also handle single-line pattern
  content = content.replace(
    /market: '',\s*\n(\s*)bank_account/,
    "market: '', drive_link: '',\n$1bank_account"
  );

  // 3. Add drive_link to useEffect init
  content = content.replace(
    /market: (\w+)\.market \|\| '',\s*\n/,
    (match, varName) => {
      return match.replace(
        `market: ${varName}.market || '',`,
        `market: ${varName}.market || '', drive_link: ${varName}.drive_link || '',`
      );
    }
  );

  // 4. Add drive_link UI field - insert before "Ghi chú đặc biệt" or notes section
  const driveFieldHTML = `
                                    <div style={{ gridColumn: 'span 2', background: '#eff6ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                                        <label style={{ ...labelStyle, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Link2 size={16} /> Link Drive Dữ Liệu NCC
                                        </label>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input type="url" style={{ ...drawerInputStyle, flex: 1, borderColor: '#93c5fd', background: 'white' }} value={formData.drive_link} onChange={e => setFormData({...formData, drive_link: e.target.value})} disabled={isViewOnly} placeholder="https://drive.google.com/..." />
                                            {formData.drive_link && (
                                                <a href={formData.drive_link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', background: '#2563eb', color: 'white', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                                                    <ExternalLink size={14} /> Mở Drive
                                                </a>
                                            )}
                                        </div>
                                    </div>`;

  // Insert before the notes/ghi chú section
  // Pattern: find `Ghi chú đặc biệt` or `Ghi chú` label
  const notesPatterns = [
    /(<div style=\{\{ gridColumn: 'span 1' \}\}>\s*<label[^>]*>Ghi chú đặc biệt)/,
    /(<div style=\{\{ gridColumn: 'span 1' \}\}>\s*<label[^>]*>Ghi chú)/,
  ];
  
  let inserted = false;
  for (const pattern of notesPatterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, driveFieldHTML + '\n                                    $1');
      inserted = true;
      break;
    }
  }

  if (!inserted) {
    console.log(`  WARNING: Could not find insert point for drive_link UI in ${filePath}`);
  }

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`  PATCHED: ${filePath}`);
}

console.log('\n=== Patching Drawers ===');
for (const drawer of DRAWER_FILES) {
  patchDrawer(drawer);
}

// ═══════════════════════════════════
// PART 3: Patch Tab files (add Drive column to table)
// ═══════════════════════════════════

const TAB_FILES = [
  'client/src/tabs/HotelsTab.jsx',
  'client/src/tabs/AirlinesTab.jsx',
  'client/src/tabs/LandtoursTab.jsx',
  'client/src/tabs/TicketsTab.jsx',
  'client/src/tabs/TransportsTab.jsx',
  'client/src/tabs/InsurancesTab.jsx',
];

function patchTab(filePath) {
  const fullPath = path.join(__dirname, filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  if (content.includes('drive_link')) {
    console.log(`  SKIP (already has drive_link): ${filePath}`);
    return;
  }

  // 1. Add ExternalLink to imports
  if (!content.includes('ExternalLink')) {
    content = content.replace(
      /(\s*)\} from 'lucide-react';/,
      '$1, ExternalLink } from \'lucide-react\';'
    );
  }

  // 2. Replace KHU VỰC header with DRIVE
  content = content.replace(
    /<th[^>]*>KHU VỰC<\/th>/,
    '<th style={{ padding: \'16px 20px\', textAlign: \'center\', width: \'100px\' }}>DRIVE</th>'
  );

  // 3. Replace KHU VỰC cell content with Drive button
  // Find the province cell pattern and replace
  content = content.replace(
    /<td[^>]*>\s*<div[^>]*>\s*<MapPin[^/]*\/>\s*\{h\.province[^}]*\}\s*<\/div>\s*<\/td>/,
    `<td style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                                        {h.drive_link ? (
                                            <a href={h.drive_link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#2563eb', color: 'white', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#1d4ed8'} onMouseOut={e=>e.currentTarget.style.background='#2563eb'}>
                                                <ExternalLink size={13} /> Mở
                                            </a>
                                        ) : (
                                            <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>—</span>
                                        )}
                                    </td>`
  );

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`  PATCHED: ${filePath}`);
}

console.log('\n=== Patching Tabs ===');
for (const tab of TAB_FILES) {
  patchTab(tab);
}

console.log('\n✅ All patches applied!');
