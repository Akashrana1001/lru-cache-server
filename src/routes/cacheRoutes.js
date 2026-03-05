const express = require('express');
const router = express.Router();
const validateCachePayload = require('../middleware/validateCache');
const { getCache, putCache, deleteCache, getStats } = require('../controllers/cacheController');

// Define API constraints with validation middleware mapping
router.post('/cache', validateCachePayload, putCache);
router.get('/cache/:key', getCache);
router.delete('/cache/:key', deleteCache);
router.get('/stats', getStats);

module.exports = router;
