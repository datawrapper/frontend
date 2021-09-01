const path = require('path');
const { readdir } = require('fs').promises;

module.exports = {
    name: 'routes/dashboard',
    version: '1.0.0',
    register: async (server, options) => {
        server.methods.prepareView('dashboard/Index.svelte');

        server.route({
            method: 'GET',
            path: '/',
            options: {
                auth: 'user',
                async handler(request, h) {
                    return h.view('dashboard/Index.svelte', {
                        props: {}
                    });
                }
            }
        });
    }
};
