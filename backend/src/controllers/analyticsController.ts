import { Request, Response } from 'express';
import { internalServerError, Messages, badRequest } from '../utils/messageHandler.js';
import { getDB } from '../database.js';
import { ObjectId } from 'mongodb';

async function getCategoryAnalytics(req: Request, res: Response) {
    try {
        const { accountId } = req.body;
        
        const database = getDB();
        const collection = database.collection('Transactions');
        const userId = new ObjectId(req.user!.id);

        // Build query based on whether we're filtering by account or not
        const query: any = { userId };
        
        if (accountId && accountId !== 'all') {
            query.accountId = new ObjectId(accountId);
        }

        // Get all transactions for the user (and optional account)
        const transactions = await collection.find(query).toArray();

        // Aggregate by category
        const categoryTotals: { [key: string]: number } = {
            'Savings': 0,
            'Living': 0,
            'Hobbies': 0,
            'Gambling': 0
        };

        transactions.forEach(transaction => {
            const category = transaction.category;
            // Only count expenses (negative amounts)
            if (transaction.amount < 0) {
                categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(transaction.amount);
            }
        });

        // Calculate total spending
        const totalSpending = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

        // Format data for pie chart
        const categories = Object.entries(categoryTotals).map(([name, value]) => ({
            name,
            value: parseFloat(value.toFixed(2)),
            percentage: totalSpending > 0 ? parseFloat(((value / totalSpending) * 100).toFixed(1)) : 0
        }));

        return res.status(200).json({
            categories,
            totalSpending: parseFloat(totalSpending.toFixed(2))
        });
    } catch (error) {
        internalServerError(res, error);
    }
}

export { getCategoryAnalytics };