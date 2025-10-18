import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { get_db } from '../database.ts';
import type { Request, Response } from 'express';

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET as string;

router.post('/register', async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, login, password, email, phoneNumber } = req.body;

        // Checks if correct numbers of fields are used
        const body_length = Object.keys(req.body).length;
        if (body_length !== 6) return res.status(400).json({ Error: 'Incorrect Number of Fields' });

        // Checks if all fields are filled
        if (!firstName) return res.status(400).json({ Error: 'Missing field: firstName' });
        if (!lastName) return res.status(400).json({ Error: 'Missing field: lastName' });
        if (!login) return res.status(400).json({ Error: 'Missing field: login' });
        if (!password) return res.status(400).json({ Error: 'Missing field: password' });
        if (!email) return res.status(400).json({ Error: 'Missing field: email' });
        if (!phoneNumber) return res.status(400).json({ Error: 'Missing field: phoneNumber' });

        // Connects to database and Users collection.
        // Uses helper function from database.ts to complete this
        const database = get_db();
        const users = database.collection('Users');

        // Checks to see if user is existing
        const is_user = await users.findOne({ $or: [{ login }, { email }] });

        if (is_user) return res.status(400).json({ Error: 'User already exists' });

        // Creating the account
        const hashed_password = await bcrypt.hash(password, 10);
        await users.insertOne({ firstName, lastName, login, password: hashed_password, email, phoneNumber });
        return res.status(200).json({ Success: 'User created successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ Error: 'Registration failed' });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { login, password } = req.body;

        // Checks if correct numbers of fields are used
        const body_length = Object.keys(req.body).length;
        if (body_length !== 2) return res.status(400).json({ Error: 'Incorrect Number of Fields' });

        // Checks if all fields are filled
        if (!login) return res.status(400).json({ Error: 'Missing field: login' });
        if (!password) return res.status(400).json({ Error: 'Missing field: password' });

        // Connects to database and Users collection.
        // Uses helper function from database.ts to complete this
        const database = get_db();
        const users = database.collection('Users');

        // Validate user credentials. Logs in if user inputs valid login and password
        const user = await users.findOne({ login });

        if (!user) return res.status(400).json({ Error: 'Invalid credentials' });

        const password_compare = await bcrypt.compare(password, user.password);

        if (!password_compare) return res.status(400).json({ Error: 'Invalid credentials' });

        // Generate and return user token
        const token = jwt.sign({ userId: user._id, login: login }, JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ token });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ Error: 'Login failed' });
    }
});

export default router;
