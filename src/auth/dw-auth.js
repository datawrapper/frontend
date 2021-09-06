const Boom = require('@hapi/boom');
const Bell = require('@hapi/bell');
const get = require('lodash/get');
const { cookieValidation, adminValidation, createCookieAuthScheme } =
    require('@datawrapper/service-utils/auth')(require('@datawrapper/orm/models'));
const cookieAuthScheme = createCookieAuthScheme(true);

const DWAuth = {
    name: 'dw-auth',
    version: '1.0.0',
    register: async (server, options) => {
        const oauth = server.methods.config('general').oauth;

        function isAdmin(request, { throwError = false } = {}) {
            const check = get(request, ['auth', 'artifacts', 'role'], '') === 'admin';

            if (throwError && !check) {
                throw Boom.unauthorized();
            }

            return check;
        }

        server.method('isAdmin', isAdmin);

        await server.register(Bell);
        server.auth.scheme('cookie-auth', cookieAuthScheme);
        server.auth.scheme('dw-auth', dwAuth);

        server.auth.strategy('session', 'cookie-auth', { validate: cookieValidation });
        server.auth.strategy('admin', 'dw-auth', { validate: adminValidation });
        server.auth.strategy('simple', 'dw-auth');

        server.auth.default('simple');

        for (var provider in oauth) {
            if (!Object.keys(Bell.providers).includes(provider)) {
                server.logger.warn(
                    `Could not configure oAuth provider ${provider}, as it's not supported by @hapi/bell.`
                );
                continue;
            }

            const p = oauth[provider];

            server.auth.strategy(provider, 'bell', {
                provider: provider,
                password: oauth.password,
                clientId: p.id,
                clientSecret: p.secret,

                /* this combination of settings is necessary because the node process
                 * speaks HTTP internally, but externally HTTPS through nginx */
                isSecure: false,
                forceHttps: true
            });

            server.logger.info(`Registered oAuth provider ${provider}`);
        }
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
