import express from 'express';
import { getInfo, updateInfo, deleteProfile } from '../controllers/userControlloer.js';

const router = express.Router();

router.get('/me', getInfo);
router.put('/me', updateInfo);
router.delete('/me', deleteProfile);

export default router;
