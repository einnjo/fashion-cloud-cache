import { createApp } from './app';

const app = createApp();

app.listen(3000, '127.0.0.1', () => {
    console.log(`App listening at 127.0.0.1:3000`);
});
