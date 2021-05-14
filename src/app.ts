import Express, { Application, json } from 'express';
import { initialize as initializeOpenApi } from 'express-openapi';
import path from 'path';
import P from 'pino';

import { apiDoc } from './api/v1/api-doc';
import { loggerMiddleware } from './middleware/logger.js';
import { CacheService } from './services/cache.js';

const PATH_TO_API_PATHS = path.join(__dirname, 'api', 'v1', 'paths');

export function createApp(options: { logger: P.Logger; cacheService: CacheService }): Application {
    const app = Express();

    // Adds support for JSON body
    app.use(json());

    app.use(loggerMiddleware(options.logger));

    initializeOpenApi({
        app,
        apiDoc,
        paths: PATH_TO_API_PATHS,
    });

    app.locals.logger = options.logger;
    app.locals.cacheService = options.cacheService;

    return app;
}
