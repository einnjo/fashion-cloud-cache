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
    description: 'Deletes all entries from the cache',
    tags: ['keys'],
    operationId: 'keys.deleteAll',
    responses: {
        204: {
            description: 'Successfull Empty Response',
        },
    },
};
