#!/usr/bin/env node
const http = require('http');

function apiCall(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost', port: 5001, path, method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    const req = http.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  // Login as sale1
  const loginRes = await apiCall('POST', '/api/auth/login', { username: 'sale1', password: 'admin123' });
  if (!loginRes.body.token) { console.log('Login failed:', loginRes.body); return; }
  const token = loginRes.body.token;
  console.log('✅ sale1 logged in');
  
  // Test /api/permissions/my
  const myPerms = await apiCall('GET', '/api/permissions/my', null, token);
  console.log(`\nRole: ${myPerms.body.role}`);
  console.log(`Modules: ${Object.keys(myPerms.body.permissions).length}`);
  
  for (const mod of ['leads', 'op_tours', 'bookings', 'vouchers', 'tours', 'users']) {
    const perms = myPerms.body.permissions[mod] || {};
    const granted = Object.entries(perms).filter(([k,v]) => v).map(([k]) => k);
    console.log(`  ${mod}: [${granted.join(', ')}]`);
  }

  // Test API access
  console.log('\n--- API Access Tests ---');
  
  const leadsRes = await apiCall('GET', '/api/leads', null, token);
  console.log(`GET /api/leads: ${leadsRes.status} (expect 200)`);
  
  const rolesRes = await apiCall('GET', '/api/users/roles', null, token);
  console.log(`GET /api/users/roles: ${rolesRes.status} (expect 403)`);
  
  const toursRes = await apiCall('GET', '/api/tours', null, token);
  console.log(`GET /api/tours: ${toursRes.status} (expect 200)`);
  
  const guidesRes = await apiCall('GET', '/api/guides', null, token);
  console.log(`GET /api/guides: ${guidesRes.status} (expect 200)`);
  
  const deleteLeadRes = await apiCall('DELETE', '/api/leads/99999', null, token);
  console.log(`DELETE /api/leads/99999: ${deleteLeadRes.status} (expect 403 - sales cant delete)`);

  const opToursRes = await apiCall('GET', '/api/op-tours', null, token);
  console.log(`GET /api/op-tours: ${opToursRes.status} (expect 200 - sales has view_own)`);
  
  const createOpTourRes = await apiCall('POST', '/api/op-tours', { name: 'test' }, token);
  console.log(`POST /api/op-tours: ${createOpTourRes.status} (expect 403 - sales cant create tour)`);
  
  // Test /api/permissions/master
  const masterRes = await apiCall('GET', '/api/permissions/master', null, token);
  console.log(`\nGET /api/permissions/master: ${masterRes.status}, count=${Array.isArray(masterRes.body) ? masterRes.body.length : 'N/A'}`);
  
  console.log('\n✅ Phase 2 backend tests complete!');
}

main().catch(console.error);
