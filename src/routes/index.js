module.exports = {
    name: 'routes',
    version: '1.0.0',
    register: async (server, options) => {
        await server.register(require('./signin'), {
            routes: {
                prefix: '/signin'
            }
        });

        await server.register(require('./preview/index.js'), {
            routes: {
                prefix: '/preview'
            }
        });

        await server.register(require('./lib'), {
            routes: {
                prefix: '/lib'
            }
        });

        if (server.methods.isDevMode()) {
            await server.register(require('./hello'), {
                routes: {
                    prefix: '/v2/hello'
                }
            });
        }

        await server.register(require('./create'), {
            routes: {
                prefix: '/create'
            }
        });

        server.methods.prepareView('Error.svelte');
    }
};
