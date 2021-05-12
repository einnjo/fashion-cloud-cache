import Express, { Application } from 'express';

export function createApp(): Application {
    const app = Express();

    return app;
}
