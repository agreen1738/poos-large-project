import { MongoClient, Db } from 'mongodb';

let database: Db;

export async function connect_db(uri: string) {
    const client = new MongoClient(uri);
    await client.connect();
    database = client.db();
    console.log('Connected to MongoDB');
}

export function get_db(): Db {
    if (!database) {
        throw new Error('Database is not initialized');
    }

    return database;
}
