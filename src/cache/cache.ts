export type TTLValue = { value: string; expiresAt: string };

export abstract class Cache {
    public readonly ttlSeconds: number;
    public readonly maxCapacity: number;

    constructor(options: { ttlSeconds: number; maxCapacity: number }) {
        this.ttlSeconds = options.ttlSeconds;
        this.maxCapacity = options.maxCapacity;
    }

    abstract size(): Promise<number>;
    abstract get(key: string): Promise<TTLValue | undefined>;
    abstract getMany(skip: number, take: number): Promise<Array<[string, TTLValue]>>;
    abstract upsert(key: string, value: string): Promise<void>;
    abstract delete(key: string): Promise<void>;
    abstract purge(): Promise<void>;
}
