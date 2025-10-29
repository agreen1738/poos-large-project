import { Request, Response } from 'express';
import { internalServerError, Messages, badRequest, notFound, deleted, created } from '../utils/messageHandler.js';
import { getDB } from '../database.js';
import { ObjectId } from 'mongodb';
import { Transactions } from '../models/Transactions.js';

async function getTransactions(req: Request, res: Response) {
    try {
        const database = getDB();
        const collection = database.collection('Transactions');
        const userId = new ObjectId(req.user!.id);
        const transactions = await collection.find({ userId }, { projection: { userId: 0 } }).toArray();

        if (transactions.length === 0) return badRequest(res, Messages.TRANSACTIONS + Messages.FAILED);

        return res.status(200).json(transactions);
    } catch (error) {
        internalServerError(res, error);
    }
}

async function getAccountTransactions(req: Request, res: Response) {
    try {
        const paramsLength = Object.keys(req.params).length;

        if (paramsLength !== 1) return badRequest(res, Messages.INCORRECT_FIELD_COUNT);

        const accountId = req.params.accountId;

        if (!accountId) return badRequest(res, Messages.MISSING_FIELDS);

        const database = getDB();
        const collection = database.collection('Transactions');
        const userId = new ObjectId(req.user!.id);
        const accountObjectId = new ObjectId(accountId);

        const transactions = await collection
            .find({ userId, accountId: accountObjectId }, { projection: { userId: 0 } })
            .toArray();

        if (transactions.length === 0) return badRequest(res, Messages.TRANSACTION + Messages.FAILED);

        return res.status(200).json(transactions);
    } catch (error) {
        internalServerError(res, error);
    }
}

async function getAccountTransaction(req: Request, res: Response) {
    try {
        const paramsLength = Object.keys(req.params).length;

        if (paramsLength !== 2) return badRequest(res, Messages.INCORRECT_FIELD_COUNT);

        const { id, accountId } = req.params;

        if (!id || !accountId) return badRequest(res, Messages.MISSING_FIELDS);

        const database = getDB();
        const collection = database.collection('Transactions');
        const userId = new ObjectId(req.user!.id);
        const transactionId = new ObjectId(id);
        const accountObjectId = new ObjectId(accountId);

        const transaction = await collection.findOne(
            {
                _id: transactionId,
                userId: userId,
                accountId: accountObjectId,
            },
            { projection: { userId: 0 } }
        );

        if (!transaction) return notFound(res, Messages.TRANSACTION + Messages.FAILED);

        return res.status(200).json(transaction);
    } catch (error) {
        internalServerError(res, error);
    }
}

async function deleteTransaction(req: Request, res: Response) {
    try {
        const paramsLength = Object.keys(req.params).length;

        if (paramsLength !== 2) return badRequest(res, Messages.INCORRECT_FIELD_COUNT);

        const { id, accountId } = req.params;

        if (!accountId || !id) return badRequest(res, Messages.MISSING_FIELDS);

        const database = getDB();
        const transactionsCollection = database.collection('Transactions');
        const accountsCollection = database.collection('Accounts');
        const userId = new ObjectId(req.user!.id);
        const transactionId = new ObjectId(id);
        const accountObjectId = new ObjectId(accountId);

        const account = await accountsCollection.findOne(
            { _id: accountObjectId, userId: userId },
            {
                projection: {
                    userId: 0,
                    accountName: 0,
                    accountType: 0,
                    accountNumber: 0,
                    accountInstitution: 0,
                    createdAt: 0,
                    isActive: 0,
                },
            }
        );

        if (!account) return notFound(res, Messages.ACCOUNT + Messages.FAILED);

        const transaction = await transactionsCollection.findOne({
            _id: transactionId,
            userId: userId,
            accountId: accountObjectId,
        });

        if (!transaction) return notFound(res, Messages.TRANSACTION + Messages.FAILED);

        const balance = account.balance + transaction.amount;
        const update = await accountsCollection.updateOne({ _id: accountObjectId }, { $set: { balance: balance } });

        if (!update.acknowledged) return badRequest(res, Messages.FAILED);

        const remove = await transactionsCollection.deleteOne({
            _id: transactionId,
            userId: userId,
            accountId: accountObjectId,
        });

        if (remove.deletedCount === 0) return badRequest(res, Messages.FAILED);

        return deleted(res, Messages.TRANSACTION + Messages.DELETED);
    } catch (error) {
        internalServerError(res, error);
    }
}

async function addTransaction(req: Request, res: Response) {
    try {
        const bodyLength = Object.keys(req.body).length;
        const paramsLength = Object.keys(req.params).length;

        if (paramsLength !== 1 || bodyLength !== 3) {
            return badRequest(res, Messages.INCORRECT_FIELD_COUNT);
        }

        const { accountId } = req.params;
        const { amount, category, type } = req.body;

        if (!accountId || !amount || !category || !type) {
            return badRequest(res, Messages.MISSING_FIELDS);
        }

        const database = getDB();
        const accountsCollection = database.collection('Accounts');
        const transactionsCollection = database.collection('Transactions');
        const userId = new ObjectId(req.user!.id);
        const accountObjectId = new ObjectId(accountId);

        const account = await accountsCollection.findOne(
            { _id: accountObjectId, userId: userId },
            {
                projection: {
                    userId: 0,
                    accountName: 0,
                    accountType: 0,
                    accountNumber: 0,
                    accountInstitution: 0,
                    createdAt: 0,
                    isActive: 0,
                },
            }
        );

        if (!account) return notFound(res, Messages.ACCOUNT + Messages.FAILED);

        const newTransaction: Transactions = {
            userId: userId,
            accountId: new ObjectId(accountId),
            amount: amount,
            category: category,
            type: type,
            date: new Date(),
        };

        const transaction = await transactionsCollection.insertOne(newTransaction);

        if (!transaction.acknowledged) return badRequest(res, Messages.TRANSACTION + Messages.FAILED);

        created(res, Messages.TRANSACTION + Messages.CREATED);
    } catch (error) {
        internalServerError(res, error);
    }
}

export { getTransactions, getAccountTransactions, getAccountTransaction, deleteTransaction, addTransaction };
