const Hapi = require('@hapi/hapi');
const Vision = require('@hapi/vision');
const Inert = require('@hapi/inert');
const ORM = require('@datawrapper/orm');
const Pug = require('pug');
const { findConfigPath } = require('@datawrapper/shared/node/findConfig');
const configPath = findConfigPath();
const config = require(configPath);
const path = require('path');

const start = async () => {
    const server = Hapi.Server({
        port: 3000,
        host: 'localhost',
        address: '0.0.0.0',
        tls: false,
        router: { stripTrailingSlash: true }
    });

    await ORM.init(config);
    await ORM.registerPlugins();

    await server.register(Vision);
    await server.register(Inert);

    server.method('config', key => (key ? config[key] : config));

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
};

start();
