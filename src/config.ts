import { cleanEnv, str, port, host, num } from 'envalid';
import DotEnv from 'dotenv';

import { CacheEvictionStrategies, CacheKinds } from './cache/cache';

DotEnv.config();

export const config = cleanEnv(process.env, {
    APP: str(),
    PORT: port(),
    NODE_ENV: str({ choices: ['development', 'test', 'production', 'staging'] }),
    HOST: host(),
    TZ: str({ default: 'utc' }),
    CACHE_KIND: str({ choices: [CacheKinds.IN_MEMORY, CacheKinds.MONGO] }),
    CACHE_EVICTION_STRATEGY: str({
        choices: [
            CacheEvictionStrategies.LEAST_RECENTLY_USED,
            CacheEvictionStrategies.MOST_RECENTLY_USED,
        ],
    }),
    CACHE_TTL_SECONDS: num(),
    CACHE_MAX_CAPACITY: num(),
    DB_URI: str(),
    DB_NAME: str(),
    DB_COLLECTION: str(),
});
