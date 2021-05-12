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

export const PUT: Operation = asyncHandler(async function getById(req: Request, res: Response) {
    const cacheService = req.app.locals.cacheService as CacheService;
    const key = req.params.id;
    await cacheService.upsertKey(key, req.body.value);

    return res.status(204).json();
});

PUT.apiDoc = {
    description: 'Upserts a new key in the cache',
    tags: ['keys'],
    operationId: 'keys.upsert',
    responses: {
        204: {
            description: 'Successfull Empty Response',
        },
    },
};

export const DELETE: Operation = asyncHandler(async function deleteById(
    req: Request,
    res: Response,
) {
    const cacheService = req.app.locals.cacheService as CacheService;
    const key = req.params.id;
    await cacheService.deleteKey(key);

    return res.status(204).json();
});

PUT.apiDoc = {
    description: 'Deletes a specific key from the cache',
    tags: ['keys'],
    operationId: 'keys.deleteById',
    responses: {
        204: {
            description: 'Successfull Empty Response',
        },
    },
};
