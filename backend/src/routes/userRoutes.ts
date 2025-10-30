import express from 'express';
import { getInfo, updateInfo, changePassword, deleteProfile } from '../controllers/userControlloer.js';

const router = express.Router();

router.get('/me', getInfo);
router.put('/me', updateInfo);
router.put('/me/password', changePassword);
router.delete('/me', deleteProfile);

export default router;