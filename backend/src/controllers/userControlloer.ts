import { Request, Response } from 'express';
import { badRequest, deleted, internalServerError, Messages, updated, unauthorized } from '../utils/messageHandler.js';
import { getDB } from '../database.js';
import { ObjectId } from 'mongodb';
import { sendVerificationEmail } from './authController.js';
import bcrypt from 'bcrypt';

async function getInfo(req: Request, res: Response) {
    try {
        const database = getDB();
        const collection = database.collection('User');
        const userId = new ObjectId(req.user!.id);

        const user = await collection.findOne(
            { _id: userId },
            { projection: { _id: 0, passwordHash: 0, createdAt: 0, status: 0 } }
        );

        if (!user) return badRequest(res, Messages.USER + Messages.FAILED);

        return res.status(200).json(user);
    } catch (error) {
        internalServerError(res, error);
    }
}

async function updateInfo(req: Request, res: Response) {
    try {
        const database = getDB();
        const collection = database.collection('User');
        const userId = new ObjectId(req.user!.id);
        const allowedFields = ['firstName', 'lastName', 'email', 'phone'];
        const fields = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));

        if (Object.keys(fields).length === 0) return badRequest(res, Messages.MISSING_FIELDS);

        if (fields.email) {
            const user = await collection.findOne(
                { _id: userId },
                { projection: { _id: 0, email: 0, phone: 0, passwordHash: 0, createdAt: 0 } }
            );

            if (!user) return badRequest(res, Messages.USER + Messages.FAILED);

            const email = await sendVerificationEmail(user, userId);

            if (!email) return badRequest(res, Messages.FAILED);

            const update = await collection.updateOne({ _id: userId }, { $set: { ...fields, status: 'Pending' } });

            if (!update.acknowledged) return badRequest(res, Messages.USER + Messages.FAILED);

            return updated(res, Messages.USER + Messages.UPDATED);
        }

        const update = await collection.updateOne({ _id: userId }, { $set: { ...fields } });

        if (!update.acknowledged) return badRequest(res, Messages.USER + Messages.FAILED);

        return updated(res, Messages.USER + Messages.UPDATED);
    } catch (error) {
        internalServerError(res, error);
    }
}

async function deleteProfile(req: Request, res: Response) {
    try {
        const bodyLength = Object.keys(req.body).length;

        // Expect password in request body
        if (bodyLength !== 1) return badRequest(res, Messages.INCORRECT_FIELD_COUNT);

        const { password } = req.body;

        if (!password) return badRequest(res, Messages.MISSING_FIELDS);

        const database = getDB();
        const collection = database.collection('User');
        const userId = new ObjectId(req.user!.id);

        // Get user with password hash to verify
        const user = await collection.findOne({ _id: userId });

        if (!user) return badRequest(res, Messages.USER + Messages.FAILED);

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) return unauthorized(res, 'Invalid password');

        // Delete user
        const deleteResult = await collection.deleteOne({ _id: userId });

        if (deleteResult.deletedCount === 0) return badRequest(res, Messages.USER + Messages.FAILED);

        // Also delete all user's accounts and transactions
        await database.collection('Accounts').deleteMany({ userId });
        await database.collection('Transactions').deleteMany({ userId });

        return deleted(res, Messages.USER + Messages.DELETED);
    } catch (error) {
        internalServerError(res, error);
    }
}

export { getInfo, updateInfo, deleteProfile };