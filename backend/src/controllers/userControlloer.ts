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
        console.error('Error in getInfo:', error);
        return internalServerError(res, error);
    }
}

async function updateInfo(req: Request, res: Response) {
    try {
        const database = getDB();
        const collection = database.collection('User');
        const userId = new ObjectId(req.user!.id);
        const allowedFields = ['firstName', 'lastName', 'email', 'phone'];
        const fields = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));

        if (Object.keys(fields).length === 0) {
            return badRequest(res, Messages.MISSING_FIELDS);
        }

        // CRITICAL FIX: Get the current user from database to check if email is actually changing
        const currentUser = await collection.findOne({ _id: userId });
        
        if (!currentUser) {
            return badRequest(res, Messages.USER + Messages.FAILED);
        }

        // CRITICAL FIX: Only trigger email verification if email is ACTUALLY CHANGING
        // Not just if email field is present in the request
        const isEmailActuallyChanging = fields.email && fields.email !== currentUser.email;

        if (isEmailActuallyChanging) {
            // Email is changing - need to send verification to the NEW email
            console.log('Email is changing from', currentUser.email, 'to', fields.email);
            
            // Create a temporary user object with the NEW email for verification
            const userWithNewEmail = {
                ...currentUser,
                email: fields.email // Use the NEW email
            };

            try {
                const emailResult = await sendVerificationEmail(userWithNewEmail, userId);

                if (!emailResult || emailResult.length === 0) {
                    console.error('Failed to send verification email');
                    return badRequest(res, 'Failed to send verification email');
                }

                // Update user with new email and set status to Pending
                const update = await collection.updateOne(
                    { _id: userId }, 
                    { $set: { ...fields, status: 'Pending' } }
                );

                if (!update.acknowledged) {
                    return badRequest(res, Messages.USER + Messages.FAILED);
                }

                return updated(res, Messages.USER + Messages.UPDATED + '. Please verify your new email address.');
            } catch (emailError) {
                console.error('Error sending verification email:', emailError);
                return badRequest(res, 'Failed to send verification email');
            }
        }

        // Email is NOT changing - just update the other fields (firstName, lastName, phone)
        // Remove email from fields if it's the same as current email
        if (fields.email === currentUser.email) {
            delete fields.email;
        }

        // If no fields left to update after removing unchanged email
        if (Object.keys(fields).length === 0) {
            return updated(res, 'No changes detected');
        }

        const update = await collection.updateOne(
            { _id: userId }, 
            { $set: fields }
        );

        if (!update.acknowledged) {
            return badRequest(res, Messages.USER + Messages.FAILED);
        }

        return updated(res, Messages.USER + Messages.UPDATED);
    } catch (error) {
        console.error('Error in updateInfo:', error);
        return internalServerError(res, error);
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
        console.error('Error in deleteProfile:', error);
        return internalServerError(res, error);
    }
}

export { getInfo, updateInfo, deleteProfile };