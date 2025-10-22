import express from 'express';
import cors from 'cors';
import auth_routes from './routes/auth.ts';
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

app.use('/api', auth_routes);

export default app;
