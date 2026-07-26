const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://fittour:Fittour123!@localhost:5432/fittour' }); // or use correct connection
