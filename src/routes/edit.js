const path = require('path');
const { readdir } = require('fs').promises;

module.exports = {
    name: 'routes/edit',
    version: '1.0.0',
    register: async (server, options) => {
        server.methods.prepareView('HelloWorld.svelte');

        server.route({
            method: 'GET',
            path: '/{id}',
            options: {
                // auth: false,
                async handler(request, h) {
                    return h.view('edit/Edit.svelte', {
                        props: {
                            visualizations: Array.from(server.app.visualizations.keys()).map(key =>
                                server.app.visualizations.get(key)
                            )
                        }
                    });
                }
            }
        });

        server.methods.prepareView('edit/Edit.svelte');
    }
};
