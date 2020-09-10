const Boom = require('@hapi/boom');
const get = require('lodash/get');
const { User, Session } = require('@datawrapper/orm/models');
const { cookieValidation, adminValidation, getUser, getCookieAuthScheme } = require('@datawrapper/shared/node/auth');
const cookieAuthScheme = getCookieAuthScheme(true);

const DWAuth = {
    name: 'dw-auth',
    version: '1.0.0',
    register: async (server, options) => {
        function isAdmin(request, { throwError = false } = {}) {
            const check = get(request, ['auth', 'artifacts', 'role'], '') === 'admin';

            if (throwError && !check) {
                throw Boom.unauthorized();
            }

            return check;
        }

        server.method('isAdmin', isAdmin);

        server.auth.scheme('cookie-auth', cookieAuthScheme);
        server.auth.scheme('dw-auth', dwAuth);

        server.auth.strategy('session', 'cookie-auth', { validate: cookieValidation });
        server.auth.strategy('admin', 'dw-auth', { validate: adminValidation });
        server.auth.strategy('simple', 'dw-auth');

        server.auth.default('simple');
    }
};

function dwAuth(server, options = {}) {
    const scheme = {
        authenticate: async (request, h) => {
            let credentials = {};
            let artifacts = {};

            try {
                const cookie = await server.auth.test('session', request);
                credentials = cookie.credentials;
                artifacts = cookie.artifacts;
            } catch (error) {
                throw Boom.unauthorized('Invalid authentication credentials', ['Session']);
            }

            if (options.validate) {
                options.validate({ credentials, artifacts });
            }

            return h.authenticated({ credentials, artifacts });
        }
    };

    return scheme;
}

module.exports = DWAuth;
