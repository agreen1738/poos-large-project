import type { Response } from 'express';

interface MessageInterface {
    status: number;
    message: string;
}

const Messages = {
    USER: 'user ',
    ACCOUNT: 'account ',
    TRANSACTION: 'transaction ',
    CREATED: 'created successfully',
    UPDATED: 'updated successfully',
    DELETED: 'deleted successfully',
    RETRIEVED: 'retrieved successfully',

    INTERNAL_ERROR: 'server error. please try again',
    INCORRECT_FIELD_COUNT: 'incorrect numbers of fields',
    MISSING_FIELDS: 'missing required fields',
    INVALID_CREDENTIAL: 'invalid credentials',
    EMAIL_EXISTS: 'email already exists',
    INVALID_ACCOUNT: 'invalid account name',
    NAME_TAKEN: 'name is taken. try another',
    FAILED: 'request failed. try again',
} as const;

function errorResponse(res: Response, error: MessageInterface) {
    const { status = 500, message } = error;
    return res.status(status).json({ error: message });
}

function successResponse(res: Response, success: MessageInterface) {
    const { status = 200, message } = success;
    return res.status(status).json({ success: message });
}

function badRequest(res: Response, message: string) {
    errorResponse(res, { status: 400, message: message });
}

function unauthorized(res: Response, message: string) {
    errorResponse(res, { status: 401, message: message });
}

function forbiden(res: Response, message: string) {
    errorResponse(res, { status: 403, message: message });
}

function notFound(res: Response, message: string) {
    errorResponse(res, { status: 404, message: message });
}

function internalServerError(res: Response, error: any) {
    console.error(error);
    errorResponse(res, { status: 500, message: Messages.INTERNAL_ERROR });
}

function created(res: Response, message: string) {
    successResponse(res, { status: 201, message: message });
}

function deleted(res: Response, message: string) {
    successResponse(res, { status: 204, message: message });
}

function updated(res: Response, message: string) {
    successResponse(res, { status: 204, message: message });
}

export { Messages, badRequest, unauthorized, forbiden, notFound, internalServerError, created, deleted, updated };
