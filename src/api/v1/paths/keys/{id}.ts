import { Request, Response } from 'express';
import { Operation } from 'express-openapi';
import { CacheService } from '../../../../services/cache.js';

import { asyncHandler } from '../../../../util';

export const parameters = [
    {
        in: 'path',
        name: 'id',
        required: true,
    },
];

export const GET: Operation = asyncHandler(async function getById(req: Request, res: Response) {
    const cacheService = req.app.locals.cacheService as CacheService;
    const key = req.params.id;
    const value = await cacheService.getKey(key);

    return res.status(200).json({ key, value });
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
