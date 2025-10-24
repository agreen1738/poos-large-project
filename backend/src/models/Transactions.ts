import type { ObjectId } from 'mongodb';

export interface Transactions {
    _id?: ObjectId;
    userId?: ObjectId;
    accountID?: ObjectId;
    amount: string;
    currency: string;
    category: string;
    type: string;
    date: Date;
}
