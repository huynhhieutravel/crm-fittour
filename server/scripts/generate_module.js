#!/usr/bin/env node
/**
 * =====================================================
 *  🏗️  MODULE GENERATOR — CRM FIT Tour
 * =====================================================
 *  Script tự động tạo toàn bộ code cho 1 module NCC mới
 *  dựa trên template Restaurant (đã verified & stable).
 *  
 *  Usage:
 *    node generate_module.js --config ./configs/transport.json
 *    node generate_module.js --config ./configs/ticket.json
 * 
 *  Output: Tạo 5 files + 1 migration + hướng dẫn tích hợp App.jsx
 * =====================================================
 */

const fs = require('fs');
const path = require('path');

// ========== PARSE ARGUMENTS ==========
const args = process.argv.slice(2);
const configIndex = args.indexOf('--config');
if (configIndex === -1 || !args[configIndex + 1]) {
  console.error('❌ Usage: node generate_module.js --config ./configs/MODULE_NAME.json');
  console.error('');
  console.error('Tạo config file trước, xem mẫu tại: ./configs/_template.json');
  process.exit(1);
}

const configPath = path.resolve(args[configIndex + 1]);
if (!fs.existsSync(configPath)) {
  console.error(`❌ Config file not found: ${configPath}`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// ========== VALIDATE CONFIG ==========
const REQUIRED_FIELDS = ['module_name', 'module_name_vi', 'table_prefix', 'icon', 'entity_fields', 'service_fields', 'contact_fields'];
for (const field of REQUIRED_FIELDS) {
  if (!config[field]) {
    console.error(`❌ Missing required field in config: "${field}"`);
    process.exit(1);
  }
}

// ========== DERIVED NAMES ==========
const M = config.module_name;                    // "transport"
const MV = config.module_name_vi;                // "Nhà xe"
const T = config.table_prefix;                   // "transports"
const TP = T.slice(0, -1);                       // "transport" (singular)
const MC = M.charAt(0).toUpperCase() + M.slice(1); // "Transport"
const MCS = MC + 's';                            // "Transports"
const ICON = config.icon;                        // "Truck"

const ENTITY_FIELDS = config.entity_fields;      // [{name, type, label, required}]
const SERVICE_FIELDS = config.service_fields;     // [{name, type, label}]
const CONTACT_FIELDS = config.contact_fields;     // [{name, type, label}]

const RATE_FIELDS = config.rate_fields || [
  { name: 'fita_net', type: 'NUMERIC(15,2)' },
  { name: 'fita_sale', type: 'NUMERIC(15,2)' },
  { name: 'fita_commission', type: 'NUMERIC(15,2)' },
  { name: 'fite_net', type: 'NUMERIC(15,2)' },
  { name: 'fite_sale', type: 'NUMERIC(15,2)' },
  { name: 'fite_commission', type: 'NUMERIC(15,2)' },
  { name: 'series_net', type: 'NUMERIC(15,2)' },
  { name: 'series_sale', type: 'NUMERIC(15,2)' },
  { name: 'series_commission', type: 'NUMERIC(15,2)' },
  { name: 'charter_net', type: 'NUMERIC(15,2)' },
  { name: 'charter_sale', type: 'NUMERIC(15,2)' },
  { name: 'charter_commission', type: 'NUMERIC(15,2)' }
];

// =====================================================
//  1. MIGRATION FILE
// =====================================================
function generateMigration() {
  const entityCols = ENTITY_FIELDS.map(f => `            ${f.name} ${f.type}${f.required ? ' NOT NULL' : ''}`).join(',\n');
  const contactCols = CONTACT_FIELDS.map(f => `            ${f.name} ${f.type}`).join(',\n');
  const serviceCols = SERVICE_FIELDS.map(f => `            ${f.name} ${f.type}${f.required ? ' NOT NULL' : ''}`).join(',\n');
  const rateCols = RATE_FIELDS.map(f => `            ${f.name} ${f.type}`).join(',\n');

  return `require('dotenv').config({ path: __dirname + '/../.env' });
const db = require('../db');

async function migrate() {
  console.log('=== STARTING ${T.toUpperCase()} SCHEMA MIGRATION ===');
  
  try {
    // 1. ${T}
    await db.query(\`
        CREATE TABLE IF NOT EXISTS ${T} (
            id SERIAL PRIMARY KEY,
${entityCols},
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    \`);
    console.log('✔ Table ${T} verified/created.');

    // 2. ${TP}_contacts
    await db.query(\`
        CREATE TABLE IF NOT EXISTS ${TP}_contacts (
            id SERIAL PRIMARY KEY,
            ${TP}_id INTEGER NOT NULL REFERENCES ${T}(id) ON DELETE CASCADE,
${contactCols},
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    \`);
    console.log('✔ Table ${TP}_contacts verified/created.');

    // 3. ${TP}_services
    await db.query(\`
        CREATE TABLE IF NOT EXISTS ${TP}_services (
            id SERIAL PRIMARY KEY,
            ${TP}_id INTEGER NOT NULL REFERENCES ${T}(id) ON DELETE CASCADE,
${serviceCols},
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    \`);
    console.log('✔ Table ${TP}_services verified/created.');

    // 4. ${TP}_contracts
    await db.query(\`
        CREATE TABLE IF NOT EXISTS ${TP}_contracts (
            id SERIAL PRIMARY KEY,
            ${TP}_id INTEGER NOT NULL REFERENCES ${T}(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            valid_from DATE,
            valid_to DATE,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    \`);
    console.log('✔ Table ${TP}_contracts verified/created.');

    // 5. ${TP}_contract_rates
    await db.query(\`
        CREATE TABLE IF NOT EXISTS ${TP}_contract_rates (
            id SERIAL PRIMARY KEY,
            contract_id INTEGER NOT NULL REFERENCES ${TP}_contracts(id) ON DELETE CASCADE,
            service_id INTEGER NOT NULL REFERENCES ${TP}_services(id) ON DELETE CASCADE,
${rateCols},
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    \`);
    console.log('✔ Table ${TP}_contract_rates verified/created.');
    
    // 6. ${TP}_notes
    await db.query(\`
        CREATE TABLE IF NOT EXISTS ${TP}_notes (
            id SERIAL PRIMARY KEY,
            ${TP}_id INTEGER NOT NULL REFERENCES ${T}(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    \`);
    console.log('✔ Table ${TP}_notes verified/created.');

    console.log('=== MIGRATION COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('❌ MIGRATION FAILED:', error);
  } finally {
    process.exit(0);
  }
}

migrate();
`;
}

// =====================================================
//  2. CONTROLLER FILE
// =====================================================
function generateController() {
  const entityFieldNames = ENTITY_FIELDS.map(f => f.name);
  const contactFieldNames = CONTACT_FIELDS.filter(f => f.name !== 'id').map(f => f.name);
  const serviceFieldNames = SERVICE_FIELDS.filter(f => f.name !== 'id').map(f => f.name);
  const rateFieldNames = RATE_FIELDS.map(f => f.name);

  const entityDestructure = entityFieldNames.join(', ');
  const entityPlaceholders = entityFieldNames.map((_, i) => `$${i + 1}`).join(', ');
  const entityInsertCols = entityFieldNames.join(', ');
  const entityUpdateSet = entityFieldNames.map((f, i) => `${f}=$${i + 1}`).join(', ');

  const contactInsertCols = contactFieldNames.join(', ');
  const contactPlaceholders = contactFieldNames.map((_, i) => `$${i + 2}`).join(', '); // $1 = entity_id
  const contactUpdateSet = contactFieldNames.map((f, i) => `${f}=$${i + 1}`).join(', ');

  const serviceInsertCols = serviceFieldNames.join(', ');
  const servicePlaceholders = serviceFieldNames.map((_, i) => `$${i + 2}`).join(', ');
  const serviceUpdateSet = serviceFieldNames.map((f, i) => `${f}=$${i + 1}`).join(', ');

  const rateInsertCols = rateFieldNames.join(', ');
  const rateDestructure = rateFieldNames.join(', ');
  const ratePlaceholders = rateFieldNames.map((_, i) => `$${i + 3}`).join(', '); // $1=contract_id, $2=service_id
  const rateUpdateSet = rateFieldNames.map((f, i) => `${f}=$${i + 2}`).join(', '); // $1=service_id

  return `const db = require('../db');
const { logActivity } = require('../utils/logger');

// === ${T.toUpperCase()} ===
exports.getAll = async (req, res) => {
    try {
        const { search, province, market, page = 1, limit = 30 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM ${T} WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as total FROM ${T} WHERE 1=1';
        let params = [];
        let paramIndex = 1;

        if (search) {
            const searchClause = \` AND (name ILIKE $\${paramIndex} OR code ILIKE $\${paramIndex})\`;
            query += searchClause;
            countQuery += searchClause;
            params.push(\`%\${search}%\`);
            paramIndex++;
        }
        if (market) {
            const filterClause = \` AND market = $\${paramIndex}\`;
            query += filterClause;
            countQuery += filterClause;
            params.push(market);
            paramIndex++;
        }
        if (province) {
            const filterClause = \` AND province = $\${paramIndex}\`;
            query += filterClause;
            countQuery += filterClause;
            params.push(province);
            paramIndex++;
        }

        query += \` ORDER BY id DESC LIMIT $\${paramIndex} OFFSET $\${paramIndex + 1}\`;
        const queryParams = [...params, limit, offset];

        const [dataResult, countResult] = await Promise.all([
            db.query(query, queryParams),
            db.query(countQuery, params)
        ]);

        const total = parseInt(countResult.rows[0].total, 10);

        res.json({
            data: dataResult.rows,
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

exports.getDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const entityRes = await db.query('SELECT * FROM ${T} WHERE id = $1', [id]);
        if (entityRes.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy ${MV}' });
        const entity = entityRes.rows[0];

        const contactsRes = await db.query('SELECT * FROM ${TP}_contacts WHERE ${TP}_id = $1 ORDER BY id ASC', [id]);
        const servicesRes = await db.query('SELECT * FROM ${TP}_services WHERE ${TP}_id = $1 ORDER BY id ASC', [id]);
        const contractsRes = await db.query('SELECT * FROM ${TP}_contracts WHERE ${TP}_id = $1 ORDER BY valid_from DESC', [id]);
        
        const ratesRes = await db.query(\`
            SELECT r.*, s.name as service_name
            FROM ${TP}_contract_rates r
            JOIN ${TP}_contracts c ON r.contract_id = c.id
            LEFT JOIN ${TP}_services s ON r.service_id = s.id
            WHERE c.${TP}_id = $1
        \`, [id]);

        entity.contacts = contactsRes.rows;
        entity.services = servicesRes.rows;
        entity.contracts = contractsRes.rows;
        
        entity.contracts.forEach(contract => {
            contract.rates = ratesRes.rows.filter(r => r.contract_id === contract.id);
        });

        res.json(entity);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

exports.create = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { ${entityDestructure}, contacts, services } = req.body;

        await client.query('BEGIN');

        const result = await client.query(
            \`INSERT INTO ${T} (${entityInsertCols}) VALUES (${entityPlaceholders}) RETURNING *\`,
            [${entityDestructure}]
        );
        const newId = result.rows[0].id;

        if (contacts && Array.isArray(contacts)) {
            for (const c of contacts) {
                if (c.name && c.name.trim() !== '') {
                    await client.query(
                        'INSERT INTO ${TP}_contacts (${TP}_id, ${contactInsertCols}) VALUES ($1, ${contactPlaceholders})',
                        [newId, ${contactFieldNames.map(f => `c.${f}`).join(', ')}]
                    );
                }
            }
        }

        if (services && Array.isArray(services)) {
            for (const s of services) {
                if (!s.name) continue;
                await client.query(
                    'INSERT INTO ${TP}_services (${TP}_id, ${serviceInsertCols}) VALUES ($1, ${servicePlaceholders})',
                    [newId, ${serviceFieldNames.map(f => `s.${f} || null`).join(', ')}]
                );
            }
        }

        await client.query('COMMIT');

        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'CREATE',
                entity_type: '${M.toUpperCase()}',
                entity_id: newId,
                details: \`Đã thêm mới ${MV}: \${name}\`
            });
        }

        res.status(201).json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        if (err.code === '23505') {
            return res.status(400).json({ message: 'Mã Nhà cung cấp đã tồn tại!' });
        }
        console.error(err);
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
};

exports.update = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { id } = req.params;
        const { 
            ${entityDestructure},
            contacts, services,
            deleted_contact_ids, deleted_service_ids
        } = req.body;

        await client.query('BEGIN');

        const result = await client.query(
            \`UPDATE ${T} SET ${entityUpdateSet}, updated_at=CURRENT_TIMESTAMP WHERE id=$${entityFieldNames.length + 1} RETURNING *\`,
            [${entityDestructure}, id]
        );

        if (deleted_contact_ids && deleted_contact_ids.length > 0) {
            await client.query('DELETE FROM ${TP}_contacts WHERE id = ANY($1::int[])', [deleted_contact_ids]);
        }
        if (deleted_service_ids && deleted_service_ids.length > 0) {
            await client.query('DELETE FROM ${TP}_services WHERE id = ANY($1::int[])', [deleted_service_ids]);
        }

        if (contacts !== undefined) {
            for (const c of contacts) {
                if (!c.name || c.name.trim() === '') continue;
                if (typeof c.id === 'string' || Number(c.id) > 1000000000000) {
                    await client.query(
                        'INSERT INTO ${TP}_contacts (${TP}_id, ${contactInsertCols}) VALUES ($1, ${contactPlaceholders})',
                        [id, ${contactFieldNames.map(f => `c.${f}`).join(', ')}]
                    );
                } else {
                    await client.query(
                        'UPDATE ${TP}_contacts SET ${contactUpdateSet} WHERE id=$${contactFieldNames.length + 1}',
                        [${contactFieldNames.map(f => `c.${f}`).join(', ')}, c.id]
                    );
                }
            }
        }

        if (services !== undefined) {
            for (const s of services) {
                if (!s.name) continue;
                if (typeof s.id === 'string' || Number(s.id) > 1000000000000) {
                    await client.query(
                        'INSERT INTO ${TP}_services (${TP}_id, ${serviceInsertCols}) VALUES ($1, ${servicePlaceholders})',
                        [id, ${serviceFieldNames.map(f => `s.${f} || null`).join(', ')}]
                    );
                } else {
                    await client.query(
                        'UPDATE ${TP}_services SET ${serviceUpdateSet} WHERE id=$${serviceFieldNames.length + 1}',
                        [${serviceFieldNames.map(f => `s.${f} || null`).join(', ')}, s.id]
                    );
                }
            }
        }

        await client.query('COMMIT');

        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'UPDATE',
                entity_type: '${M.toUpperCase()}',
                entity_id: id,
                details: \`Cập nhật thông tin ${MV}: \${name}\`
            });
        }

        res.json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const checkDeps = await db.query(\`
            SELECT 
                (SELECT COUNT(*) FROM ${TP}_contracts WHERE ${TP}_id = $1) as contract_count,
                (SELECT COUNT(*) FROM ${TP}_services WHERE ${TP}_id = $1) as service_count
        \`, [id]);
        
        const deps = checkDeps.rows[0];
        const totalDeps = parseInt(deps.contract_count) + parseInt(deps.service_count);

        if (totalDeps > 0 && req.query.force !== 'true') {
            return res.status(409).json({ 
                message: \`${MV} này đang có \${deps.contract_count} hợp đồng và \${deps.service_count} dịch vụ. Xóa sẽ xóa toàn bộ dữ liệu phụ lục bên trong.\`,
                has_deps: true,
                dep_count: totalDeps
            });
        }

        await db.query('DELETE FROM ${T} WHERE id = $1', [id]);
        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'DELETE',
                entity_type: '${M.toUpperCase()}',
                entity_id: id,
                details: \`Xóa ${MV} ID \${id}\`
            });
        }
        res.json({ message: 'Xóa thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// === CONTACTS ===
exports.createContact = async (req, res) => {
    try {
        const { ${TP}_id } = req.params;
        const { ${contactFieldNames.join(', ')} } = req.body;
        const result = await db.query(
            'INSERT INTO ${TP}_contacts (${TP}_id, ${contactInsertCols}) VALUES ($1, ${contactPlaceholders}) RETURNING *',
            [${TP}_id, ${contactFieldNames.join(', ')}]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateContact = async (req, res) => {
    try {
        const { contact_id } = req.params;
        const { ${contactFieldNames.join(', ')} } = req.body;
        const result = await db.query(
            'UPDATE ${TP}_contacts SET ${contactUpdateSet} WHERE id=$${contactFieldNames.length + 1} RETURNING *',
            [${contactFieldNames.join(', ')}, contact_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteContact = async (req, res) => {
    try {
        const { contact_id } = req.params;
        await db.query('DELETE FROM ${TP}_contacts WHERE id = $1', [contact_id]);
        res.json({ message: 'Deleted contact' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === SERVICES ===
exports.createService = async (req, res) => {
    try {
        const { ${TP}_id } = req.params;
        const { ${serviceFieldNames.join(', ')} } = req.body;
        const result = await db.query(
            'INSERT INTO ${TP}_services (${TP}_id, ${serviceInsertCols}) VALUES ($1, ${servicePlaceholders}) RETURNING *',
            [${TP}_id, ${serviceFieldNames.map(f => `${f} || null`).join(', ')}]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateService = async (req, res) => {
    try {
        const { service_id } = req.params;
        const { ${serviceFieldNames.join(', ')} } = req.body;
        const result = await db.query(
            'UPDATE ${TP}_services SET ${serviceUpdateSet} WHERE id=$${serviceFieldNames.length + 1} RETURNING *',
            [${serviceFieldNames.map(f => `${f} || null`).join(', ')}, service_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteService = async (req, res) => {
    try {
        const { service_id } = req.params;
        await db.query('DELETE FROM ${TP}_services WHERE id = $1', [service_id]);
        res.json({ message: 'Deleted service' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === CONTRACTS ===
exports.createContract = async (req, res) => {
    try {
        const { ${TP}_id } = req.params;
        const { name, valid_from, valid_to, notes } = req.body;
        const result = await db.query(
            'INSERT INTO ${TP}_contracts (${TP}_id, name, valid_from, valid_to, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [${TP}_id, name, valid_from || null, valid_to || null, notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateContract = async (req, res) => {
    try {
        const { contract_id } = req.params;
        const { name, valid_from, valid_to, notes } = req.body;
        const result = await db.query(
            'UPDATE ${TP}_contracts SET name=$1, valid_from=$2, valid_to=$3, notes=$4 WHERE id=$5 RETURNING *',
            [name, valid_from || null, valid_to || null, notes, contract_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteContract = async (req, res) => {
    try {
        const { contract_id } = req.params;
        await db.query('DELETE FROM ${TP}_contracts WHERE id = $1', [contract_id]);
        res.json({ message: 'Deleted contract' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === RATES ===
exports.createContractRate = async (req, res) => {
    try {
        const { contract_id } = req.params;
        const { service_id, ${rateDestructure} } = req.body;
        const result = await db.query(
            \`INSERT INTO ${TP}_contract_rates (contract_id, service_id, ${rateInsertCols}) VALUES ($1, $2, ${ratePlaceholders}) RETURNING *\`,
            [contract_id, service_id, ${rateDestructure}]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateContractRate = async (req, res) => {
    try {
        const { rate_id } = req.params;
        const { service_id, ${rateDestructure} } = req.body;
        const result = await db.query(
            \`UPDATE ${TP}_contract_rates SET service_id=$1, ${rateUpdateSet} WHERE id=$${rateFieldNames.length + 2} RETURNING *\`,
            [service_id, ${rateDestructure}, rate_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteContractRate = async (req, res) => {
    try {
        const { rate_id } = req.params;
        await db.query('DELETE FROM ${TP}_contract_rates WHERE id = $1', [rate_id]);
        res.json({ message: 'Deleted rate' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === NOTES ===
exports.getNotes = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT n.*, u.full_name as creator_name FROM ${TP}_notes n LEFT JOIN users u ON n.user_id = u.id WHERE n.${TP}_id = $1 ORDER BY n.created_at DESC',
            [req.params.${TP}_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addNote = async (req, res) => {
    const { ${TP}_id } = req.params;
    const { content } = req.body;
    const user_id = req.user.id;
    try {
        const result = await db.query(
            'INSERT INTO ${TP}_notes (${TP}_id, content, user_id) VALUES ($1, $2, $3) RETURNING *',
            [${TP}_id, content, user_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Add ${MC} Note Error:', err);
        res.status(500).json({ message: err.message });
    }
};
`;
}

// =====================================================
//  3. ROUTES FILE
// =====================================================
function generateRoutes() {
  return `const express = require('express');
const router = express.Router();
const controller = require('../controllers/${M}Controller');
const authenticateToken = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const ALLOWED_ROLES = ['admin', 'manager', 'operations'];

// ${MCS}
router.get('/', authenticateToken, roleCheck(ALLOWED_ROLES), controller.getAll);
router.post('/', authenticateToken, roleCheck(ALLOWED_ROLES), controller.create);
router.get('/:id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.getDetails);
router.put('/:id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.update);
router.delete('/:id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.delete);

// Contacts
router.post('/:${TP}_id/contacts', authenticateToken, roleCheck(ALLOWED_ROLES), controller.createContact);
router.put('/contacts/:contact_id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.updateContact);
router.delete('/contacts/:contact_id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.deleteContact);

// Services
router.post('/:${TP}_id/services', authenticateToken, roleCheck(ALLOWED_ROLES), controller.createService);
router.put('/services/:service_id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.updateService);
router.delete('/services/:service_id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.deleteService);

// Contracts
router.post('/:${TP}_id/contracts', authenticateToken, roleCheck(ALLOWED_ROLES), controller.createContract);
router.put('/contracts/:contract_id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.updateContract);
router.delete('/contracts/:contract_id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.deleteContract);

// Contract Rates
router.post('/contracts/:contract_id/rates', authenticateToken, roleCheck(ALLOWED_ROLES), controller.createContractRate);
router.put('/rates/:rate_id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.updateContractRate);
router.delete('/rates/:rate_id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.deleteContractRate);

// Notes
router.get('/:${TP}_id/notes', authenticateToken, roleCheck(ALLOWED_ROLES), controller.getNotes);
router.post('/:${TP}_id/notes', authenticateToken, roleCheck(ALLOWED_ROLES), controller.addNote);

module.exports = router;
`;
}

// =====================================================
//  4. GENERATE INTEGRATION GUIDE
// =====================================================
function generateIntegrationGuide() {
  return `
╔═══════════════════════════════════════════════════════╗
║  📋 INTEGRATION GUIDE — Module ${MCS}
╚═══════════════════════════════════════════════════════╝

Generated files:
  ✅ server/controllers/${M}Controller.js
  ✅ server/routes/${T}.js
  ✅ server/migrations/migration_${T}.js

═══ MANUAL STEPS REQUIRED ═══

1️⃣  REGISTER ROUTE in server/index.js:
   Add BEFORE the last line:
   ┌──────────────────────────────────────────────────┐
   │ const ${M}Routes = require('./routes/${T}');      │
   │ app.use('/api/${T}', ${M}Routes);                 │
   └──────────────────────────────────────────────────┘

2️⃣  ADD STATE in client/src/App.jsx:
   Near other "ToDelete" states:
   ┌──────────────────────────────────────────────────┐
   │ const [${M}ToDelete, set${MC}ToDelete] = useState(null); │
   └──────────────────────────────────────────────────┘

3️⃣  ADD DELETE FUNCTION in App.jsx:
   ┌──────────────────────────────────────────────────┐
   │ const confirmDelete${MC} = async () => {         │
   │   if (!${M}ToDelete) return;                      │
   │   setLoading(true);                               │
   │   try {                                           │
   │     const token = localStorage.getItem('token');  │
   │     await axios.delete(                           │
   │       \`/api/${T}/\${${M}ToDelete}?force=true\`,   │
   │       { headers: { Authorization: \`Bearer \${token}\` } } │
   │     );                                            │
   │     addToast('Đã xóa ${MV} thành công.');        │
   │     set${MC}ToDelete(null);                       │
   │     window.dispatchEvent(                         │
   │       new CustomEvent('reload${MCS}')             │
   │     );                                            │
   │   } catch (err) {                                 │
   │     addToast('Lỗi: ' + (err.response?.data?.message || err.message), 'error'); │
   │     set${MC}ToDelete(null);                       │
   │   } finally { setLoading(false); }                │
   │ };                                                │
   └──────────────────────────────────────────────────┘

4️⃣  ADD TAB RENDER in App.jsx (inside renderMainContent):
   ┌──────────────────────────────────────────────────┐
   │ {activeTab === '${T}' && (                        │
   │   <${MCS}Tab                                      │
   │     currentUser={user}                            │
   │     addToast={addToast}                           │
   │     handleDelete${MC}={(id) => set${MC}ToDelete(id)} │
   │   />                                             │
   │ )}                                                │
   └──────────────────────────────────────────────────┘

5️⃣  ADD TO DELETE MODAL condition in App.jsx:
   Add \`|| ${M}ToDelete\` to the modal condition and:
   ┌──────────────────────────────────────────────────┐
   │ set${MC}ToDelete(null);  // in overlay onClick    │
   │ if (${M}ToDelete) confirmDelete${MC}(); // in confirm │
   └──────────────────────────────────────────────────┘

6️⃣  FRONTEND FILES (copy & adapt from Restaurant):
   - client/src/tabs/${MCS}Tab.jsx
   - client/src/components/modals/${MC}DetailDrawer.jsx

═══ DEPLOY CHECKLIST ═══
□ 1. Build frontend: npm run build
□ 2. Rsync server/ + client/dist/ to VPS
□ 3. FIX PERMISSIONS: chown -R www-data:www-data
□ 4. Run migration: node migrations/migration_${T}.js
□ 5. Verify files + tables exist on VPS
□ 6. Node syntax check: node -e "require('./controllers/${M}Controller')"
□ 7. Restart PM2: pm2 restart crm-fittour
□ 8. Check logs: pm2 logs --lines 10 --nostream
□ 9. Smoke test on browser
`;
}

// =====================================================
//  MAIN — GENERATE ALL FILES
// =====================================================
const ROOT = path.resolve(__dirname, '..');

const outputs = [
  {
    path: path.join(ROOT, `controllers/${M}Controller.js`),
    content: generateController(),
    label: `controllers/${M}Controller.js`
  },
  {
    path: path.join(ROOT, `routes/${T}.js`),
    content: generateRoutes(),
    label: `routes/${T}.js`
  },
  {
    path: path.join(ROOT, `migrations/migration_${T}.js`),
    content: generateMigration(),
    label: `migrations/migration_${T}.js`
  }
];

console.log('');
console.log('╔═══════════════════════════════════════════════════════╗');
console.log(`║  🏗️  MODULE GENERATOR — ${MCS}`);
console.log('╚═══════════════════════════════════════════════════════╝');
console.log('');

let hasConflict = false;
for (const output of outputs) {
  if (fs.existsSync(output.path)) {
    console.log(`⚠️  File already exists: ${output.label}`);
    hasConflict = true;
  }
}

if (hasConflict) {
  const forceIndex = args.indexOf('--force');
  if (forceIndex === -1) {
    console.log('');
    console.log('❌ Some files already exist. Use --force to overwrite.');
    process.exit(1);
  }
}

for (const output of outputs) {
  const dir = path.dirname(output.path);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(output.path, output.content);
  console.log(`✅ Generated: ${output.label}`);
}

console.log('');
console.log(generateIntegrationGuide());
