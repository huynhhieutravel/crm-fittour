const fs = require('fs');
const readline = require('readline');

// Usage: node auth_metrics_dashboard.js <path_to_log_file>
// Or pipe: cat ~/.pm2/logs/crm-fittour-out.log | node auth_metrics_dashboard.js

const logFilePath = process.argv[2];

const stats = {
    HS256: { success: 0, failed: 0, users: new Set() },
    RS256: { success: 0, failed: 0, users: new Set() },
    unknown: { success: 0, failed: 0, users: new Set() }
};

let linesParsed = 0;
let parseErrors = 0;

function processLine(line) {
    // Example: [AUTH METRIC] alg=HS256 kid=none user_id=142 success=true
    // Example: [AUTH METRIC] alg=unknown kid=none success=false reason="Invalid token format"
    const match = line.match(/\[AUTH METRIC\] alg=([a-zA-Z0-9]+) kid=([a-zA-Z0-9-]+) (?:user_id=(\d+) )?success=(true|false)/);
    
    if (match) {
        const [, alg, kid, userId, successStr] = match;
        const success = successStr === 'true';
        
        let statGroup = stats[alg];
        if (!statGroup) {
            statGroup = stats.unknown;
        }

        if (success) {
            statGroup.success++;
        } else {
            statGroup.failed++;
        }

        if (userId) {
            statGroup.users.add(userId);
        }
        linesParsed++;
    }
}

function printDashboard() {
    console.log('\n=========================================');
    console.log('             AUTH METRICS                ');
    console.log('=========================================\n');

    console.log('HS256');
    console.log(`  Success: ${stats.HS256.success}`);
    console.log(`  Failed:  ${stats.HS256.failed}\n`);

    console.log('RS256');
    console.log(`  Success: ${stats.RS256.success}`);
    console.log(`  Failed:  ${stats.RS256.failed}\n`);
    
    console.log('Unknown / Invalid');
    console.log(`  Success: ${stats.unknown.success}`);
    console.log(`  Failed:  ${stats.unknown.failed}\n`);

    console.log('Unique users:');
    console.log(`  RS256: ${stats.RS256.users.size}`);
    console.log(`  HS256: ${stats.HS256.users.size}`);
    console.log('\n-----------------------------------------');
    console.log(`Total Metrics Parsed: ${linesParsed}`);
}

if (logFilePath) {
    if (!fs.existsSync(logFilePath)) {
        console.error(`Error: File not found: ${logFilePath}`);
        process.exit(1);
    }
    const rl = readline.createInterface({
        input: fs.createReadStream(logFilePath),
        crlfDelay: Infinity
    });
    rl.on('line', processLine);
    rl.on('close', printDashboard);
} else {
    // Read from stdin
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });
    rl.on('line', processLine);
    rl.on('close', printDashboard);
}
