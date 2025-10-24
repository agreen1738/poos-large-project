import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDB } from '../database.ts';
import type { Request, Response } from 'express';
import type { User } from '../models/User.ts';

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET as string;

router.post('/register', async (req: Request, res: Response) => {
    try {
        const body_length = Object.keys(req.body).length;

        if (body_length !== 3) return res.status(400).json({ error: 'incorrect number of fields' });

        const { name, email, password } = req.body;

        if (!name) return res.status(400).json({ error: 'missing field: name' });
        if (!email) return res.status(400).json({ error: 'missing field: email' });
        if (!password) return res.status(400).json({ error: 'missing field: password' });

        const database = getDB();
        const collection = database.collection('User');
        const user = await collection.findOne({ email });

        if (user) return res.status(400).json({ error: 'email already exists' });

        const passwordHash = await bcrypt.hash(password, 10);

        const new_user: User = {
            name: name,
            email: email,
            passwordHash: passwordHash,
            createdAt: new Date(),
        };

        await collection.insertOne(new_user);
        return res.status(200).json({ success: 'user created successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'registration failed' });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const body_length = Object.keys(req.body).length;

        if (body_length !== 2) return res.status(400).json({ error: 'incorrect number of fields' });

        const { login, password } = req.body;

        if (!login) return res.status(400).json({ error: 'missing field: login' });
        if (!password) return res.status(400).json({ error: 'missing field: password' });

        const database = getDB();
        const collection = database.collection('User');
        const user = await collection.findOne({ email: login });

        if (!user) return res.status(400).json({ error: 'invalid credentials' });

        const is_password = await bcrypt.compare(password, user.passwordHash);

        if (!is_password) return res.status(400).json({ error: 'invalid credentials' });

        const token = jwt.sign({ userId: user._id.toString, login: user.email }, JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'login failed' });
    }
});

export default router;
