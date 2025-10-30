import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import transactionRoutes from './routes/transactionsRoutes.js';
import userRoutes from './routes/userRoutes.js';
// import budgetRoutes from './routes/budgetRoutes.js';
import authenticateToken from './middleware/authMiddleware.js';
import type { Response, Request, NextFunction } from 'express';

const app = express();

app.use(cors());
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    next();
});

app.get('/', (req: Request, res: Response) => {
    res.send('Backend is running!');
});

app.use('/api', authRoutes);
app.use('/api', authenticateToken, accountRoutes);
app.use('/api', authenticateToken, transactionRoutes);
app.use('/api', authenticateToken, userRoutes);
// app.use('/api', authenticateToken, budgetRoutes);

export default app;
