import type { ObjectId } from 'mongodb';

export interface User {
    _id?: ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    passwordHash: string;
    createdAt: Date;
    status: 'Pending' | 'Confrimed';
}
