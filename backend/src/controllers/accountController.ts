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
        const accounts = await collection.find({ userId }, { projection: { userId: 0 } }).toArray();

        // FIXED: Return empty array instead of 400 error when no accounts exist
        return res.status(200).json(accounts);
    } catch (error) {
        return internalServerError(res, error);
    }
}

async function getAccount(req: Request, res: Response) {
    try {
        const paramsLength = Object.keys(req.params).length;

        if (paramsLength !== 1) return badRequest(res, Messages.INCORRECT_FIELD_COUNT);

        const id = req.params.id;

        if (!id) return badRequest(res, Messages.MISSING_FIELDS);

        const database = getDB();
        const collection = database.collection('Accounts');
        const accountId = new ObjectId(id);
        const userId = new ObjectId(req.user!.id);
        const account = await collection.findOne({ _id: accountId, userId: userId }, { projection: { userId: 0 } });

        return res.status(200).json(account);
    } catch (error) {
        return internalServerError(res, error);
    }
}

async function createAccount(req: Request, res: Response) {
    try {
        const bodyLength = Object.keys(req.body).length;

        if (bodyLength !== 5) return badRequest(res, Messages.INCORRECT_FIELD_COUNT);

        const { accountName, accountType, accountNumber, accountInstitution, balance } = req.body;

        if (!accountName || !accountType || !accountNumber) return badRequest(res, Messages.MISSING_FIELDS);

        const userId = new ObjectId(req.user!.id);
        const database = getDB();
        const collection = database.collection('Accounts');
        const account = await collection.findOne({ accountNumber: accountNumber, userId: userId });

        if (account) return unauthorized(res, Messages.NUMBER_TAKEN);

        const newAccount: Accounts = {
            userId: userId,
            accountName: accountName,
            accountType: accountType,
            accountNumber: accountNumber,
            accountInstitution: accountInstitution,
            balanace: balance,
            currency: 'USD',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await collection.insertOne(newAccount);

        if (!result.acknowledged) return badRequest(res, Messages.ACCOUNT + Messages.FAILED);

        return created(res, Messages.ACCOUNT + Messages.CREATED);
    } catch (error) {
        return internalServerError(res, error);
    }
}

async function deleteAccount(req: Request, res: Response) {
    try {
        const paramsLength = Object.keys(req.params).length;

        if (paramsLength !== 1) return badRequest(res, Messages.INCORRECT_FIELD_COUNT);

        const id = req.params.id;

        if (!id) return badRequest(res, Messages.MISSING_FIELDS);

        const userId = new ObjectId(req.user!.id);
        const accountId = new ObjectId(id);
        const database = getDB();
        const collection = database.collection('Accounts');

        const account = await collection.deleteOne({ _id: accountId, userId: userId });

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
        const paramsLength = Object.keys(req.params).length;

        if (paramsLength !== 1) return badRequest(res, Messages.INCORRECT_FIELD_COUNT);

        const id = req.params.id;

        if (!id) return badRequest(res, Messages.MISSING_FIELDS);

        const accountId = new ObjectId(id);
        const userId = new ObjectId(req.user!.id);
        const database = getDB();
        const collection = database.collection('Accounts');
        const allowedFields = ['accountName', 'accountType', 'accountNumber', 'balanace', 'currency', 'isActive'];
        const fields = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));

        if (Object.keys(fields).length === 0) {
            return badRequest(res, Messages.MISSING_FIELDS);
        }

        const account = await collection.findOneAndUpdate(
            { _id: accountId, userId: userId },
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

export { getAccounts, getAccount, createAccount, deleteAccount, updateAccount };