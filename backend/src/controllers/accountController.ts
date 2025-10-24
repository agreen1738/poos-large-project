import type { Request, Response } from 'express';
import type { Accounts } from '../models/Accounts.js';
import { getDB } from '../database.js';
import { ObjectId } from 'mongodb';
import {
    internalServerError,
    badRequest,
    unauthorized,
    created,
    deleted,
    updated,
    Messages,
    notFound,
} from '../utils/messageHandler.js';

async function getAccounts(req: Request, res: Response) {
    try {
        const database = getDB();
        const collection = database.collection('Accounts');
        const userId = new ObjectId(req.user!.id);
        const accounts = await collection.find({ userId }).toArray();

        return res.status(200).json(accounts);
    } catch (error) {
        return internalServerError(res, error);
    }
}

async function createAccount(req: Request, res: Response) {
    try {
        const bodyLength = Object.keys(req.body).length;

        if (bodyLength !== 2) return badRequest(res, Messages.INCORRECT_FIELD_COUNT);

        const { name, type } = req.body;

        if (!name || !type) return badRequest(res, Messages.MISSING_FIELDS);

        const database = getDB();
        const userCollection = database.collection('User');
        const accountsCollection = database.collection('Accounts');
        const userId = new ObjectId(req.user!.id);
        const user = await userCollection.findOne({ _id: userId });

        if (!user) return unauthorized(res, Messages.INVALID_CREDENTIAL);

        const account = await accountsCollection.findOne({ accountName: name });

        if (account && user._id.toString() === userId.toString()) {
            return unauthorized(res, Messages.NAME_TAKEN);
        }

        const newAccount: Accounts = {
            userId: userId,
            accountName: name,
            accountType: type,
            balanace: 0,
            currency: 'USD',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await accountsCollection.insertOne(newAccount);
        return created(res, Messages.ACCOUNT + Messages.CREATED);
    } catch (error) {
        return internalServerError(res, error);
    }
}

async function deleteAccount(req: Request, res: Response) {
    try {
        const database = getDB();
        const collection = database.collection('Accounts');

        const account = await collection.deleteOne({
            _id: new ObjectId(req.params.id),
            userId: new ObjectId(req.user!.id),
        });

        if (account.deletedCount === 0) {
            return badRequest(res, Messages.FAILED);
        }

        return deleted(res, Messages.ACCOUNT + Messages.DELETED);
    } catch (error) {
        return internalServerError(res, error);
    }
}

async function updateAccount(req: Request, res: Response) {
    try {
        const database = getDB();
        const collection = database.collection('Accounts');
        const id = req.params.id;
        const userId = req.user!.id;
        const allowedFields = ['accountName', 'accountType', 'balanace', 'currency', 'isActive'];
        const fields = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));

        if (Object.keys(fields).length === 0) {
            return badRequest(res, Messages.MISSING_FIELDS);
        }

        const account = await collection.findOneAndUpdate(
            { _id: new ObjectId(id), userId: new ObjectId(userId) },
            { $set: { ...fields, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );

        if (!account) {
            return notFound(res, Messages.ACCOUNT + Messages.FAILED);
        }

        return updated(res, Messages.ACCOUNT + Messages.UPDATED);
    } catch (error) {
        return internalServerError(res, error);
    }
}

export { getAccounts, createAccount, deleteAccount, updateAccount };
