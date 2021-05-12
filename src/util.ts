import { isBefore } from 'date-fns';
import { NextFunction, Request, Response } from 'express';

type ExpressAsyncHandler = (req: Request, res: Response) => Promise<unknown>;

/**
 * Wraps an async handler, catches any possible error, and passes it to Express middleware.
 *
 * We need this because express does not handle async middleware errors out of the box.
 * @param handler
 * @returns
 */
export function asyncHandler(handler: ExpressAsyncHandler) {
    return function (req: Request, res: Response, next: NextFunction) {
        handler(req, res).catch(next);
    };
}

/**
 * Returns whether the date has already passed or not.
 * @param date
 * @returns
 */
export function dateIsInPast(date: Date): boolean {
    return isBefore(date, new Date());
}
