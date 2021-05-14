# Fashion Cloud's Cache API

## Configuration

This projects uses [DotEnv](https://github.com/motdotla/dotenv#readme) and [Envalid](https://github.com/af/envalid#readme) for managing configuration.

Take a look at the [configuration](src/config.ts) file for info on the expected values.

The `.env` file should be placed at the root of the dir from which the project is started.

Here's an example configuration file:

```
APP=fashion-cloud-cache-api
NODE_ENV=development
HOST=127.0.0.1
PORT=3000
CACHE_KIND=MONGO
CACHE_TTL_SECONDS=60
CACHE_MAX_CAPACITY=1000
CACHE_EVICTION_STRATEGY=LEAST_RECENTLY_USED
DB_URI=mongodb://localhost:27017
DB_NAME=fashion_cloud
DB_COLLECTION=cache
```

## Running the project

1.  Clone to a local dir

```
git clone git@github.com:einnjo/fashion-cloud-cache.git
```

2. Install Dependencies

```
yarn install
```

3. Install and run [mongo](https://docs.mongodb.com/manual/tutorial/getting-started/)

4. Make sure `.env` file with [configuration](##configuration) is present under root folder

5. Transpile code

```
yarn build
```

6. Start server

```
yarn start
```

## Common Tasks

-   Install dependencies

```
yarn install
```

-   Build distributable artifacts

```
yarn build
```

-   Dev mode (build -> start on change)

```
yarn dev
```

-   Run all tests

```
yarn test
```

-   Run unit tests

```
yarn test:unit
```

-   Run integration tests

```
yarn test:integration
```

-   Test coverage report

```
yarn test:cov
```

-   Format code

```
yarn format
```

-   Check if code complies with format

```
yarn format:check
```

-   Lint code

```
yarn lint
```
