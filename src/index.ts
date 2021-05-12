import { createApp } from './app';
import { config } from './config';

const app = createApp();

app.listen(config.PORT, config.HOST, () => {
    console.log(`App listening at ${config.HOST}:${config.PORT}`);
});
