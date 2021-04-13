const { allScopes } = require('@datawrapper/service-utils/l10n');

module.exports = {
    name: 'routes/stores',
    version: '1.0.0',
    register: async (server, options) => {
        server.route([
            {
                path: '/messages.json',
                method: 'GET',
                async handler(request, h) {
                    const { auth } = request;
                    const lang = server.methods.getUserLanguage(auth);
                    return allScopes(lang || 'en-US');
                }
            }
        ]);
    }
};
