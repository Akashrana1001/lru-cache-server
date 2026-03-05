import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '10s', target: 100 }, // ramp up to 100 users
        { duration: '30s', target: 100 }, // hold 100 users for 30s
        { duration: '10s', target: 0 },   // ramp down to 0 users
    ],
    thresholds: {
        http_req_duration: ['p(95)<20'], // 95% of requests must complete below 20ms
    },
};

const BASE_URL = 'http://localhost:3000';

export function setup() {
    const url = `${BASE_URL}/cache`;
    const payload = JSON.stringify({
        key: 'load_test_key',
        value: 'load_test_data',
        ttl: 3600
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Seed the cache with the test key
    http.post(url, payload, params);
}

export default function () {
    const url = `${BASE_URL}/cache/load_test_key`;
    const res = http.get(url);

    check(res, {
        'is status 200': (r) => r.status === 200,
        'latency under 20ms': (r) => r.timings.duration < 20,
    });
}
