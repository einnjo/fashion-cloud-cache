import { Collection, Db } from 'mongodb';
import { dateNowPlusSeconds } from '../util';
import { Cache, TTLValue } from './cache';

export class MongoCache extends Cache {
    private readonly mongo: Db;
    public readonly collectionName: string;
    public readonly evictionStrategy: EvictionStrategy;

    constructor(options: {
        ttlSeconds: number;
        maxCapacity: number;
        mongo: Db;
        collectionName: string;
        evictionStrategy: EvictionStrategy;
    }) {
        super(options);

        this.mongo = options.mongo;
        this.collectionName = options.collectionName;
        this.evictionStrategy = options.evictionStrategy;
    }

    public async initialize(): Promise<void> {
        await this.mongo.dropCollection(this.collectionName);
        await this.mongo.createCollection(this.collectionName);
        await this.collection.createIndex({ key: 1 }, { unique: true });
        await this.collection.createIndex({ expiredAt: 1 });
    }

    private get collection() {
        return this.mongo.collection(this.collectionName);
    }

    async size(): Promise<number> {
        const count = await this.collection.countDocuments();

        return count;
    }

    async get(key: string): Promise<TTLValue | undefined> {
        const entry = await this.collection.findOne({ key });

        if (entry == undefined) {
            return undefined;
        }

        return { value: entry.value, expiresAt: entry.expiresAt };
    }

    async getMany(skip: number, take: number): Promise<[string, TTLValue][]> {
        const entries = await this.collection.find().skip(skip).limit(take).toArray();

        return entries.map((entry) => {
            return [entry.key, { value: entry.value, expiresAt: entry.expiresAt }];
        });
    }

    async upsert(key: string, value: string): Promise<void> {
        const hasCapacity = await this.hasCapacity();
        if (!hasCapacity) {
            await this.evictionStrategy.evict(this.collection);
        }

        await this.collection.replaceOne(
            { key },
            { key, value, expiresAt: dateNowPlusSeconds(this.ttlSeconds) },
            { upsert: true },
        );
    }

    async delete(key: string): Promise<void> {
        await this.collection.deleteOne({ key });
    }

    async purge(): Promise<void> {
        await this.collection.deleteMany({});
    }

    async hasCapacity(): Promise<boolean> {
        const size = await this.size();

        return size < this.maxCapacity;
    }
}

export abstract class EvictionStrategy {
    abstract evict(collection: Collection): Promise<void>;
}

/**
 * Evicts a key based on the oldest ttl date value.
 */
export class LeastRecentlyUsedEvictionStrategy extends EvictionStrategy {
    public async evict(collection: Collection): Promise<void> {
        const [evictionCandidate] = await collection
            .find({})
            .sort({ expiredAt: 1 })
            .limit(1)
            .toArray();
        if (evictionCandidate != null) {
            await collection.deleteOne({ _id: evictionCandidate._id });
        }
    }
}

/**
 * Evicts a key based on the newest ttl date value.
 */
export class MostRecentlyUsedEvictionStrategy extends EvictionStrategy {
    public async evict(collection: Collection): Promise<void> {
        const [evictionCandidate] = await collection
            .find({})
            .sort({ expiredAt: -1 })
            .limit(1)
            .toArray();
        if (evictionCandidate != null) {
            await collection.deleteOne({ _id: evictionCandidate._id });
        }
    }
}
