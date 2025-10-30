import type { ObjectId } from 'mongodb';

export interface Accounts {
    _id?: ObjectId;
    userId?: ObjectId;
    accountName: string;
    accountType: string;
    accountNumber: number;
    accountInstitution: string;
    balanace: number;
    currency: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
