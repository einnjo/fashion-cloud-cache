import { NextFunction, Request, Response } from 'express';
import { notFound } from '@hapi/boom';

export function notFoundMiddleware(_req: Request, _res: Response, next: NextFunction) {
    next(notFound());
}
