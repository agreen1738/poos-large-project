import type { Response } from 'express';

interface MessageInterface {
    status: number;
    message: string;
}

const Messages = {
    USER: 'user ',
    USERS: 'users ',
    ACCOUNT: 'account ',
    ACCOUNTS: 'accounts ',
    TRANSACTION: 'transaction ',
    TRANSACTIONS: 'transactions ',
    BUDGET: 'budget ',
    BUDGETS: 'budgets ',
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
    NUMBER_TAKEN: 'account number already exists',
    FAILED: 'request failed. try again',
    ALREADY_EXISTS: 'already exists',

    AUTH_FAILED: 'authentication required: no token provided',
    INVALID_TOKEN: 'invalid token',
    VERIFICATION_SENT: 'verification email already sent. check email inbox',
    MISSING_TOKEN: 'missing verification token',
    EXPIRED_TOKEN: 'verification link expired',
    ALREADY_VERIFIED: 'account is already verified',
    EMAIL_VERIFIED: 'email verified successfully',
    NOT_VERIFIED: 'email is not verified. please verify before loggin in',
    RE_VERIFICATION: 'a new verification email has been sent',
    NEW_PASSWORD: 'password changed successfully',
} as const;

function errorResponse(res: Response, error: MessageInterface) {
    const { status = 500, message } = error;
    return res.status(status).json({ status: status, error: message });
}

function successResponse(res: Response, success: MessageInterface) {
    const { status = 200, message } = success;
    return res.status(status).json({ status: status, success: message });
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

function okStatus(res: Response, message: string) {
    successResponse(res, { status: 200, message: message });
}

function created(res: Response, message: string) {
    successResponse(res, { status: 201, message: message });
}

function deleted(res: Response, message: string) {
    successResponse(res, { status: 200, message: message });
}

function updated(res: Response, message: string) {
    successResponse(res, { status: 200, message: message });
}

function retrieved(res: Response, message: string) {
    successResponse(res, { status: 200, message: message });
}

export {
    Messages,
    badRequest,
    unauthorized,
    forbiden,
    notFound,
    internalServerError,
    created,
    deleted,
    updated,
    retrieved,
    okStatus,
};
