const { allScopes } = require('../l10n');
/*
 * set values for the global stores, based on request
 */
module.exports = function (request) {
    const apiConfig = request.server.methods.config('api');
    const { auth } = request;
    return {
        stores: {
            config: {
                apiDomain: `${apiConfig.subdomain}.${apiConfig.domain}`,
                dev: process.env.DW_DEV_MODE
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
            messages: allScopes(auth.artifacts.language || 'en-US')
        }
    };
};
