import { Db, MongoClient } from 'mongodb';
import tap from 'tap';
import { createClient } from '../db';
import { sleep } from '../util';
import {
    EvictionStrategy,
    LeastRecentlyUsedEvictionStrategy,
    MongoCache,
    MostRecentlyUsedEvictionStrategy,
} from './mongo-cache';

const TEST_COLLECTION = 'mongo_cache';
const TEST_DB = 'mongo_cache_test';

export async function createMongoCache(options?: {
    ttlSeconds?: number;
    maxCapacity?: number;
    mongo?: Db;
    collectionName?: string;
    evictionStrategy?: EvictionStrategy;
}) {
    options = options ?? {};

    const cache = new MongoCache({
        ttlSeconds: options.ttlSeconds ?? 60,
        maxCapacity: options.maxCapacity ?? 100,
        mongo: options.mongo ?? (await createTestClient()),
        collectionName: options.collectionName ?? TEST_COLLECTION,
        evictionStrategy: options.evictionStrategy ?? new LeastRecentlyUsedEvictionStrategy(),
    });

    await cache.initialize();

    return cache;
}

async function seedEntries(options: { client: MongoClient; entries: Array<any> }) {
    const { client, entries } = options;
    await client.db(TEST_DB).collection(TEST_COLLECTION).insertMany(entries);
}

async function createTestClient(): Promise<Db> {
    const client = await createClient();

    return client.db(TEST_DB);
}

tap.test(MongoCache.name + '.size()', (t) => {
    let cache: MongoCache;
    let client: MongoClient;
    t.beforeEach(async function () {
        client = await createClient();
        cache = await createMongoCache({ mongo: client.db(TEST_DB) });
    });

    t.afterEach(async function () {
        await client.close();
    });

    t.test('Returns 0 if empty', async (t) => {
        const size = await cache.size();
        t.equal(size, 0, 'Size is 0');
    });

    t.test('Returns the correct number of entries if populated', async (t) => {
        await seedEntries({
            client,
            entries: [
                { key: 'a', value: 'a', expiresAt: new Date().toISOString() },
                { key: 'b', value: 'b', expiresAt: new Date().toISOString() },
            ],
        });
        const size = await cache.size();
        t.equal(size, 2, 'Size is 2');
    });

    t.end();
});

tap.test(MongoCache.name + '.get()', (t) => {
    let cache: MongoCache;
    let client: MongoClient;
    t.beforeEach(async function () {
        client = await createClient();
        cache = await createMongoCache({ mongo: client.db(TEST_DB) });
    });

    t.afterEach(async function () {
        await client.close();
    });

    t.test('Returns undefined when entry does not exist', async (t) => {
        const entry = await cache.get('404');
        t.equal(entry, undefined, 'Entry is undefined');
    });

    t.test('Returns entry by key', async (t) => {
        const entry = { key: 'foo', value: 'bar', expiresAt: '2099-01-01T00:00:00.000Z' };
        seedEntries({
            client,
            entries: [entry],
        });
        const foundEntry = await cache.get(entry.key);
        t.equal(foundEntry?.value, entry.value, 'Value matches');
        t.equal(foundEntry?.expiresAt, entry.expiresAt, 'ExpiresAt matches');
    });

    t.end();
});

tap.test(MongoCache.name + '.getMany()', (t) => {
    let cache: MongoCache;
    let client: MongoClient;
    t.beforeEach(async function () {
        client = await createClient();
        cache = await createMongoCache({ mongo: client.db(TEST_DB) });
    });

    t.afterEach(async function () {
        await client.close();
    });

    t.test('Returns empty array when no entries', async (t) => {
        const entries = await cache.getMany(0, 10);
        t.equal(Array.isArray(entries), true, 'Entries is array');
        t.equal(entries.length, 0, 'Array is empty');
    });

    t.test('Returns specific range of entries', async (t) => {
        seedEntries({
            client,
            entries: [
                { key: '1', value: 'bar', expiresAt: '2099-01-01T00:00:00.000Z' },
                { key: '2', value: 'bar', expiresAt: '2099-01-01T00:00:00.000Z' },
                { key: '3', value: 'bar', expiresAt: '2099-01-01T00:00:00.000Z' },
                { key: '4', value: 'bar', expiresAt: '2099-01-01T00:00:00.000Z' },
            ],
        });
        const entries = await cache.getMany(1, 2);
        const keys = entries.map((e) => e[0]);
        t.same(keys, ['2', '3'], 'Specific range is returned');
    });

    t.end();
});

tap.test(MongoCache.name + '.upsert()', (t) => {
    let cache: MongoCache;
    let client: MongoClient;
    t.beforeEach(async function () {
        client = await createClient();
        cache = await createMongoCache({ mongo: client.db(TEST_DB) });
    });

    t.afterEach(async function () {
        await client.close();
    });

    t.test('Inserts a new entry', async (t) => {
        await cache.upsert('foo', 'bar');
        const inserted = await client
            .db(TEST_DB)
            .collection(TEST_COLLECTION)
            .findOne({ key: 'foo' });

        t.equal(inserted.value, 'bar', 'Entry was inserted');
    });

    t.test('Updates an existing entry', async (t) => {
        seedEntries({
            client,
            entries: [{ key: 'foo', value: 'original', expiresAt: '2099-01-01T00:00:00.000Z' }],
        });
        await cache.upsert('foo', 'updated');
        const inserted = await client
            .db(TEST_DB)
            .collection(TEST_COLLECTION)
            .findOne({ key: 'foo' });

        t.equal(inserted.value, 'updated', 'Entry was updated');
    });

    t.end();
});

