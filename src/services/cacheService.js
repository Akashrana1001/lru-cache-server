const LRUCache = require('../cache/LRUCache');
const logger = require('../middleware/logger');

class CacheService {
    constructor(capacity = 1000) {
        this.cache = new LRUCache(capacity);
        logger.info(`CacheService initialized with capacity ${capacity}`);
    }

    get(key) {
        const start = process.hrtime.bigint();
        const value = this.cache.get(key);
        const end = process.hrtime.bigint();

        if (value !== null) {
            logger.info(`Cache HIT for key: ${key}`, { latencyNs: (end - start).toString() });
            return value;
        }

        logger.info(`Cache MISS for key: ${key}`);
        return null;
    }

    put(key, value, ttlMs = null) {
        this.cache.put(key, value, ttlMs);
        logger.info(`Cache SET for key: ${key}`);
    }

    delete(key) {
        const deleted = this.cache.delete(key);
        if (deleted) {
            logger.info(`Cache DELETE for key: ${key}`);
        }
        return deleted;
    }

    getStats() {
        return this.cache.getStats();
    }

    getInternalCacheInstance() {
        return this.cache;
    }
}

// Export single instance globally
module.exports = new CacheService(1000);
