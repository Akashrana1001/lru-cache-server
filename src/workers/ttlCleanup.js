const logger = require('../middleware/logger');

class TtlCleanupWorker {
    constructor(cacheInstance, intervalMs = 60000) {
        this.cacheInstance = cacheInstance;
        this.intervalMs = intervalMs;
        this.intervalId = null;
    }

    start() {
        if (this.intervalId) return;
        logger.info(`Starting background TTL cleanup worker (interval: ${this.intervalMs}ms)`);

        this.intervalId = setInterval(() => {
            const expiredCount = this.cacheInstance.cleanupExpiredKeys();
            if (expiredCount > 0) {
                logger.info(`Background worker cleared ${expiredCount} expired keys.`);
            }
        }, this.intervalMs);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            logger.info('Background TTL cleanup worker stopped.');
        }
    }
}

module.exports = TtlCleanupWorker;
