import express from 'express';
import {
    createAccount,
    getAccounts,
    deleteAccount,
    updateAccount,
    getAccount,
} from '../controllers/accountController.js';

const router = express.Router();

router.get('/accounts', getAccounts);
router.get('/account/:id', getAccount);
router.post('/account', createAccount);
router.put('/account/:id', updateAccount);
router.delete('/account/:id', deleteAccount);

export default router;
