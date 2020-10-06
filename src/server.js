const Hapi = require('@hapi/hapi');
const Vision = require('@hapi/vision');
const Inert = require('@hapi/inert');
const Pino = require('hapi-pino');
const ORM = require('@datawrapper/orm');
const Pug = require('pug');
const { requireConfig } = require('@datawrapper/service-utils/findConfig');
const config = requireConfig();
const path = require('path');

const start = async () => {
    const server = Hapi.Server({
        port: process.env.PORT || 3000,
        host: 'localhost',
        address: '0.0.0.0',
        tls: false,
        state: {
            isSameSite: 'Lax'
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
                : process.env.NODE_ENV == 'test'
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
            pug: Pug
        },
        relativeTo: __dirname,
        compileOptions: {
            basedir: path.join(__dirname, 'views')
        },
        path: 'views'
    });

    await server.register(require('./auth/dw-auth'));
    await server.register([require('./routes')]);
    await server.start();

    setTimeout(() => {
        if (process.send) {
            server.logger.info('sending READY signal to pm2');
            process.send('ready');
        }
    }, 100);

    process.on('SIGINT', async function() {
        server.logger.info('received SIGINT signal, closing all connections...');
        await server.stop();
        server.logger.info('server has stopped');
        process.exit(0);
    });
};

start();
