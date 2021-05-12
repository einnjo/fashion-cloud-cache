import tap from 'tap';
import supertest from 'supertest';

import { createApp } from '../../../../../app';
import { CreateLogger } from '../../../../../logger.js';
import { InMemoryCache } from '../../../../../cache/in-memory-cache.js';
import { CacheService } from '../../../../../services/cache.js';
import { Application } from 'express';
import { TTLValue } from '../../../../../cache/cache.js';

tap.test('keys.getKeyById', (t) => {
    let app: Application;

    t.before(async () => {
        const fixture = new Map<string, TTLValue>();
        fixture.set('existing', {
            value: 'existingValue',
            expiresAt: new Date(2999, 1, 1).toISOString(),
        });
        const inMemoryCache = new InMemoryCache(100, fixture);

        const logger = CreateLogger();
        const cacheService = new CacheService({ logger, cache: inMemoryCache });
        app = createApp({ logger, cacheService });
    });
    t.test('Returns the value of a key when it exists', async (t) => {
        const key = 'existing';
        const result = await supertest(app)
            .get(`/v1/keys/${key}`)
            .set('Accept', 'application/json');
        t.equal(result.statusCode, 200, 'Response code is OK');
        t.equal(result.body.key, key);
        t.equal(result.body.value, 'existingValue');
    });

    t.end();
});

tap.test('keys.upsert', (t) => {
    let app: Application;
    t.before(async () => {
        const cache = new InMemoryCache(100);
        const logger = CreateLogger();
        const cacheService = new CacheService({ logger, cache });
        app = createApp({ logger, cacheService });
    });
    t.test('Upserts a key', async (t) => {
        const key = 'newKey';
        const value = 'newValue';
        const result = await supertest(app)
            .put(`/v1/keys/${key}`)
            .set('Accept', 'application/json')
            .send({ value });
        t.equal(result.statusCode, 204, 'Response code is No Content');
    });

    t.end();
});
