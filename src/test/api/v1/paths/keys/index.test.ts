import tap from 'tap';
import supertest from 'supertest';

import { createApp } from '../../../../../app';
import { CreateLogger } from '../../../../../logger.js';
import { InMemoryCache } from '../../../../../cache/in-memory-cache.js';
import { CacheService } from '../../../../../services/cache.js';
import { Application } from 'express';

tap.test('keys.deleteAll', (t) => {
    let app: Application;
    t.before(async () => {
        const cache = new InMemoryCache(100);
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
