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
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║     UPDATE USER INFO - DEBUG           ║');
    console.log('╚════════════════════════════════════════╝');

    try {
        console.log('📥 Request body:', JSON.stringify(req.body, null, 2));

        const database = getDB();
        const collection = database.collection('User');
        const userId = new ObjectId(req.user!.id);

        console.log('🔑 User ID:', userId.toString());

        const allowedFields = ['firstName', 'lastName', 'email', 'phone'];
        const fields = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));

        console.log('✅ Filtered fields:', JSON.stringify(fields, null, 2));

        if (Object.keys(fields).length === 0) {
            console.log('❌ No valid fields to update');
            return badRequest(res, Messages.MISSING_FIELDS);
        }

        // Get current user from database
        console.log('🔍 Fetching current user from database...');
        const currentUser = await collection.findOne({ _id: userId });

        if (!currentUser) {
            console.log('❌ User not found in database');
            return badRequest(res, Messages.USER + Messages.FAILED);
        }

        console.log('👤 Current user email:', currentUser.email);
        console.log('📧 Email from request:', fields.email);

        // Check if email is ACTUALLY changing
        const isEmailActuallyChanging = fields.email && fields.email !== currentUser.email;

        console.log('🔄 Is email actually changing?', isEmailActuallyChanging);

        if (isEmailActuallyChanging) {
            console.log('⚠️  EMAIL IS CHANGING - Will send verification email');
            console.log('   From:', currentUser.email);
            console.log('   To:', fields.email);

            // Create user object with NEW email
            const userWithNewEmail = {
                ...currentUser,
                email: fields.email,
            };

            try {
                console.log('📤 Calling sendVerificationEmail...');
                const emailResult = await sendVerificationEmail(userWithNewEmail, userId);
                console.log('✅ Email sent result:', emailResult);

                if (!emailResult) {
                    console.error('❌ Failed to send verification email - no recipients');
                    return badRequest(res, 'Failed to send verification email');
                }

                // Update with new email and set status to Pending
                console.log('💾 Updating user with new email and Pending status...');
                const update = await collection.updateOne({ _id: userId }, { $set: { ...fields, status: 'Pending' } });

                if (!update.acknowledged) {
                    console.error('❌ Database update failed');
                    return badRequest(res, Messages.USER + Messages.FAILED);
                }

                console.log('✅ Update successful - email verification required');
                return updated(res, Messages.USER + Messages.UPDATED + '. Please verify your new email address.');
            } catch (emailError) {
                console.error('❌ Error in email sending process:', emailError);
                return badRequest(res, 'Failed to send verification email');
            }
        }

        // Email NOT changing - just update other fields
        console.log('✅ Email NOT changing - updating other fields only');

        // Remove email from fields if it's the same
        if (fields.email === currentUser.email) {
            console.log('🗑️  Removing unchanged email from update');
            delete fields.email;
        }

        console.log('📝 Final fields to update:', JSON.stringify(fields, null, 2));

        if (Object.keys(fields).length === 0) {
            console.log('ℹ️  No changes detected');
            return updated(res, 'No changes detected');
        }

        console.log('💾 Updating user in database...');
        const update = await collection.updateOne({ _id: userId }, { $set: fields });

        if (!update.acknowledged) {
            console.error('❌ Database update failed');
            return badRequest(res, Messages.USER + Messages.FAILED);
        }

        console.log('✅ Update successful!');
        console.log('╚════════════════════════════════════════╝\n');
        return updated(res, Messages.USER + Messages.UPDATED);
    } catch (error) {
        console.error('❌ FATAL ERROR in updateInfo:', error);
        return internalServerError(res, error);
    }
}

async function changePassword(req: Request, res: Response) {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║     CHANGE PASSWORD - DEBUG            ║');
    console.log('╚════════════════════════════════════════╝');

    try {
        const bodyLength = Object.keys(req.body).length;

        console.log('📥 Request body keys:', Object.keys(req.body));
        console.log('🔢 Field count:', bodyLength);

        // Expect currentPassword and newPassword
        if (bodyLength !== 2) {
            console.log('❌ Incorrect field count - expected 2, got', bodyLength);
            return badRequest(res, Messages.INCORRECT_FIELD_COUNT);
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            console.log('❌ Missing required fields');
            return badRequest(res, Messages.MISSING_FIELDS);
        }

        console.log('✅ Current password provided:', !!currentPassword);
        console.log('✅ New password provided:', !!newPassword);
        console.log('📏 New password length:', newPassword.length);

        // Validate new password length
        if (newPassword.length < 6) {
            console.log('❌ New password too short');
            return badRequest(res, 'Password must be at least 6 characters long');
        }

        const database = getDB();
        const collection = database.collection('User');
        const userId = new ObjectId(req.user!.id);

        console.log('🔑 User ID:', userId.toString());
        console.log('🔍 Fetching user from database...');

        // Get user with password hash
        const user = await collection.findOne({ _id: userId });

        if (!user) {
            console.log('❌ User not found');
            return badRequest(res, Messages.USER + Messages.FAILED);
        }

        console.log('👤 User found:', user.email);
        console.log('🔐 Verifying current password...');

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

        if (!isPasswordValid) {
            console.log('❌ Current password is incorrect');
            return unauthorized(res, 'Current password is incorrect');
        }

        console.log('✅ Current password verified');
        console.log('🔒 Hashing new password...');

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        console.log('✅ New password hashed');
        console.log('💾 Updating password in database...');

        // Update password in database
        const update = await collection.updateOne({ _id: userId }, { $set: { passwordHash: newPasswordHash } });

        if (!update.acknowledged) {
            console.log('❌ Database update failed');
            return badRequest(res, Messages.USER + Messages.FAILED);
        }

        console.log('✅ Password changed successfully!');
        console.log('╚════════════════════════════════════════╝\n');

        return updated(res, Messages.NEW_PASSWORD);
    } catch (error) {
        console.error('❌ FATAL ERROR in changePassword:', error);
        return internalServerError(res, error);
    }
}

async function deleteProfile(req: Request, res: Response) {
    try {
        const bodyLength = Object.keys(req.body).length;

        if (bodyLength !== 1) return badRequest(res, Messages.INCORRECT_FIELD_COUNT);

        const { password } = req.body;

        if (!password) return badRequest(res, Messages.MISSING_FIELDS);

        const database = getDB();
        const collection = database.collection('User');
        const userId = new ObjectId(req.user!.id);

        const user = await collection.findOne({ _id: userId });

        if (!user) return badRequest(res, Messages.USER + Messages.FAILED);

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) return unauthorized(res, 'Invalid password');

        const deleteResult = await collection.deleteOne({ _id: userId });

        if (deleteResult.deletedCount === 0) return badRequest(res, Messages.USER + Messages.FAILED);

        await database.collection('Accounts').deleteMany({ userId });
        await database.collection('Transactions').deleteMany({ userId });

        return deleted(res, Messages.USER + Messages.DELETED);
    } catch (error) {
        console.error('Error in deleteProfile:', error);
        return internalServerError(res, error);
    }
}

export { getInfo, updateInfo, changePassword, deleteProfile };
