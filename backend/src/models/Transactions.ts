import type { ObjectId } from 'mongodb';

export interface Transactions {
    _id?: ObjectId;
    userId?: ObjectId;
    accountId?: ObjectId;
    name: string;
    amount: number;
    category: string;
    type: string;
    date: Date;
}
