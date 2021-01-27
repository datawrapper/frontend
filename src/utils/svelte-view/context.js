const { allScopes } = require('../l10n');
/*
 * set values for the global stores, based on request
 */
module.exports = function (request) {
    const { server, auth } = request;
    const { events, event } = server.app;
    const apiConfig = server.methods.config('api');
    const isAdmin = server.methods.isAdmin(request);
    return {
        stores: {
            config: {
                apiDomain: `${apiConfig.subdomain}.${apiConfig.domain}`,
                dev: process.env.DW_DEV_MODE
            },
            request: {
                url: request.url,
                path: request.path,
                params: request.params,
                query: request.query
            },
            user: auth.isAuthenticated
                ? {
                      id: auth.artifacts.id,
                      name: auth.artifacts.email,
                      language: auth.artifacts.language,
                      isAdmin: auth.artifacts.isAdmin(),
                      isGuest: false
                  }
                : {
                      id: -1,
                      isGuest: true,
                      isAdmin: false
                  },
            messages: allScopes(auth.artifacts.language || 'en-US'),
            adminPages: isAdmin
                ? events.emit(event.REGISTER_ADMIN_PAGE, { request }, { filter: 'success' })
                : null
        }
    };
};
