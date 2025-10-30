import type { ObjectId } from 'mongodb';

export interface Budget {
    _id?: ObjectId;
    userId: ObjectId;
    category: string;
    limit: number;
    currentSpending: number;
    month: string;
    createdAt: Date;
    updatedAt: Date;
}
