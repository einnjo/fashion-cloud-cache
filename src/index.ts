import { createApp } from './app';
import { InMemoryCache } from './cache/in-memory-cache.js';
import { config } from './config';
import { CreateLogger } from './logger.js';
import { CacheService } from './services/cache.js';

const logger = CreateLogger();
const inMemoryCache = new InMemoryCache(100);
const cacheService = new CacheService({ logger, cache: inMemoryCache });
const app = createApp({ logger, cacheService });

app.listen(config.PORT, config.HOST, () => {
    app.locals.logger.info(`Server listening at ${config.HOST}:${config.PORT}`);
});
