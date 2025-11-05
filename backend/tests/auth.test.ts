import request from 'supertest';
import app from '../src/app.js';
import { changeTestUserEmailStatus, setupDB, tearDownDB } from './setup.js';
import { Messages } from '../src/utils/messageHandler.js';

beforeAll(async () => {
    await setupDB();
});

afterAll(async () => {
    await tearDownDB();
});

describe('Auth API Integration Test', () => {
    test('should fail to register new user. incorrect field count', async () => {
        const res = await request(app)
            .post('/api/register')
            .send({ email: 'gradimbuyi@outlook.com', password: 'jestingaround' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toBe(Messages.INCORRECT_FIELD_COUNT);
    });

    test('should register new user', async () => {
        const res = await request(app).post('/api/register').send({
            firstName: 'Gradi',
            lastName: 'Mbuyi',
            email: 'gradimbuyi@outlook.com',
            phone: '555-555-5555',
            password: 'jestingaround',
            confirmPassword: 'jestingaround',
        });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('success');
        expect(res.body.success).toBe(Messages.USER + Messages.CREATED);
    });

    test('should fail to login user. invalid credentials', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({ login: 'gradimbuyi@outlook.fr', password: 'jestingaround' });

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toBe(Messages.INVALID_CREDENTIAL);
    });

    test('should fail to login user. require email verifaction', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({ login: 'gradimbuyi@outlook.com', password: 'jestingaround' });

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toBe(Messages.NOT_VERIFIED);
    });

    test('should login user', async () => {
        changeTestUserEmailStatus();

        const res = await request(app)
            .post('/api/login')
            .send({ login: 'gradimbuyi@outlook.com', password: 'jestingaround' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
    });
});
