import type { ObjectId } from 'mongodb';

export interface Accounts {
    _id?: ObjectId;
    userId?: ObjectId;
    accountName: string;
    accountType: string;
    balanace: number;
    currency: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
