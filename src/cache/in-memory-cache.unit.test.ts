import tap from 'tap';
import { sleep } from '../util.js';
import {
    CacheData,
    EvictionStrategy,
    InMemoryCache,
    LeastRecentlyUsedEvictionStrategy,
    MostRecentlyUsedEvictionStrategy,
} from './in-memory-cache.js';

export function createInMemoryCache(options?: {
    maxCapacity?: number;
    ttlSeconds?: number;
    data?: CacheData;
    evictionStrategy?: EvictionStrategy;
}) {
    options = options ?? {};

    return new InMemoryCache({
        maxCapacity: options.maxCapacity ?? 1000,
        ttlSeconds: options.ttlSeconds ?? 60,
        evictionStrategy: options.evictionStrategy ?? new LeastRecentlyUsedEvictionStrategy(),
        data: options.data,
    });
}

tap.test(InMemoryCache.name + ': ' + LeastRecentlyUsedEvictionStrategy.name, (t) => {
    t.test('Evicts the least recent key when at capacity', async (t) => {
        const evictionStrategy = new LeastRecentlyUsedEvictionStrategy();
        const capacity = 3;
        const cache = createInMemoryCache({ maxCapacity: 3, evictionStrategy });
        for (let i = 0; i < capacity; i++) {
            await sleep(100);
            await cache.upsert(i.toString(), i.toString());
        }

        cache.upsert('new', 'new');

        const numberOfKeys = await cache.size();
        t.equal(numberOfKeys, capacity, 'Keys should be at capacity');
        const leastRecentEntry = await cache.get('0');
        t.equal(leastRecentEntry, undefined, 'Least recent key should be evicted');
    });

    t.end();
});

tap.test(InMemoryCache.name + ': ' + MostRecentlyUsedEvictionStrategy.name, (t) => {
    t.test('Evicts the most recent key when at capacity', async (t) => {
        const evictionStrategy = new MostRecentlyUsedEvictionStrategy();
        const capacity = 3;
        const cache = createInMemoryCache({ maxCapacity: capacity, evictionStrategy });
        for (let i = 0; i < capacity; i++) {
            await cache.upsert(i.toString(), i.toString());
            await sleep(100);
        }

        cache.upsert('new', 'new');

        const numberOfKeys = await cache.size();
        t.equal(numberOfKeys, capacity, 'Keys should be at capacity');
        const mostRecentEntry = await cache.get('2');
        t.equal(mostRecentEntry, undefined, 'Most recent key should be evicted');
    });

    t.end();
});
