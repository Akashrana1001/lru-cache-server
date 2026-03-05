import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '10s', target: 50 },
        { duration: '20s', target: 50 },
        { duration: '10s', target: 0 },
    ],
};

const BASE_URL = 'http://localhost:3000';

export function setup() {
    const url = `${BASE_URL}/cache`;
    const payload = JSON.stringify({
        key: 'benchmark_key',
        value: 'benchmark_value',
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    http.post(url, payload, params);
}

export default function () {
    const url = `${BASE_URL}/cache/benchmark_key`;
    const res = http.get(url);

    check(res, {
        'is status 200': (r) => r.status === 200,
        'transaction time OK': (r) => r.timings.duration < 200,
    });

    sleep(0.1);
}
