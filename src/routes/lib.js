const path = require('path');
const chartCore = require('@datawrapper/chart-core');

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
            }
        ]);
    }
};
