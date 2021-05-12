import Express, { Application, json } from 'express';
import { initialize as initializeOpenApi } from 'express-openapi';
import path from 'path';

import { apiDoc } from './api/v1/api-doc';

const PATH_TO_API_PATHS = path.join(__dirname, 'api', 'v1', 'paths');

export function createApp(): Application {
    const app = Express();

    // Adds support for JSON body
    app.use(json());

    initializeOpenApi({
        app,
        apiDoc,
        paths: PATH_TO_API_PATHS,
    });

    return app;
}
