const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateKeys() {
    console.log('Generating RSA 2048-bit key pair...');
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });

    const kid = `fit-rsa-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex')}`;
    
    // Encode to base64 to avoid multiline string issues in .env
    const privateKeyBase64 = Buffer.from(privateKey).toString('base64');
    const publicKeyBase64 = Buffer.from(publicKey).toString('base64');

    console.log('\n✅ Keys generated successfully!\n');
    console.log('====================================================');
    console.log('ADD THE FOLLOWING LINES TO YOUR server/.env FILE:');
    console.log('====================================================\n');
    
    console.log(`JWT_ACTIVE_KID="${kid}"`);
    console.log(`JWT_PRIVATE_KEY="${privateKeyBase64}"`);
    console.log(`JWT_PUBLIC_KEY="${publicKeyBase64}"`);
    
    console.log('\n====================================================');
    console.log('⚠️ IMPORTANT: Do not share or commit these keys to Git!');
}

generateKeys();
