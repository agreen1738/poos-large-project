import express from 'express';
import { getCategoryAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.post('/analytics/categories', getCategoryAnalytics);

export default router;