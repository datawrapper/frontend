const Boom = require('@hapi/boom');
const Bell = require('@hapi/bell');
const get = require('lodash/get');
const { User, Session } = require('@datawrapper/orm/models');
const { cookieValidation, adminValidation, getUser, createCookieAuthScheme } = require('@datawrapper/service-utils/auth')(require('@datawrapper/orm/models'));
const cookieAuthScheme = createCookieAuthScheme(true);

const DWAuth = {
    name: 'dw-auth',
    version: '1.0.0',
    register: async (server, options) => {
        const oauth = server.methods.config('oauth');

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
            const p = oauth[provider];

            server.auth.strategy(provider, 'bell', {
                provider: provider,
                password: 'cookie_encryption_password_secure',
                clientId: p.id,
                clientSecret: p.secret,
                isSecure: server.methods.config('frontend.https')
            });

            server.route({
                method: ['GET', 'POST'],    // Must handle both GET and POST
                path: `/oauth/${provider}`,             // The callback endpoint registered with the provider
                options: {
                    auth: {
                        mode: 'try',
                        strategy: provider
                    },
                    handler: function (request, h) {
                        if (!request.auth.isAuthenticated) {
                            return `Authentication failed due to: ${request.auth.error.message}`;
                        }

                        console.log(request.auth.credentials);

                        // Perform any account lookup or registration, setup local session,
                        // and redirect to the application. The third-party credentials are
                        // stored in request.auth.credentials. Any query parameters from
                        // the initial request are passed back via request.auth.credentials.query.

                        return h.redirect('/home');
                    }
                }
            });
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
