import { Cache, TTLValue } from './cache';

type CacheData = Map<string, TTLValue>;

export class InMemoryCache extends Cache {
    private readonly data: CacheData;
    constructor(ttlSeconds: number, data?: CacheData) {
        super(ttlSeconds);
        this.data = data ?? new Map();
    }

    async get(key: string): Promise<TTLValue | undefined> {
        return this.data.get(key);
    }

    async upsert(key: string, value: string): Promise<void> {
        const ttlValue = { value, expiresAt: new Date().toISOString() };
        this.data.set(key, ttlValue);
    }

    async delete(key: string): Promise<void> {
        this.data.delete(key);
    }

    async purge(): Promise<void> {
        this.data.clear();
    }
}
