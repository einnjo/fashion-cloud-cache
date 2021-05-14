import { Request, Response } from 'express';
import { Operation } from 'express-openapi';
import { CacheService } from '../../../../services/cache.js';

import { asyncHandler } from '../../../../util';

export const DELETE: Operation = asyncHandler(async function deleteAll(
    req: Request,
    res: Response,
) {
    const cacheService = req.app.locals.cacheService as CacheService;
    await cacheService.deleteAllKeys();

    return res.status(204).json();
});

DELETE.apiDoc = {
    summary: 'Deletes all entries from the cache',
    tags: ['keys'],
    operationId: 'keys.deleteAll',
    responses: {
        204: {
            description: 'Successfull Empty Response',
        },
    },
};

type GetManyQuery = { query: { skip?: number; take?: number } };

export const GET: Operation = asyncHandler(async function getMany(
    req: Request & GetManyQuery,
    res: Response,
) {
    const cacheService = req.app.locals.cacheService as CacheService;
    const skip = req.query.skip ?? 0;
    const take = req.query.take ?? 10;
    const keys = await cacheService.getKeys(skip, take);

    return res.status(200).json({ data: keys });
});

GET.apiDoc = {
    summary: 'Gets a list of keys in the cache',
    tags: ['keys'],
    operationId: 'keys.getMany',
    parameters: [
        {
            name: 'skip',
            in: 'query',
            description: 'The number of keys to skip before taking',
            type: 'integer',
        },
        {
            name: 'take',
            in: 'query',
            description: 'The number of keys to take after skipping',
            type: 'integer',
        },
    ],
    responses: {
        200: {
            description: 'A list of keys in the cache',
        },
    },
};
