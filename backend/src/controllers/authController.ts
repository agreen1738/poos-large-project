import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDB } from '../database.js';
import { badRequest, created, internalServerError, unauthorized } from '../utils/messageHandler.js';
import { Messages } from '../utils/messageHandler.js';
import type { Request, Response } from 'express';
import type { User } from '../models/User.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

async function register(req: Request, res: Response) {
    try {
        const bodyLength = Object.keys(req.body).length;

        if (bodyLength !== 3) return badRequest(res, Messages.INCORRECT_FIELD_COUNT);

        const { name, email, password } = req.body;

        if (!name || !email || password) return badRequest(res, Messages.MISSING_FIELDS);

        const database = getDB();
        const collection = database.collection('User');
        const user = await collection.findOne({ email });

        if (user) return badRequest(res, Messages.EMAIL_EXISTS);

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser: User = {
            name: name,
            email: email,
            passwordHash: passwordHash,
            createdAt: new Date(),
        };

        await collection.insertOne(newUser);
        return created(res, Messages.USER + Messages.CREATED);
    } catch (error) {
        return internalServerError(res, error);
    }
}

async function login(req: Request, res: Response) {
    try {
        const bodyLength = Object.keys(req.body).length;

        if (bodyLength !== 2) return badRequest(res, Messages.INCORRECT_FIELD_COUNT);

        const { login, password } = req.body;

        if (!login || !password) return badRequest(res, Messages.MISSING_FIELDS);

        const database = getDB();
        const collection = database.collection('User');
        const user = await collection.findOne({ email: login });

        if (!user) return unauthorized(res, Messages.INVALID_CREDENTIAL);

        const isPassword = await bcrypt.compare(password, user.passwordHash);

        if (!isPassword) return unauthorized(res, Messages.INVALID_CREDENTIAL);

        const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ token });
    } catch (error) {
        return internalServerError(res, error);
    }
}

export { register, login };
