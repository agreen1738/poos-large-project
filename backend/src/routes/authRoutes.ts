import express from 'express';
import {
    changePassword,
    forgotPassword,
    login,
    register,
    resendVerification,
    verifyEmail,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/change-password', changePassword);

export default router;
