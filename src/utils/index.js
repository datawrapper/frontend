const get = require('lodash/get');

function getUserLanguage(auth) {
    return auth.isAuthenticated && auth.artifacts && auth.artifacts.id
        ? auth.artifacts.language
        : get(auth.credentials, 'data.data.dw-lang') || 'en-US';
}

module.exports = {
    getUserLanguage
};
