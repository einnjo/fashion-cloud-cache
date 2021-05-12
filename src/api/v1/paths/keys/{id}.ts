import { Request, Response } from 'express';
import { Operation } from 'express-openapi';
import { NotImplemented } from 'http-errors';

import { asyncHandler } from '../../../../util.js';

export const parameters = [
    {
        in: 'path',
        name: 'id',
        required: true,
    },
];

export const GET: Operation = asyncHandler(async function getById(_req: Request, _res: Response) {
    throw new NotImplemented();
});

GET.apiDoc = {
    description: 'Returns the cached data for a given key id',
    tags: ['keys'],
    operationId: 'keys.getById',
    responses: {
        200: {
            description: 'The value stored at key',
        },
    },
};
