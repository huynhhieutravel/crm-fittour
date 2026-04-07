const d = new Date('2026-04-07T17:00:00.000Z');
console.log(d.toISOString().split('T')[0]); // 2026-04-07
console.log(d.toLocaleDateString('en-CA')); // YYYY-MM-DD
console.log(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`); // 2026-04-08
