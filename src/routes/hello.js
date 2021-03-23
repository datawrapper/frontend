
module.exports = {
    name: 'routes/hello',
    version: '1.0.0',
    register: async (server, options) => {

        server.methods.prepareView('HelloWorld.svelte');

        server.route({
            method: 'GET',
            path: '/',
            options: {
                // auth: false,
                async handler(request, h) {
                    return h.view('HelloWorld.svelte', {
                        props: {
                            magicNumber: 42
                        }
                    });
                }
            }
        });

    }
};