tap.test(MongoCache.name + '.delete()', (t) => {
    let cache: MongoCache;
    let client: MongoClient;
    t.beforeEach(async function () {
        client = await createClient();
        cache = await createMongoCache({ mongo: client.db(TEST_DB) });
    });

    t.afterEach(async function () {
        await client.close();
    });

    t.test('Deletes an existing key', async (t) => {
        seedEntries({
            client,
            entries: [{ key: 'foo', value: 'bar', expiresAt: '2099-01-01T00:00:00.000Z' }],
        });
        await cache.delete('foo');
        const found = await client.db(TEST_DB).collection(TEST_COLLECTION).findOne({ key: 'foo' });

        t.equal(found, null, 'Entry was deleted');
    });
    t.test('No-op if key does not exist', async (_t) => {
        await cache.delete('404');
    });

    t.end();
});

tap.test(MongoCache.name + '.purge()', (t) => {
    let cache: MongoCache;
    let client: MongoClient;
    t.beforeEach(async function () {
        client = await createClient();
        cache = await createMongoCache({ mongo: client.db(TEST_DB) });
    });

    t.afterEach(async function () {
        await client.close();
    });

    t.test('Deletes all existing entries in the cach', async (t) => {
        seedEntries({
            client,
            entries: [
                { key: 'a', value: 'foo', expiresAt: '2099-01-01T00:00:00.000Z' },
                { key: 'b', value: 'bar', expiresAt: '2099-01-01T00:00:00.000Z' },
                { key: 'c', value: 'baz', expiresAt: '2099-01-01T00:00:00.000Z' },
            ],
        });
        await cache.purge();
        const found = await client.db(TEST_DB).collection(TEST_COLLECTION).find();
        const entries = found.toArray();

        t.same(entries, [], 'All entries were deleted');
    });

    t.end();
});

tap.test(MongoCache.name + ' ' + LeastRecentlyUsedEvictionStrategy.name, (t) => {
    let cache: MongoCache;
    let client: MongoClient;
    const maxCapacity = 5;
    t.beforeEach(async function () {
        client = await createClient();
        cache = await createMongoCache({
            mongo: client.db(TEST_DB),
            maxCapacity,
            evictionStrategy: new LeastRecentlyUsedEvictionStrategy(),
        });
    });

    t.afterEach(async function () {
        await client.close();
    });

    t.test('Collection does not go over maxCapacity', async (t) => {
        const entries = [
            { key: 'a', value: '1' },
            { key: 'b', value: '2' },
            { key: 'c', value: '3' },
            { key: 'd', value: '4' },
            { key: 'e', value: '5' },
            { key: 'f', value: '6' },
        ];
        for (const { key, value } of entries) {
            await cache.upsert(key, value);
        }
        const found = await client.db(TEST_DB).collection(TEST_COLLECTION).find().toArray();
        t.equal(found.length, 5, 'Collection does not go over capacity');
    });

    t.test('Least recent entry is evicted when over capacity', async (t) => {
        const entries = [
            { key: 'a', value: '1' },
            { key: 'b', value: '2' },
            { key: 'c', value: '3' },
            { key: 'd', value: '4' },
            { key: 'e', value: '5' },
            { key: 'f', value: '6' },
        ];
        for (const { key, value } of entries) {
            await cache.upsert(key, value);
            await sleep(1);
        }
        const found = await client.db(TEST_DB).collection(TEST_COLLECTION).find().toArray();
        const foundKeys = found.map((entry) => entry.key);
        const expectedKeys = entries.slice(1).map((entry) => entry.key);
        t.same(foundKeys, expectedKeys, 'Least recent entry is evicted');
    });

    t.end();
});

tap.test(MongoCache.name + ' ' + MostRecentlyUsedEvictionStrategy.name, (t) => {
    let cache: MongoCache;
    let client: MongoClient;
    const maxCapacity = 5;
    t.beforeEach(async function () {
        client = await createClient();
        cache = await createMongoCache({
            mongo: client.db(TEST_DB),
            maxCapacity,
            evictionStrategy: new MostRecentlyUsedEvictionStrategy(),
        });
    });

    t.afterEach(async function () {
        await client.close();
    });

    t.test('Collection does not go over maxCapacity', async (t) => {
        const entries = [
            { key: 'a', value: '1' },
            { key: 'b', value: '2' },
            { key: 'c', value: '3' },
            { key: 'd', value: '4' },
            { key: 'e', value: '5' },
            { key: 'f', value: '6' },
        ];
        for (const { key, value } of entries) {
            await cache.upsert(key, value);
        }
        const found = await client.db(TEST_DB).collection(TEST_COLLECTION).find().toArray();
        t.equal(found.length, 5, 'Collection does not go over capacity');
    });

    t.test('Least recent entry is evicted when over capacity', async (t) => {
        const entries = [
            { key: 'a', value: '1' },
            { key: 'b', value: '2' },
            { key: 'c', value: '3' },
            { key: 'd', value: '4' },
            { key: 'e', value: '5' },
            { key: 'f', value: '6' },
        ];
        for (const { key, value } of entries) {
            await cache.upsert(key, value);
            await sleep(1);
        }
        const found = await client.db(TEST_DB).collection(TEST_COLLECTION).find().toArray();
        const foundKeys = found.map((entry) => entry.key);
        const expectedKeys = entries.filter((entry) => entry.key !== 'e').map((entry) => entry.key);
        t.same(foundKeys, expectedKeys, 'Most recent entry is evicted');
    });

    t.end();
});
