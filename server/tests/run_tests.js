const request = require('supertest');
const { app } = require('../index'); 
const db = require('../db');
const crypto = require('crypto');
const assert = require('assert');

async function createTestTour(max_participants) {
    const res = await db.query(
        `INSERT INTO tour_departures (code, max_participants, status, start_date) VALUES ($1, $2, 'Open', CURRENT_DATE) RETURNING id`,
        [`TEST-TOUR-${Date.now()}-${Math.floor(Math.random() * 1000)}`, max_participants]
    );
    return res.rows[0].id;
}

async function runTests() {
    console.log("Starting Atomic Reservations V2 Tests...");
    let passed = 0;
    let failed = 0;

    try {
        // Test D
        console.log("Running Test D: Pax_count không hợp lệ (<= 0)...");
        const tourIdD = await createTestTour(10);
        const resD = await request(app)
            .post('/api/reservations')
            .set('Idempotency-Key', crypto.randomUUID())
            .send({ tour_departure_id: tourIdD, pax_count: 0 });
        assert.strictEqual(resD.status, 400);
        passed++;
        console.log("✅ Test D Passed");

        // Test E
        console.log("Running Test E: Capacity = 0...");
        const tourIdE = await createTestTour(0);
        const resE = await request(app)
            .post('/api/reservations')
            .set('Idempotency-Key', crypto.randomUUID())
            .send({ tour_departure_id: tourIdE, pax_count: 2 });
        assert.strictEqual(resE.status, 400);
        passed++;
        console.log("✅ Test E Passed");

        // Test A
        console.log("Running Test A: Idempotency Key Reused - Same payload (20 req -> 1 success)...");
        const tourIdA = await createTestTour(10);
        const idemKeyA = crypto.randomUUID();
        const payloadA = { tour_departure_id: tourIdA, pax_count: 2 };
        const promisesA = [];
        for (let i = 0; i < 20; i++) {
            promisesA.push(request(app).post('/api/reservations').set('Idempotency-Key', idemKeyA).send(payloadA));
        }
        const resultsA = await Promise.all(promisesA);
        const successesA = resultsA.filter(r => r.status === 201);
        const conflictsA = resultsA.filter(r => r.status === 409);
        assert.strictEqual(successesA.length, 20);
        assert.strictEqual(conflictsA.length, 0);
        const dbResA = await db.query(`SELECT * FROM bookings WHERE idempotency_key = $1`, [idemKeyA]);
        assert.strictEqual(dbResA.rows.length, 1);
        passed++;
        console.log("✅ Test A Passed");

        // Test A2
        console.log("Running Test A2: Idempotency Key Reused - Different Payload -> 409 Conflict...");
        const idemKeyA2 = crypto.randomUUID();
        const resA2_1 = await request(app).post('/api/reservations').set('Idempotency-Key', idemKeyA2).send({ tour_departure_id: tourIdA, pax_count: 2 });
        assert.strictEqual(resA2_1.status, 201);
        const resA2_2 = await request(app).post('/api/reservations').set('Idempotency-Key', idemKeyA2).send({ tour_departure_id: tourIdA, pax_count: 3 });
        assert.strictEqual(resA2_2.status, 409);
        passed++;
        console.log("✅ Test A2 Passed");

        // Test B
        console.log("Running Test B: 20 reqs, 20 keys, 10 seats -> 10 success / 10 fail...");
        const tourIdB = await createTestTour(10);
        const promisesB = [];
        for (let i = 0; i < 20; i++) {
            promisesB.push(request(app).post('/api/reservations').set('Idempotency-Key', crypto.randomUUID()).send({ tour_departure_id: tourIdB, pax_count: 1 }));
        }
        const resultsB = await Promise.all(promisesB);
        const successesB = resultsB.filter(r => r.status === 201);
        const failuresB = resultsB.filter(r => r.status === 400);
        assert.strictEqual(successesB.length, 10);
        assert.strictEqual(failuresB.length, 10);
        const dbResB = await db.query(`SELECT SUM(pax_count) as total FROM bookings WHERE tour_departure_id = $1`, [tourIdB]);
        assert.strictEqual(Number(dbResB.rows[0].total), 10);
        passed++;
        console.log("✅ Test B Passed");

        // Test C
        console.log("Running Test C: Expired Hold...");
        const tourIdC = await createTestTour(5);
        await db.query(`INSERT INTO bookings (tour_departure_id, booking_status, pax_count, expires_at, booking_code, total_price) VALUES ($1, 'HELD', 5, CURRENT_TIMESTAMP - INTERVAL '1 minute', $2, 0)`, [tourIdC, `EX-${Date.now()}`]);
        const resC = await request(app).post('/api/reservations').set('Idempotency-Key', crypto.randomUUID()).send({ tour_departure_id: tourIdC, pax_count: 2 });
        assert.strictEqual(resC.status, 201);
        const invResC = await db.query(`SELECT COALESCE(SUM(pax_count), 0) as sold FROM bookings WHERE tour_departure_id = $1 AND (booking_status IN ('CONFIRMED', 'COMPLETED') OR (booking_status = 'HELD' AND expires_at > CURRENT_TIMESTAMP))`, [tourIdC]);
        assert.strictEqual(Number(invResC.rows[0].sold), 2);
        passed++;
        console.log("✅ Test C Passed");

    } catch (error) {
        console.error("❌ Test Failed!", error);
        failed++;
    } finally {
        await db.pool.end();
        console.log(`\nResults: ${passed} passed, ${failed} failed.`);
        process.exit(failed > 0 ? 1 : 0);
    }
}

runTests();
