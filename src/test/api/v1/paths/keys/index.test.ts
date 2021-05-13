import tap from 'tap';
import supertest from 'supertest';

import { createApp } from '../../../../../app';
import { CreateLogger } from '../../../../../logger.js';
import { CacheService } from '../../../../../services/cache.js';
import { Application } from 'express';
import { TTLValue } from '../../../../../cache/cache.js';
import { createInMemoryCache } from '../../../../../cache/in-memory-cache.unit.test.js';

tap.test('keys.deleteAll', (t) => {
    let app: Application;
    t.before(async () => {
        const cache = createInMemoryCache();
        const logger = CreateLogger();
        const cacheService = new CacheService({ logger, cache });
        app = createApp({ logger, cacheService });
    });
    t.test('Deletes all keys', async (t) => {
        const result = await supertest(app).delete('/v1/keys').set('Accept', 'application/json');
        t.equal(result.statusCode, 204, 'Response code is No Content');
    });

    t.end();
});

tap.test('keys.getMany', (t) => {
    let app: Application;
    t.before(async () => {
        const data = new Map<string, TTLValue>();
        for (let i = 0; i < 100; i++) {
            data.set('key-' + i, {
                value: 'value-' + i,
                expiresAt: new Date(2999, 1, 1).toISOString(),
            });
        }
        const cache = createInMemoryCache({ data });

        const logger = CreateLogger();
        const cacheService = new CacheService({ logger, cache });
        app = createApp({ logger, cacheService });
    });
    t.test('Gets many keys', async (t) => {
        const result = await supertest(app)
            .get('/v1/keys')
            .set('Accept', 'application/json')
            .query({ skip: 0, take: 10 });
        t.equal(result.statusCode, 200, 'Response code is Ok');
        t.same(result.body, {
            data: [
                { key: 'key-0', value: 'value-0' },
                { key: 'key-1', value: 'value-1' },
                { key: 'key-2', value: 'value-2' },
                { key: 'key-3', value: 'value-3' },
                { key: 'key-4', value: 'value-4' },
                { key: 'key-5', value: 'value-5' },
                { key: 'key-6', value: 'value-6' },
                { key: 'key-7', value: 'value-7' },
                { key: 'key-8', value: 'value-8' },
                { key: 'key-9', value: 'value-9' },
            ],
        });
    });

    t.end();
});
