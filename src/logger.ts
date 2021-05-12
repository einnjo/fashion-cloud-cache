import Logger from 'pino';
import os from 'os';
import { config } from './config.js';

export function CreateLogger(): Logger.Logger {
    return Logger({
        base: {
            app: config.APP,
            hostname: os.hostname(),
            pid: process.pid,
            env: process.env.NODE_ENV ?? 'n/a',
            version: process.env.VERSION ?? 'n/a',
            nodeVersion: process.version,
        },
        formatters: {
            // Format log level as string instead of the default number
            level(label: string) {
                return { level: label };
            },
        },
    });
}
