import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let client: MongoClient | null = null;
let database: Db;
let DB_NAME = process.env.MONGO_DB_NAME;

export async function connect_db(uri: string) {
    if (client) {
        console.log('Already connected to MongoDB');
        return;
    }

    client = new MongoClient(uri);
    await client.connect();
    database = client.db(DB_NAME as string);
    console.log('Connected to MongoDB');
}

export function get_db(): Db {
    if (!database) {
        throw new Error('Database is not initialized');
    }

    return database;
}

export async function disconnect_db() {
    if (!client) {
        console.log('Not connected to MongoDB');
        return;
    }

    await client!.close();
    console.log('Disconnected from MongoDB');
    client = null;
}
