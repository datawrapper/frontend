const got = require('got');
const get = require('lodash/get');

module.exports = function createAPI(config, auth) {
    const apiBase = `${config.api.https ? 'https' : 'http'}://${config.api.subdomain}.${
        config.api.domain
    }/v3`;
    const sessionID = get(config, 'api.sessionID');
    const session = get(auth, 'credentials.data.id', '');

    async function api(path, { json = true } = {}) {
        try {
            const response = await got(`${apiBase}${path}`, {
                headers: session
                    ? {
                          Cookie: `${sessionID}=${session}`
                      }
                    : undefined
            });
            if (json) {
                return JSON.parse(response.body);
            } else {
                return response.body;
            }
        } catch (x) {
            console.error(x);
        }
    }
    api.apiBase = apiBase;
    return api;
};
