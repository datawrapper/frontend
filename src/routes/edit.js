const path = require('path');
const { readdir } = require('fs').promises;

module.exports = {
    name: 'routes/edit',
    version: '1.0.0',
    register: async (server, options) => {
        server.methods.prepareView('HelloWorld.svelte');

        server.route({
            method: 'GET',
            path: '/{id}/{step?}',
            options: {
                // auth: false,
                async handler(request, h) {
                    return h.view('edit/Index.svelte', {
                        props: {
                            initUrlStep: request.params.step,
                            visualizations: Array.from(server.app.visualizations.keys()).map(key =>
                                server.app.visualizations.get(key)
                            )
                        }
                    });
                }
            }
        });

        server.methods.prepareView('edit/Index.svelte');
    }
};
