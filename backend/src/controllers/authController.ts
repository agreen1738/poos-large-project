import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { getDB } from '../database.js';
import { badRequest, created, internalServerError, unauthorized, okStatus, notFound } from '../utils/messageHandler.js';
import { Messages } from '../utils/messageHandler.js';
import type { Request, Response } from 'express';
import type { User } from '../models/User.js';
import { ObjectId } from 'mongodb';

dotenv.config({ quiet: true });

const JWT_SECRET = process.env.JWT_SECRET as string;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

async function sendVerificationEmail(user: any, id: ObjectId, subject = 'Verify your account', isResend = false) {
    const verificationToken = jwt.sign({ id: id.toString() }, JWT_SECRET, { expiresIn: '15m' });
    
    // URL encode the token to prevent special characters from breaking the link
    const encodedToken = encodeURIComponent(verificationToken);
    const verificationLink = `${process.env.FRONTEND_URL}/verify?token=${encodedToken}`;
    
    const emailSubject = isResend ? `Resend: ${subject}` : subject;
    const message = `
        <h4>Hi ${user.firstName},</h4>
        <p>${isResend ? 'It looks like you requested a new verification link.' : 'Thanks for signing up!'}</p>
        <p>Click the link below to verify your account:</p>
        <a href="${verificationLink}">Verify Account</a>
        <p>This link will expire in 15 minutes.</p>
    `;
    const result = await transporter.sendMail({
        from: `'WealthTracker' <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: emailSubject,
        html: message,
    });

    return result.accepted;
}

async function sendPasswordRecoveryEmail(user: any, resetToken: string) {
    const passwordResetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const emailSubject = 'Reset Password';
    const message = `
        <h4>Hi ${user.firstName},</h4>
        <p>It looks like you are attempting to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${passwordResetLink}">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
    `;
    const result = await transporter.sendMail({
        from: `'WealthTracker' <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: emailSubject,
        html: message,
    });

    return result.accepted;
}

async function register(req: Request, res: Response) {
    try {
        const bodyLength = Object.keys(req.body).length;

        if (bodyLength !== 6) return badRequest(res, Messages.INCORRECT_FIELD_COUNT);

        const { firstName, lastName, email, phone, password, confirmPassword } = req.body;

        if (!firstName || !lastName || !phone || !email || !password || !confirmPassword) {
            return badRequest(res, Messages.MISSING_FIELDS);
        }

        if (password !== confirmPassword) return badRequest(res, Messages.FAILED);

        const database = getDB();
        const collection = database.collection('User');
        const user = await collection.findOne({ email });

        if (user) {
            if (user.status === 'Pending') {
                return badRequest(res, Messages.VERIFICATION_SENT);
            }
            return badRequest(res, Messages.EMAIL_EXISTS);
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser: User = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            passwordHash: passwordHash,
            createdAt: new Date(),
            status: 'Pending',
        };

        const result = await collection.insertOne(newUser);

        if (!result.acknowledged) return badRequest(res, Messages.USER + Messages.FAILED);

        const emailResult = await sendVerificationEmail(newUser, result.insertedId);

        if (!emailResult) return badRequest(res, Messages.FAILED);

        return created(res, Messages.USER + Messages.CREATED);
    } catch (error) {
        return internalServerError(res, error);
    }
}

async function login(req: Request, res: Response) {
    try {
        const bodyLength = Object.keys(req.body).length;

        if (bodyLength !== 2) return badRequest(res, Messages.INCORRECT_FIELD_COUNT);

        const { login, password } = req.body;

        if (!login || !password) return badRequest(res, Messages.MISSING_FIELDS);

        const database = getDB();
        const collection = database.collection('User');
        const user = await collection.findOne({ email: login });

        if (!user) return unauthorized(res, Messages.INVALID_CREDENTIAL);
        if (user.status !== 'Confirmed') return unauthorized(res, Messages.NOT_VERIFIED);

        const isPassword = await bcrypt.compare(password, user.passwordHash);

        if (!isPassword) return unauthorized(res, Messages.INVALID_CREDENTIAL);

        const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ token });
    } catch (error) {
        return internalServerError(res, error);
    }
}

