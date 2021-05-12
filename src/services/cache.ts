import P from 'pino';

import { Cache } from '../cache/cache';
import { dateIsInPast } from '../util.js';

export class CacheService {
    private readonly logger: P.Logger;
    private readonly cache: Cache;

    constructor(options: { logger: P.Logger; cache: Cache }) {
        this.logger = options.logger;
        this.cache = options.cache;
    }

    async getKey(key: string): Promise<string> {
        const found = await this.cache.get(key);
        const isCacheMiss = found == undefined || this.ttlExpired(found.expiresAt);
        if (isCacheMiss) {
            this.logger.info('Cache miss');

            const value = this.randomString();
            await this.cache.upsert(key, value);

            return value;
        }

        this.logger.info('Cache hit');

        return found!.value;
    }

    async upsertKey(key: string, value: string): Promise<void> {
        await this.cache.upsert(key, value);
    }

    async deleteKey(key: string): Promise<void> {
        await this.cache.delete(key);
    }

    async deleteAllKeys(): Promise<void> {
        await this.cache.purge();
    }

    private randomString(): string {
        return new Date().getTime().toString();
    }

    private ttlExpired(expiresAt: string): boolean {
        return dateIsInPast(new Date(expiresAt));
    }
}
