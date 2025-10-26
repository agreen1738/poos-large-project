import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import authenticateToken from './middleware/authMiddleware.js';
import type { Response, Request, NextFunction } from 'express';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// CORS Headers
app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    next();
});

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('Backend is running!');
});

app.use('/api', authRoutes);
app.use('/api', authenticateToken, accountRoutes);

export default app;
