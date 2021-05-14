import { createApp } from './app';
import { CacheEvictionStrategies, CacheKinds } from './cache/cache';
import {
    InMemoryCache,
    LeastRecentlyUsedEvictionStrategy as InMemoryLeastRecent,
    MostRecentlyUsedEvictionStrategy as InMemoryMostRecent,
} from './cache/in-memory-cache.js';
import {
    LeastRecentlyUsedEvictionStrategy as MongoLeastRecent,
    MongoCache,
    MostRecentlyUsedEvictionStrategy as MongoMostRecent,
} from './cache/mongo-cache';
import { config } from './config';
import { createClient } from './db';
import { CreateLogger } from './logger.js';
import { CacheService } from './services/cache.js';

const inMemoryCacheEvictionStrategies = {
    [CacheEvictionStrategies.LEAST_RECENTLY_USED]: new InMemoryLeastRecent(),
    [CacheEvictionStrategies.MOST_RECENTLY_USED]: new InMemoryMostRecent(),
};

const mongoCacheEvictionStrategies = {
    [CacheEvictionStrategies.LEAST_RECENTLY_USED]: new MongoLeastRecent(),
    [CacheEvictionStrategies.MOST_RECENTLY_USED]: new MongoMostRecent(),
};

async function runApp() {
    const client = await createClient();
    const caches = {
        [CacheKinds.IN_MEMORY]: new InMemoryCache({
            maxCapacity: config.CACHE_MAX_CAPACITY,
            ttlSeconds: config.CACHE_TTL_SECONDS,
            evictionStrategy:
                inMemoryCacheEvictionStrategies[
                    config.CACHE_EVICTION_STRATEGY as CacheEvictionStrategies
                ],
        }),
        [CacheKinds.MONGO]: new MongoCache({
            maxCapacity: config.CACHE_MAX_CAPACITY,
            ttlSeconds: config.CACHE_TTL_SECONDS,
            mongo: client.db(config.DB_NAME),
            collectionName: config.DB_COLLECTION,
            evictionStrategy:
                mongoCacheEvictionStrategies[
                    config.CACHE_EVICTION_STRATEGY as CacheEvictionStrategies
                ],
        }),
    };
    await caches[config.CACHE_KIND as CacheKinds].initialize();
    const logger = CreateLogger();
    const cacheService = new CacheService({
        logger,
        cache: caches[config.CACHE_KIND as CacheKinds],
    });

    const app = createApp({ logger, cacheService });
    app.listen(config.PORT, config.HOST, () => {
        app.locals.logger.info(`Server listening at ${config.HOST}:${config.PORT}`);
    });
}

runApp();
