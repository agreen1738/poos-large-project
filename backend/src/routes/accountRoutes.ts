import express from 'express';
import { createAccount, getAccounts, deleteAccount, updateAccount } from '../controllers/accountController.js';

const router = express.Router();

router.post('/account', createAccount);
router.put('/account/:id', updateAccount);
router.delete('/account/:id', deleteAccount);

// Gets the account associated with the logged user
router.get('/accounts', getAccounts);

export default router;
