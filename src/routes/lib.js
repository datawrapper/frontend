const path = require('path');
const chartCore = require('@datawrapper/chart-core');
const Boom = require('@hapi/boom');

module.exports = {
    name: 'routes/lib',
    version: '1.0.0',
    register: async (server, options) => {
        server.route([{
                path: '/chart-core/{file*}',
                method: 'GET',
                config: {
                    auth: false
                },
                handler: {
                    directory: {
                        path: chartCore.path.dist
                    }
                }
        }, {
            path: '/polyfills/{file*}',
            method: 'GET',
            config: {
                auth: false
            },
            handler: {
                directory: {
                    path: path.resolve(path.dirname(require.resolve('@datawrapper/polyfills/package.json')), 'polyfills')
                }
            }
        }, {
            path: '/csr/{file*}',
            method: 'GET',
            config: {
                auth: false
            },
            async handler(request, h) {
                const { file } = request.params;
                if (!file.endsWith('.svelte.js') && !file.endsWith('.svelte.ie.js')) return Boom.notFound();
                const IE = file.endsWith('.svelte.ie.js');
                const page = file.replace(IE ? '.svelte.ie.js' : '.svelte.js', '.svelte');
                const { csr, error } = await server.methods.getView(page);
                if (error) {
                    return Boom.notImplemented(error.message);
                }
                return IE ? server.methods.transpileView(page) : csr;
            }
        }]);
    }
};
