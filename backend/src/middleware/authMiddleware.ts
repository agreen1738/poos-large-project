import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import type { Request, Response, NextFunction } from 'express';
import { Messages, unauthorized } from '../utils/messageHandler.js';

dotenv.config({ quiet: true });

const JWT_SECRET = process.env.JWT_SECRET as string;

interface JwtPayload {
    id: string;
}

async function authenticateToken(req: Request, res: Response, next: NextFunction) {
    try {
        const auth_header = req.headers['authorization'];

        if (!auth_header || !auth_header.startsWith('Bearer ')) {
            return unauthorized(res, Messages.AUTH_FAILED);
        }

        const token = auth_header.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        req.user = { id: decoded.id };
        next();
    } catch (error) {
        return unauthorized(res, Messages.INVALID_TOKEN);
    }
}

export default authenticateToken;
