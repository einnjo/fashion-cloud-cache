import { MongoClient } from 'mongodb';

import { config } from './config';

export async function createClient() {
    const client = new MongoClient(config.DB_URI).connect();

    return client;
}
