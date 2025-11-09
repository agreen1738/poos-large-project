import request from 'supertest';
import app from '../src/app.js';
import { Messages } from '../src/utils/messageHandler.js';
import { changeTestUserEmailStatus, createTestUser, getTestUserToken, setupTestDB, tearDownTestDB } from './setup.js';

let token: string;

beforeAll(async () => {
    await setupTestDB();
    await createTestUser();
    await changeTestUserEmailStatus();
    token = await getTestUserToken();
});

afterAll(async () => {
    await tearDownTestDB();
});

describe('User API Integration Test', () => {
    test('should fail to get user info. require authentication', async () => {
        const res = await request(app).get('/api/me').send({});

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toBe(Messages.AUTH_FAILED);
    });

    test('should get user info', async () => {
        const res = await request(app).get('/api/me').set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('email');
        expect(res.body.email).toBe('gradimbuyi@outlook.com');
    });
});
