export type TTLValue = { value: string; expiresAt: string };

export abstract class Cache {
    public readonly ttlSeconds: number;

    constructor(ttlSeconds: number) {
        this.ttlSeconds = ttlSeconds;
    }

    abstract get(key: string): Promise<TTLValue | undefined>;
    abstract getMany(skip: number, take: number): Promise<Array<[string, TTLValue]>>;
    abstract upsert(key: string, value: string): Promise<void>;
    abstract delete(key: string): Promise<void>;
    abstract purge(): Promise<void>;
}
