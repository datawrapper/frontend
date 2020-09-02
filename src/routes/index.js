module.exports = {
    name: 'routes',
    version: '1.0.0',
    register: async(server, options) => {
        await server.register(require('./preview'), {
            routes: {
                prefix: '/preview'
            }
        });

        await server.register(require('./lib'), {
            routes: {
                prefix: '/lib'
            }
        });
    }
};
