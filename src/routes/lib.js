const path = require('path');
const chartCore = require('@datawrapper/chart-core');
const Boom = require('@hapi/boom');

module.exports = {
    name: 'routes/lib',
    version: '1.0.0',
    register: async (server, options) => {
        server.route([
            {
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
            },
            {
                path: '/polyfills/{file*}',
                method: 'GET',
                config: {
                    auth: false
                },
                handler: {
                    directory: {
                        path: path.resolve(
                            path.dirname(require.resolve('@datawrapper/polyfills/package.json')),
                            'polyfills'
                        )
                    }
                }
            },
            {
                path: '/requirejs/{file*}',
                method: 'GET',
                config: {
                    auth: false
                },
                handler: {
                    directory: {
                        path: path.dirname(require.resolve('requirejs/package.json'))
                    }
                }
            },
            {
                path: '/csr/{file*}',
                method: 'GET',
                config: {
                    auth: false
                },
                async handler(request, h) {
                    const { file } = request.params;
                    const { anonymous } = request.query;
                    const isIE = file.endsWith('.svelte.ie.js');
                    const isJS = file.endsWith('.js');
                    const page = isJS
                        ? file.replace(isIE ? '.svelte.ie.js' : '.svelte.js', '.svelte')
                        : `${file}.js`;
                    const { csr, error } = await server.methods.getView(page); // FIXME
                    if (error) {
                        return Boom.notImplemented(error.message);
                    }
                    return h
                        .response(
                            isIE
                                ? server.methods.transpileView(page) // FIXME
                                : anonymous
                                ? csr.replace("define('App',", 'define(')
                                : csr
                        )
                        .header('Content-Type', 'application/javascript');
                }
            }
        ]);
    }
};
