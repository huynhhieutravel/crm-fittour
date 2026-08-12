const request = require('supertest');
const app = require('../index'); 
const db = require('../db');
const crypto = require('crypto');

async function createTestTour(max_participants) {
    const res = await db.query(
        `INSERT INTO tour_departures (code, max_participants, status) VALUES ($1, $2, 'Open') RETURNING id`,
        [`TEST-TOUR-${Date.now()}-${Math.floor(Math.random() * 1000)}`, max_participants]
    );
    return res.rows[0].id;
}

describe('Atomic Reservations (Hold Inventory) V2 Tests', () => {

    beforeAll(async () => {
        // Clean up test data if needed
    });

    afterAll(async () => {
        await db.pool.end();
    });

    test('Test D: Pax_count không hợp lệ (<= 0)', async () => {
        const tourId = await createTestTour(10);
        
        const res = await request(app)
            .post('/api/reservations')
            .set('Idempotency-Key', crypto.randomUUID())
            .send({
                tour_departure_id: tourId,
                pax_count: 0
            });
            
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/không hợp lệ/i);
    });

    test('Test E: Capacity = 0 (Tour SOLD OUT)', async () => {
        const tourId = await createTestTour(0); // 0 capacity
        
        const res = await request(app)
            .post('/api/reservations')
            .set('Idempotency-Key', crypto.randomUUID())
            .send({
                tour_departure_id: tourId,
                pax_count: 2
            });
            
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/SOLD_OUT/i);
    });

    test('Test A: Idempotency Key Reused - Same payload (20 req -> 1 success)', async () => {
        const tourId = await createTestTour(10);
        const idemKey = crypto.randomUUID();
        const payload = { tour_departure_id: tourId, pax_count: 2 };
        
        // Bắn 20 requests đồng thời
        const promises = [];
        for (let i = 0; i < 20; i++) {
            promises.push(
                request(app)
                    .post('/api/reservations')
                    .set('Idempotency-Key', idemKey)
                    .send(payload)
            );
        }
        
        const results = await Promise.all(promises);
        
        // 20 requests, all should return 201 (Idempotent returns same booking)
        const successes = results.filter(r => r.status === 201);
        const conflicts = results.filter(r => r.status === 409);
        
        expect(successes.length).toBe(20);
        expect(conflicts.length).toBe(0);

        // Verify DB only has 1 booking
        const dbRes = await db.query(`SELECT * FROM bookings WHERE idempotency_key = $1`, [idemKey]);
        expect(dbRes.rows.length).toBe(1);
    });

    test('Test A2: Idempotency Key Reused - Different Payload -> 409 Conflict', async () => {
        const tourId = await createTestTour(10);
        const idemKey = crypto.randomUUID();
        
        // Request 1
        const res1 = await request(app)
            .post('/api/reservations')
            .set('Idempotency-Key', idemKey)
            .send({ tour_departure_id: tourId, pax_count: 2 });
            
        expect(res1.status).toBe(201);
        
        // Request 2 (Different pax_count)
        const res2 = await request(app)
            .post('/api/reservations')
            .set('Idempotency-Key', idemKey)
            .send({ tour_departure_id: tourId, pax_count: 3 });
            
        expect(res2.status).toBe(409);
        expect(res2.body.error).toMatch(/IDEMPOTENCY_KEY_REUSED/i);
    });

    test('Test B: 20 reqs, 20 keys, 10 seats -> 10 success / 10 fail', async () => {
        const tourId = await createTestTour(10);
        
        const promises = [];
        for (let i = 0; i < 20; i++) {
            promises.push(
                request(app)
                    .post('/api/reservations')
                    .set('Idempotency-Key', crypto.randomUUID())
                    .send({ tour_departure_id: tourId, pax_count: 1 })
            );
        }
        
        const results = await Promise.all(promises);
        
        const successes = results.filter(r => r.status === 201);
        const failures = results.filter(r => r.status === 400 && r.body.error.match(/SOLD_OUT/i));
        
        expect(successes.length).toBe(10);
        expect(failures.length).toBe(10);
        
        const dbRes = await db.query(`SELECT SUM(pax_count) as total FROM bookings WHERE tour_departure_id = $1`, [tourId]);
        expect(Number(dbRes.rows[0].total)).toBe(10);
    });

    test('Test C: Expired Hold (Cron chưa chạy nhưng inventory vẫn trả về đúng)', async () => {
        const tourId = await createTestTour(5); // Capacity 5
        
        // Insert a manual booking directly to DB simulating an expired HOLD of 5 seats
        await db.query(`
            INSERT INTO bookings (tour_departure_id, booking_status, pax_count, expires_at)
            VALUES ($1, 'HELD', 5, CURRENT_TIMESTAMP - INTERVAL '1 minute')
        `, [tourId]);
        
        // Now try to book 2 seats. Even though there's a HELD booking for 5 seats, 
        // it's expired, so it shouldn't count towards inventory.
        const res = await request(app)
            .post('/api/reservations')
            .set('Idempotency-Key', crypto.randomUUID())
            .send({
                tour_departure_id: tourId,
                pax_count: 2
            });
            
        // Should succeed because the expired 5 seats were ignored
        expect(res.status).toBe(201);
        expect(res.body.data.status).toBe('HELD');
        
        // DB check
        const invRes = await db.query(`
            SELECT COALESCE(SUM(pax_count), 0) as sold
            FROM bookings
            WHERE tour_departure_id = $1 
            AND (
                booking_status IN ('CONFIRMED', 'COMPLETED')
                OR (
                    booking_status = 'HELD'
                    AND expires_at > CURRENT_TIMESTAMP
                )
            )
        `, [tourId]);
        
        // 2 active seats + 0 from expired = 2 total
        expect(Number(invRes.rows[0].sold)).toBe(2);
    });
});
