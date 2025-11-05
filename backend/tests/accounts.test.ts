import request from 'supertest';
import app from '../src/app.js';
import { Messages } from '../src/utils/messageHandler.js';
import { changeTestUserEmailStatus, createTestUser, getTestUserToken, setupTestDB, tearDownTestDB } from './setup.js';

let token: string;
let accountId: string;

beforeAll(async () => {
    await setupTestDB();
    await createTestUser();
    await changeTestUserEmailStatus();
    token = await getTestUserToken();
});

afterAll(async () => {
    await tearDownTestDB();
});

describe('Accounts API Integration Test', () => {
    test('should fail to create a new account. authentication failed', async () => {
        const res = await request(app).post('/api/account').send({ name: 'Wells Fargo', type: 'Savings' });

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toBe(Messages.AUTH_FAILED);
    });

    test('should return an empty account list', async () => {
        const res = await request(app).get('/api/accounts').set('authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(0);
    });

    test('should create a new account', async () => {
        const res = await request(app).post('/api/account').set('authorization', `Bearer ${token}`).send({
            accountName: 'Wells Fargo',
            accountType: 'Savings',
            accountNumber: 526156162,
            accountInstitution: 'Wells Fargo',
            balance: 110811,
        });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('success');
        expect(res.body.success).toBe(Messages.ACCOUNT + Messages.CREATED);
    });

    test('should return an account list containing at least one account', async () => {
        const res = await request(app).get('/api/accounts').set('authorization', `Bearer ${token}`);

        accountId = res.body[0]._id;
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('should return a single account', async () => {
        const res = await request(app).get(`/api/account/${accountId}`).set('authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(false);
        expect(res.body).toHaveProperty('_id');
    });

    test('should fail to update an account. no data sent', async () => {
        const res = await request(app)
            .put(`/api/account/${accountId}`)
            .set('authorization', `Bearer ${token}`)
            .send({});

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toBe(Messages.MISSING_FIELDS);
    });

    test('should update an account', async () => {
        const res = await request(app)
            .put(`/api/account/${accountId}`)
            .set('authorization', `Bearer ${token}`)
            .send({ accountName: 'Chase Checking', accountInstitution: 'Chase Bank' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success');
        expect(res.body.success).toBe(Messages.ACCOUNT + Messages.UPDATED);
    });

    test('should fail to delete an account. invalid endpoint. missing account id', async () => {
        const res = await request(app).delete('/api/account/').set('authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
    });

    test('should delete an account', async () => {
        const res = await request(app).delete(`/api/account/${accountId}`).set('authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success');
        expect(res.body.success).toBe(Messages.ACCOUNT + Messages.DELETED);
    });
});
