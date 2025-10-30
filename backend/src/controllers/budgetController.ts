import { Request, Response } from 'express';
import {
    badRequest,
    created,
    deleted,
    internalServerError,
    Messages,
    notFound,
    updated,
} from '../utils/messageHandler.js';
import { Budget } from '../models/Budget.js';
import { ObjectId } from 'mongodb';
import { getDB } from '../database.js';

async function createBudget(req: Request, res: Response) {
    try {
        const bodyLength = Object.keys(req.body).length;

        if (bodyLength !== 4) badRequest(res, Messages.INCORRECT_FIELD_COUNT);

        const { category, limit, currentSpending, month } = req.body;

        if (!category || !limit || !currentSpending || !month) badRequest(res, Messages.MISSING_FIELDS);

        const userId = new ObjectId(req.user!.id);

        const database = getDB();
        const collection = database.collection('Budget');
        const budget = await collection.findOne({ category });

        if (budget) return badRequest(res, Messages.BUDGET + Messages.ALREADY_EXISTS);

        const newBudget: Budget = {
            userId: userId,
            category: category,
            limit: limit,
            currentSpending: currentSpending,
            month: month,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const budgetResult = await collection.insertOne(newBudget);

        if (!budgetResult.acknowledged) return badRequest(res, Messages.BUDGET + Messages.FAILED);

        return created(res, Messages.BUDGET + Messages.CREATED);
    } catch (error) {
        return internalServerError(res, error);
    }
}
async function getBudgets(req: Request, res: Response) {
    try {
        const database = getDB();
        const collection = database.collection('Budget');
        const userId = new ObjectId(req.user!.id);
        const budgets = await collection.find({ userId: userId }, { projection: { userId: 0 } }).toArray();

        if (budgets.length === 0) return notFound(res, Messages.BUDGETS + Messages.FAILED);

        return res.status(200).json(budgets);
    } catch (error) {
        return internalServerError(res, error);
    }
}

async function getBudget(req: Request, res: Response) {
    try {
        const paramsLength = Object.keys(req.params).length;

        if (paramsLength !== 1) return badRequest(res, Messages.INCORRECT_FIELD_COUNT);

        const id = req.params.id;

        if (!id) return badRequest(res, Messages.MISSING_FIELDS);

        const budgetId = new ObjectId(id);
        const userId = new ObjectId(req.user!.id);
        const database = getDB();
        const collection = database.collection('Budget');
        const budget = await collection.findOne({ userId: userId, _id: budgetId });

        if (!budget) return notFound(res, Messages.BUDGET + Messages.FAILED);

        return res.status(200).json(budget);
    } catch (error) {
        return internalServerError(res, error);
    }
}
async function updateBudget(req: Request, res: Response) {
    try {
        const paramsLength = Object.keys(req.params).length;

        if (paramsLength !== 1) return badRequest(res, Messages.INCORRECT_FIELD_COUNT);

        const id = req.params.id;

        if (!id) return badRequest(res, Messages.MISSING_FIELDS);

        const database = getDB();
        const collection = database.collection('Budget');
        const userId = new ObjectId(req.user!.id);
        const budgetId = new ObjectId(id);
        const allowedFields = ['firstName', 'lastName', 'email', 'phone'];
        const fields = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));

        if (Object.keys(fields).length === 0) return badRequest(res, Messages.MISSING_FIELDS);

        const update = await collection.updateOne({ userId: userId, _id: budgetId }, { $set: { ...fields } });

        if (!update.acknowledged) return badRequest(res, Messages.BUDGET + Messages.FAILED);

        return updated(res, Messages.USER + Messages.UPDATED);
    } catch (error) {
        internalServerError(res, error);
    }
}
async function deleteBudget(req: Request, res: Response) {
    try {
        const paramsLength = Object.keys(req.params).length;

        if (paramsLength !== 1) return badRequest(res, Messages.INCORRECT_FIELD_COUNT);

        const id = req.params.id;

        if (!id) return badRequest(res, Messages.MISSING_FIELDS);

        const database = getDB();
        const collection = database.collection('Budget');
        const userId = new ObjectId(req.user!.id);
        const budgetId = new ObjectId(id);

        const budget = await collection.deleteOne({ _id: userId });

        if (budget.deletedCount === 0) return badRequest(res, Messages.USER + Messages.FAILED);

        deleted(res, Messages.BUDGET + Messages.DELETED);
    } catch (error) {
        return internalServerError(res, error);
    }
}

export { createBudget, getBudgets, getBudget, updateBudget, deleteBudget };
