const path = require('path');
const { readdir } = require('fs').promises;

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
                    // note: in a real-world scenario we would want to cache the icon list
                    // so we don't have to read the file system on every request
                    const iconPath = path.resolve(
                        path.dirname(require.resolve('@datawrapper/icons/package.json')),
                        'src/icons'
                    );
                    const icons = (await readdir(iconPath)).map(file => file.replace('.svg', ''));
                    return h.view('HelloWorld.svelte', {
                        props: {
                            icons,
                            magicNumber: 42,
                            visualizations: Array.from(server.app.visualizations.keys()).map(key =>
                                server.app.visualizations.get(key)
                            )
                        }
                    });
                }
            }
        });
    }
};
