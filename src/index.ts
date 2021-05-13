import { createApp } from './app';
import { InMemoryCache, LeastRecentlyUsedEvictionStrategy } from './cache/in-memory-cache.js';
import { config } from './config';
import { CreateLogger } from './logger.js';
import { CacheService } from './services/cache.js';

const logger = CreateLogger();
const inMemoryCache = new InMemoryCache({
    maxCapacity: 1000,
    ttlSeconds: 60,
    evictionStrategy: new LeastRecentlyUsedEvictionStrategy(),
});
const cacheService = new CacheService({ logger, cache: inMemoryCache });
const app = createApp({ logger, cacheService });

app.listen(config.PORT, config.HOST, () => {
    app.locals.logger.info(`Server listening at ${config.HOST}:${config.PORT}`);
});
