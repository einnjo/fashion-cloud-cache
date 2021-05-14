import { createApp } from './app';
import { CacheEvictionStrategies } from './cache/cache';
import {
    InMemoryCache,
    LeastRecentlyUsedEvictionStrategy,
    MostRecentlyUsedEvictionStrategy,
} from './cache/in-memory-cache.js';
import { config } from './config';
import { CreateLogger } from './logger.js';
import { CacheService } from './services/cache.js';

const cacheEvictonStrategies = {
    [CacheEvictionStrategies.LEAST_RECENTLY_USED]: new LeastRecentlyUsedEvictionStrategy(),
    [CacheEvictionStrategies.MOST_RECENTLY_USED]: new MostRecentlyUsedEvictionStrategy(),
};

const inMemoryCache = new InMemoryCache({
    maxCapacity: config.CACHE_MAX_CAPACITY,
    ttlSeconds: config.CACHE_TTL_SECONDS,
    evictionStrategy:
        cacheEvictonStrategies[config.CACHE_EVICTION_STRATEGY as CacheEvictionStrategies],
});

const logger = CreateLogger();
const cacheService = new CacheService({ logger, cache: inMemoryCache });

const app = createApp({ logger, cacheService });
app.listen(config.PORT, config.HOST, () => {
    app.locals.logger.info(`Server listening at ${config.HOST}:${config.PORT}`);
});
