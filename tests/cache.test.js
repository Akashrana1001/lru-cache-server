const request = require('supertest');
const app = require('../src/server');
const cacheService = require('../src/services/cacheService');

describe('LRU Cache API v2', () => {
    beforeEach(() => {
        // Clear cache before each test
        cacheService.getInternalCacheInstance().clear();
    });

    it('should insert and retrieve a key successfully', async () => {
        const postRes = await request(app)
            .post('/cache')
            .send({ key: 'user1', value: 'John Doe' });
        expect(postRes.statusCode).toEqual(201);

        const getRes = await request(app).get('/cache/user1');
        expect(getRes.statusCode).toEqual(200);
        expect(getRes.body.value).toEqual('John Doe');
    });

    it('should fail validation if value is missing', async () => {
        const res = await request(app)
            .post('/cache')
            .send({ key: 'user2' }); // missing value
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toEqual('Validation Error');
    });

    it('should return 404 for a missing key', async () => {
        const res = await request(app).get('/cache/missingKey');
        expect(res.statusCode).toEqual(404);
    });

    it('should delete an existing key', async () => {
        await request(app).post('/cache').send({ key: 'user3', value: 'Jane' });

        const deleteRes = await request(app).delete('/cache/user3');
        expect(deleteRes.statusCode).toEqual(200);

        const getRes = await request(app).get('/cache/user3');
        expect(getRes.statusCode).toEqual(404);
    });

    it('should expire keys based on TTL', async () => {
        await request(app)
            .post('/cache')
            .send({ key: 'tempKey', value: 'tempValue', ttl: 1 }); // 1 second TTL

        let res = await request(app).get('/cache/tempKey');
        expect(res.statusCode).toEqual(200);

        // Wait 1.1s
        await new Promise(r => setTimeout(r, 1100));

        res = await request(app).get('/cache/tempKey');
        expect(res.statusCode).toEqual(404);
    });

    it('should respect LRU eviction upon hitting capacity', async () => {
        // Cache capacity is default 1000 in service. Let's add 1001 items.
        for (let i = 0; i <= 1000; i++) {
            await cacheService.put(`k${i}`, `v${i}`);
        }

        // k0 should be evicted (LRU)
        const resFirst = await request(app).get('/cache/k0');
        expect(resFirst.statusCode).toEqual(404);

        // k1000 should exist
        const resLast = await request(app).get('/cache/k1000');
        expect(resLast.statusCode).toEqual(200);
    });
});
