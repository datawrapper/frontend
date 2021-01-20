module.exports = function (request) {
    // @todo: find a better place for this method
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
                  }
        }
    };
};
