const express = require('express');
const router = express.Router();
const { getJwks } = require('../utils/jwks');

router.get('/jwks.json', (req, res) => {
    // Cache for 5 minutes (300 seconds) to balance performance and key rotation speed
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json(getJwks());
});

module.exports = router;
