import { addSeconds, isBefore } from 'date-fns';
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

/**
 * Returns a new date "seconds" seconds into the future.
 * @param seconds
 * @returns
 */
export function dateNowPlusSeconds(seconds: number): Date {
    return addSeconds(new Date(), seconds);
}

/**
 * Takes "take" map entries after skipping "skip" map entries.
 * @param map
 * @param skip
 * @param take
 * @returns
 */
export function takeMapEntries<K, V>(map: Map<K, V>, skip: number, take: number): Array<[K, V]> {
    if (map.size === 0) {
        return [];
    }

    const entries = map.entries();

    let skipped = 0;
    let done = false;
    while (skipped < skip && !done) {
        skipped++;
        const next = entries.next();
        done = next.done ?? true;
    }

    let taken = 0;
    const takenEntries = [];
    while (taken < take && !done) {
        taken++;
        const next = entries.next();
        if (next.value != undefined) {
            takenEntries.push(next.value);
        }
        done = next.done ?? true;
    }

    return takenEntries;
}

/**
 * A promise that resolves after "millis" milliseconds
 * @param ms
 * @returns
 */
export async function sleep(millis: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, millis);
    });
}