async function verifyEmail(req: Request, res: Response) {
    try {
        const { token } = req.query;

        if (!token) return badRequest(res, Messages.MISSING_TOKEN);

        const decoded = jwt.verify(token as string, JWT_SECRET) as { id: string };

        const database = getDB();
        const collection = database.collection('User');
        const userId = new ObjectId(decoded.id);
        const user = await collection.findOne({ _id: userId });

        if (!user) return notFound(res, Messages.USER + Messages.FAILED);
        if (user.status === 'Confirmed') return badRequest(res, Messages.ALREADY_VERIFIED);

        const update = await collection.updateOne({ _id: userId }, { $set: { status: 'Confirmed' } });

        if (!update.acknowledged) return badRequest(res, Messages.USER + Messages.FAILED);

        return okStatus(res, Messages.EMAIL_VERIFIED);
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            return badRequest(res, Messages.EXPIRED_TOKEN);
        }
        if (error.name === 'JsonWebTokenError') {
            return badRequest(res, 'Invalid token');
        }
        return internalServerError(res, error);
    }
}

async function resendVerification(req: Request, res: Response) {
    try {
        const bodyLength = Object.keys(req.body).length;

        if (bodyLength !== 1) return badRequest(res, Messages.INCORRECT_FIELD_COUNT);

        const { email } = req.body;

        if (!email) return badRequest(res, Messages.MISSING_FIELDS);

        const database = getDB();
        const collection = database.collection('User');
        const user = await collection.findOne({ email });

        if (!user) return notFound(res, Messages.USER + Messages.FAILED);
        if (user.status === 'Confirmed') return badRequest(res, Messages.ALREADY_VERIFIED);

        const emailResult = sendVerificationEmail(user, user._id, 'Verify your account', true);

        if (!emailResult) return badRequest(res, Messages.USER + Messages.FAILED);

        return okStatus(res, Messages.RE_VERIFICATION);
    } catch (error) {
        return internalServerError(res, error);
    }
}

async function forgotPassword(req: Request, res: Response) {
    try {
        const bodyLength = Object.keys(req.body).length;

        if (bodyLength !== 1) return badRequest(res, Messages.INCORRECT_FIELD_COUNT);

        const email = req.body.email;

        if (!email) return badRequest(res, Messages.MISSING_FIELDS);

        const database = getDB();
        const collection = database.collection('User');
        const user = await collection.findOne({ email });

        if (!user) return badRequest(res, Messages.USER + Messages.FAILED);

        const resetToken = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: '15m' });
        await sendPasswordRecoveryEmail(user, resetToken);

        return res.status(200).json({ token: resetToken });
    } catch (error) {
        return internalServerError(res, error);
    }
}

async function changePassword(req: Request, res: Response) {
    try {
        const bodyLength = Object.keys(req.body).length;
        const queryLength = Object.keys(req.query).length;

        if (bodyLength !== 1 || queryLength !== 1) {
            return badRequest(res, Messages.INCORRECT_FIELD_COUNT);
        }

        const token = req.query.token;
        const password = req.body.password;

        if (!token || !password) return badRequest(res, Messages.MISSING_FIELDS);

        const decoded = jwt.verify(token as string, JWT_SECRET) as { id: string };
        const passwordHash = await bcrypt.hash(password, 10);

        const database = getDB();
        const collection = await database.collection('User');
        await collection.updateOne({ _id: new ObjectId(decoded.id) }, { $set: { passwordHash } });

        return okStatus(res, Messages.NEW_PASSWORD);
    } catch (error) {
        return internalServerError(res, error);
    }
}

export {
    register,
    login,
    verifyEmail,
    sendVerificationEmail,
    sendPasswordRecoveryEmail,
    resendVerification,
    forgotPassword,
    changePassword,
};