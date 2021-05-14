import { dateNowPlusSeconds, takeMapEntries } from '../util.js';
import { Cache, TTLValue } from './cache';

export type CacheData = Map<string, TTLValue>;

export class InMemoryCache extends Cache {
    private readonly data: CacheData;
    public readonly evictionStrategy: EvictionStrategy;

    constructor(options: {
        ttlSeconds: number;
        maxCapacity: number;
        evictionStrategy: EvictionStrategy;
        data?: CacheData;
    }) {
        super(options);
        this.data = options.data ?? new Map();
        this.evictionStrategy = options.evictionStrategy;
    }

    async initialize(): Promise<void> {}

    async size(): Promise<number> {
        return this.data.size;
    }

    async get(key: string): Promise<TTLValue | undefined> {
        return this.data.get(key);
    }

    async getMany(skip: number, take: number): Promise<Array<[string, TTLValue]>> {
        const entries = takeMapEntries(this.data, skip, take);

        return entries;
    }

    async upsert(key: string, value: string): Promise<void> {
        if (!this.hasCapacity()) {
            this.evictionStrategy.evict(this.data);
        }

        const expiresAt = dateNowPlusSeconds(this.ttlSeconds).toISOString();
        const ttlValue = { value, expiresAt };
        this.data.set(key, ttlValue);
    }

    async delete(key: string): Promise<void> {
        this.data.delete(key);
    }

    async purge(): Promise<void> {
        this.data.clear();
    }

    private hasCapacity(): boolean {
        return this.data.size < this.maxCapacity;
    }
}

export abstract class EvictionStrategy {
    abstract evict(data: CacheData): void;
}

/**
 * Evicts a key based on the oldest ttl date value.
 */
export class LeastRecentlyUsedEvictionStrategy extends EvictionStrategy {
    public evict(data: CacheData): void {
        let leastRecentTTLTime = Number.MAX_SAFE_INTEGER;
        let leastRecentKey;
        for (const [key, TTLValue] of data.entries()) {
            const ttlTime = new Date(TTLValue.expiresAt).getTime();
            if (ttlTime < leastRecentTTLTime) {
                leastRecentTTLTime = ttlTime;
                leastRecentKey = key;
            }
        }

        if (leastRecentKey != undefined) {
            data.delete(leastRecentKey);
        }
    }
}

/**
 * Evicts a key based on the newest ttl date value.
 */
export class MostRecentlyUsedEvictionStrategy extends EvictionStrategy {
    public evict(data: CacheData): void {
        let mostRecentTTLTime = 0;
        let mostRecentKey;
        for (const [key, TTLValue] of data.entries()) {
            const ttlTime = new Date(TTLValue.expiresAt).getTime();
            if (ttlTime > mostRecentTTLTime) {
                mostRecentTTLTime = ttlTime;
                mostRecentKey = key;
            }
        }

        if (mostRecentKey != undefined) {
            data.delete(mostRecentKey);
        }
    }
}
