import { NextFunction, Request, Response } from 'express';
import P from 'pino';
import pinoHttp from 'pino-http';

export function loggerMiddleware(logger: P.Logger) {
    const httpLogger = pinoHttp({ logger, autoLogging: true });
    return function (req: Request, res: Response, next: NextFunction) {
        httpLogger(req, res);
        next();
    };
}
