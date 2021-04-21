const { allScopes } = require('@datawrapper/service-utils/l10n');
const crypto = require('crypto');
const get = require('lodash/get');

const clientSideStoreCache = new Set(['messages']);

/*
 * set values for the global stores, based on request
 */
module.exports = function (request) {
    const { server, auth } = request;
    const { events, event } = server.app;
    const apiConfig = server.methods.config('api');
    const isAdmin = server.methods.isAdmin(request);
    const userLang =
        auth.isAuthenticated && auth.artifacts && auth.artifacts.id
            ? auth.artifacts.language
            : get(auth.credentials, 'data.data.dw-lang') || 'en-US';
    const context = {
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
            user:
                auth.isAuthenticated && auth.artifacts && auth.artifacts.id
                    ? {
                          id: auth.artifacts.id,
                          name: auth.artifacts.email,
                          language: userLang,
                          isAdmin: auth.artifacts.isAdmin(),
                          isGuest: false
                      }
                    : {
                          id: -1,
                          isGuest: true,
                          isAdmin: false,
                          language: userLang
                      },
            messages: allScopes(userLang || 'en-US'),
            adminPages: isAdmin
                ? events.emit(event.REGISTER_ADMIN_PAGE, { request }, { filter: 'success' })
                : null
        },
        storeHashes: {},
        storeCached: {}
    };
    // check client-side cache in cookie
    clientSideStoreCache.forEach(key => {
        const curHash = context.stores[key] ? md5(JSON.stringify(context.stores[key])) : null;
        context.storeHashes[key] = curHash;
        const clientHash = request.state[`DW-HASH-${key.toUpperCase()}`];
        if (clientHash && clientHash === curHash) {
            // the client aleady has a cache of the messages, let's not send them again
            // to save some bandwidth!
            context.storeCached[key] = true;
        }
    });
    return context;
};

function md5(string) {
    return crypto.createHash('md5').update(string).digest('hex');
}
