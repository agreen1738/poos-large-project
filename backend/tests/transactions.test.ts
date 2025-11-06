import request from 'supertest';
import app from '../src/app.js';
import { Messages } from '../src/utils/messageHandler.js';
import { changeTestUserEmailStatus, createTestUser, getTestUserToken, setupTestDB, tearDownTestDB } from './setup.js';

let token: string;
let accountId: string;
let transactionId: string;

beforeAll(async () => {
    await setupTestDB();
    await createTestUser();
    await changeTestUserEmailStatus();
    token = await getTestUserToken();
});

afterAll(async () => {
    await tearDownTestDB();
});

describe('Transactions API Integration Test', () => {
    test('should fail to get transactions. authentication required', async () => {
        const res = await request(app).get('/api/accounts');

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toBe(Messages.AUTH_FAILED);
    });

    test('should return empty transactions list', async () => {
        const res = await request(app).get('/api/transactions').set('authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(0);
    });

    test('should fail to add transaction. no account is provided. invalid endpoint', async () => {
        const res = await request(app)
            .post(`/api/transactions/`)
            .set('authorization', `Bearer ${token}`)
            .send({
                name: 'Ford Mustang Purchase',
                amount: 25000,
                category: 'Hobbies',
                type: 'expense',
                date: new Date('December 17, 1995'),
            });

        expect(res.status).toBe(404);
    });

    test('should add transaction', async () => {
        await request(app).post('/api/account').set('authorization', `Bearer ${token}`).send({
            accountName: 'Wells Fargo',
            accountType: 'Savings',
            accountNumber: 526156162,
            accountInstitution: 'Wells Fargo',
            balance: 110811,
        });

        const account = await request(app).get('/api/accounts').set('authorization', `Bearer ${token}`);

        accountId = account.body[0]._id;

        const res = await request(app)
            .post(`/api/transactions/${accountId}`)
            .set('authorization', `Bearer ${token}`)
            .send({
                name: 'Ford Mustang Purchase',
                amount: 25000,
                category: 'Hobbies',
                type: 'expense',
                date: new Date('December 17, 1995'),
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('success');
        expect(res.body.success).toBe(Messages.TRANSACTION + Messages.CREATED);
    });

    test('should get transactions associated with account', async () => {
        const res = await request(app).get(`/api/transactions/${accountId}`).set('authorization', `Bearer ${token}`);

        transactionId = res.body[0]._id;
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('should get a single transaction associated with account', async () => {
        const res = await request(app)
            .get(`/api/transactions/${accountId}/${transactionId}`)
            .set('authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(false);
    });

    test('should delete a transaction', async () => {
        const res = await request(app)
            .delete(`/api/transactions/${accountId}/${transactionId}`)
            .set('authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success');
        expect(res.body.success).toBe(Messages.TRANSACTION + Messages.DELETED);
    });
});
