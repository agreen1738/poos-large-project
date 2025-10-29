import express from 'express';
import {
    getTransactions,
    getAccountTransactions,
    getAccountTransaction,
    addTransaction,
    deleteTransaction,
} from '../controllers/transactionController.js';

const router = express.Router();

router.get('/transactions', getTransactions);
router.get('/transactions/:accountId', getAccountTransactions);
router.get('/transactions/:accountId/:id', getAccountTransaction);
router.post('/transactions/:accountId', addTransaction);
router.delete('/transactions/:accountId/:id', deleteTransaction);

export default router;
