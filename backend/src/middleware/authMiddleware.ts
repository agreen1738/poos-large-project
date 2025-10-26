import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import type { Request, Response, NextFunction } from 'express';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

interface JwtPayload {
    id: string;
}

async function authenticateToken(req: Request, res: Response, next: NextFunction) {
    try {
        const auth_header = req.headers['authorization'];

        if (!auth_header || !auth_header.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'authentication required: no token provided' });
        }

        const token = auth_header.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        req.user = { id: decoded.id };
        next();
    } catch (error) {
        res.status(401).json({ error: 'invalid token' });
    }
}

export default authenticateToken;
