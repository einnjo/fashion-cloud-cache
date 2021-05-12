import { cleanEnv, str, port, host } from 'envalid';
import DotEnv from 'dotenv';

DotEnv.config();

export const config = cleanEnv(process.env, {
    APP: str(),
    PORT: port(),
    NODE_ENV: str({ choices: ['development', 'test', 'production', 'staging'] }),
    HOST: host(),
    TZ: str({ default: 'utc' }),
});
