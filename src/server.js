const express = require('express');
const cacheRoutes = require('./routes/cacheRoutes');
const logger = require('./middleware/logger');
const TtlCleanupWorker = require('./workers/ttlCleanup');
const cacheService = require('./services/cacheService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Request Logging Middleware
app.use((req, res, next) => {
    logger.info(`Incoming Request: ${req.method} ${req.originalUrl}`);
    next();
});

// Load Routes
app.use('/', cacheRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    logger.error(`Unhandled Error: ${err.message}`, { stack: err.stack });
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start Background Worker using internal cache pointer
const worker = new TtlCleanupWorker(cacheService.getInternalCacheInstance(), 60000);
worker.start();

// Handle graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully.');
    worker.stop();
    process.exit(0);
});

if (require.main === module) {
    app.listen(PORT, () => {
        logger.info(`LRU Cache Server v2 running on port ${PORT}`);
    });
}

module.exports = app;
