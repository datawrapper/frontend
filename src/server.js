const Hapi = require('@hapi/hapi');
const Vision = require('@hapi/vision');
const Inert = require('@hapi/inert');
const Pino = require('hapi-pino');
const ORM = require('@datawrapper/orm');
const Pug = require('pug');
const {
    validateAPI,
    validateORM,
    validateFrontend,
    validateRedis
} = require('@datawrapper/schemas/config');
const { requireConfig } = require('@datawrapper/service-utils/findConfig');
const config = requireConfig();
const path = require('path');
const SvelteView = require('./utils/svelte-view');
const {
    getView,
    prepareView,
    prepareAllViews,
    transpileView
} = require('./utils/svelte-view/cache');

const start = async () => {
    validateAPI(config.api);
    validateORM(config.orm);
    validateFrontend(config.frontend);

    let useRedis = !!config.redis;

    if (useRedis) {
        try {
            validateRedis(config.redis);
        } catch (error) {
            useRedis = false;
            console.warn('[Cache] Invalid Redis configuration, falling back to in memory cache.');
        }
    }

    const server = Hapi.Server({
        port: process.env.PORT || 3000,
        host: 'localhost',
        address: '0.0.0.0',
        tls: false,
        cache: {
            provider: useRedis
                ? {
                      constructor: require('@hapi/catbox-redis'),
                      options: {
                          ...config.redis,
                          partition: 'api'
                      }
                  }
                : {
                      constructor: require('@hapi/catbox-memory'),
                      options: {
                          maxByteSize: 52480000
                      }
                  }
        },
        router: { stripTrailingSlash: true }
    });

    await ORM.init(config);
    await ORM.registerPlugins();
    await server.register(Vision);
    await server.register(Inert);

    await server.register({
        plugin: Pino,
        options: {
            prettyPrint: true,
            timestamp: () => `,"time":"${new Date().toISOString()}"`,
            logEvents: ['request', 'log', 'onPostStart', 'onPostStop', 'request-error'],
            level: process.env.DW_DEV_MODE
                ? 'debug'
                : process.env.NODE_ENV === 'test'
                ? 'error'
                : 'info',
            base: { name: process.env.COMMIT || require('../package.json').version },
            redact: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]']
        }
    });

    server.method('config', key => (key ? config[key] : config));
    server.method('logAction', require('@datawrapper/orm/utils/action').logAction);

    server.views({
        engines: {
            pug: Pug,
            svelte: SvelteView
        },
        relativeTo: __dirname,
        compileOptions: {
            basedir: path.join(__dirname, 'views')
        },
        path: 'views',
        context: SvelteView.context,
        isCached: !process.env.DW_DEV_MODE
    });

    server.method('getView', getView);
    server.method('prepareView', prepareView);
    server.method('transpileView', transpileView);

    await server.register(require('./auth/dw-auth'));
    await server.register([require('./routes')]);
    await server.register([require('./plugin-loader')]);

    // wait for all prepared views
    await prepareAllViews();
    await server.start();

    setTimeout(() => {
        if (process.send) {
            server.logger.info('sending READY signal to pm2');
            process.send('ready');
        }
    }, 100);

    process.on('SIGINT', async function () {
        server.logger.info('received SIGINT signal, closing all connections...');
        await server.stop();
        server.logger.info('server has stopped');
        process.exit(0);
    });
};

start();
