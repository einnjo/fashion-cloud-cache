import Express, { Application, json } from 'express';
import { initialize as initializeOpenApi } from 'express-openapi';
import path from 'path';
import P from 'pino';
import swaggerUi from 'swagger-ui-express';

import { apiDoc } from './api/v1/api-doc';
import { errorMiddleware } from './middleware/error.js';
import { loggerMiddleware } from './middleware/logger.js';
import { notFoundMiddleware } from './middleware/not-found.js';
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
        enableObjectCoercion: true,
        validateApiDoc: true,
        exposeApiDocs: true,
        docsPath: '/swagger.json',
    });

    app.use(
        '/v1/swagger-ui',
        swaggerUi.serve,
        swaggerUi.setup(undefined, { swaggerUrl: '/v1/swagger.json' }),
    );
    app.use(notFoundMiddleware);
    app.use(errorMiddleware);

    app.locals.logger = options.logger;
    app.locals.cacheService = options.cacheService;

    return app;
}
