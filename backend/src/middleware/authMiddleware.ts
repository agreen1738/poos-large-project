import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import type { Request, Response, NextFunction } from 'express';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

function authenticate_token(req: Request, res: Response, next: NextFunction) {
    const header = req.headers['authorization'];
    const token = header && header.split(' ')[1];

    if (!token) return res.status(401).json({ Error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (error, user) => {
        if (error) return res.status(403).json({ Error: 'Invalid token' });
        (req as any).user = user;
        next();
    });
}

export default authenticate_token;
