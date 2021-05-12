import { createApp } from './app';
import { config } from './config';
import { CreateLogger } from './logger.js';

const app = createApp();
const logger = CreateLogger();

app.listen(config.PORT, config.HOST, () => {
    logger.info(`Server listening at ${config.HOST}:${config.PORT}`);
});
