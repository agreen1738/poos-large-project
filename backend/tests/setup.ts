import request from 'supertest';
import app from '../src/app.js';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDB, disconnectDB, getDB } from '../src/database.js';

let server: MongoMemoryServer;
let uri: string;

async function setupTestDB() {
    server = await MongoMemoryServer.create();
    uri = server.getUri();
    process.env.DB_NAME = 'testDB';
    process.env.JWT_SECRET = 'testJwtSecret';
    await connectDB(uri);
}

async function tearDownTestDB() {
    await disconnectDB();
    await server.stop();
}

async function createTestUser() {
    await request(app).post('/api/register').send({
        firstName: 'Gradi',
        lastName: 'Mbuyi',
        email: 'gradimbuyi@outlook.com',
        phone: '555-555-5555',
        password: 'jestingaround',
        confirmPassword: 'jestingaround',
    });
}

async function changeTestUserEmailStatus() {
    const database = getDB();
    const collection = database.collection('User');
    await collection.updateOne({ email: 'gradimbuyi@outlook.com' }, { $set: { status: 'Confirmed' } });
}

async function getTestUserToken() {
    const res = await request(app)
        .post('/api/login')
        .send({ login: 'gradimbuyi@outlook.com', password: 'jestingaround' });

    return res.body.token;
}

export { setupTestDB, tearDownTestDB, createTestUser, changeTestUserEmailStatus, getTestUserToken };
