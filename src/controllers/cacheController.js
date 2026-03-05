const cacheService = require('../services/cacheService');

const getCache = (req, res) => {
    const { key } = req.params;
    const value = cacheService.get(key);

    if (value === null) {
        return res.status(404).json({ error: 'Key not found or expired' });
    }

    return res.status(200).json({ key, value });
};

const putCache = (req, res) => {
    const { key, value, ttl } = req.body;
    // Convert ttl from seconds to ms for internal logic consistency 
    // (assuming REST payload is in seconds as standard practice, or ms if preferred)
    // Converting TTL seconds -> ms for our internal cache
    const ttlMs = ttl ? ttl * 1000 : null;

    cacheService.put(key, value, ttlMs);
    return res.status(201).json({ message: 'Key saved successfully' });
};

const deleteCache = (req, res) => {
    const { key } = req.params;
    const deleted = cacheService.delete(key);

    if (deleted) {
        return res.status(200).json({ message: 'Key deleted successfully' });
    } else {
        return res.status(404).json({ error: 'Key not found' });
    }
};

const getStats = (req, res) => {
    return res.status(200).json({ stats: cacheService.getStats() });
};

module.exports = {
    getCache,
    putCache,
    deleteCache,
    getStats
};
