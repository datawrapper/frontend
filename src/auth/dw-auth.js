const Boom = require('@hapi/boom');
const get = require('lodash/get');
const getUser = require('./get-user');
const authUtils = require('./utils.js');
const generate = require('nanoid/generate');
const { User, Session, ChartAccessToken, AccessToken } = require('@datawrapper/orm/models');

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

function cookieAuthScheme(server, options) {
    const api = server.methods.config('api');
    const opts = { cookie: api.sessionID, ...options };

    server.state(opts.cookie, getStateOpts(server, 90));

    const scheme = {
        authenticate: async (request, h) => {
            let session = request.state[opts.cookie];

            /**
             * Sometimes there are 2 session cookies, in the staging environment, with name
             * DW-SESSION. The reason is that the same name is used on live (.datawrapper.de) and
             * staging (.staging.datawrapper.de). The cookie parser therefore returns an array with
             * both cookies and since the server doesn't send any information which cookie belongs
             * to which domain, the code relies on the server sending the more specific cookie
             * first. This is fine since it only happens on staging and the quick fix is to delete
             * the wrong cookie in dev tools.
             *
             * More information and a similar issue can be found on Github:
             * https://github.com/jshttp/cookie/issues/18#issuecomment-30344206
             */
            if (Array.isArray(session)) {
                session = session[0];
            }

            const {
                isValid,
                credentials,
                artifacts,
                sessionType,
                message = Boom.unauthorized(null, 'Session')
            } = await options.validate(request, session, h);

            if (isValid) {
                const sameSite = process.env.NODE_ENV === 'development' ? 'None' : 'Lax';
                h.state(
                    opts.cookie,
                    session,
                    getStateOpts(server, 90, sessionType === 'token' ? 'None' : sameSite)
                );

                return h.authenticated({ credentials, artifacts });
            } else {
                function generateToken(length = 25) {
                    const alphabet =
                        '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
                    return generate(alphabet, length);
                }

                // no cookie or session expired, let's create a new session
                const sessionId = generateToken();

                const session = await Session.create({
                    id: sessionId,
                    user_id: null,
                    persistent: false,
                    data: {
                        'dw-user-id': null,
                        persistent: false,
                        last_action_time: Math.floor(Date.now() / 1000)
                    }
                });

                const sameSite = process.env.NODE_ENV === 'development' ? 'None' : 'Lax';

                h.state(
                    opts.cookie,
                    sessionId,
                    getStateOpts(server, 90, sessionType === 'token' ? 'None' : sameSite)
                );

                const auth = await getUser('guest', {
                    credentials: { session: session.id, data: session },
                    strategy: 'Session'
                });

                return h.authenticated(auth);
            }

            return message;
        }
    };

    return scheme;
}

async function cookieValidation(request, session, h) {
    let row = await Session.findByPk(session);

    if (!row) {
        return { isValid: false, message: Boom.unauthorized('Session not found', 'Session') };
    }

    row = await row.update({
        data: {
            ...row.data,
            last_action_time: Math.floor(Date.now() / 1000)
        }
    });

    const auth = await getUser(row.data['dw-user-id'], {
        credentials: { session, data: row },
        strategy: 'Session'
    });

    if (auth.isValid) {
        // add all scopes to cookie session
        auth.credentials.scope = request.server.methods.getScopes(auth.artifacts.isAdmin());
        auth.sessionType = row.data.type;
    }

    return auth;
}

function adminValidation({ artifacts } = {}) {
    if (artifacts.role !== 'admin') {
        throw Boom.unauthorized('ADMIN_ROLE_REQUIRED');
    }
}

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

function getStateOpts(
    server,
    ttl,
    sameSite = process.env.NODE_ENV === 'development' ? 'None' : 'Lax'
) {
    return {
        isSecure: server.methods.config('frontend').https,
        strictHeader: false,
        domain: `.${server.methods.config('api').domain}`,
        isSameSite: sameSite,
        path: '/',
        ttl: cookieTTL(ttl)
    };
}

function getUser(userId, { credentials, strategy, logger } = {}) {
    let user = await User.findByPk(userId, {
        attributes: [
            'id',
            'email',
            'role',
            'language',
            'activate_token',
            'reset_password_token',
            'deleted'
        ]
    });

    if (user && user.deleted) {
        return { isValid: false, message: Boom.unauthorized('User not found', strategy) };
    }

    if (!user && credentials.session) {
        const notSupported = name => {
            return () => {
                logger && logger.warn(`user.${name} is not supported for guests`);
                return false;
            };
        };
        // use non-persistant User model instance
        user = User.build({
            role: 'guest',
            id: undefined,
            language: 'en-US'
        });
        // make sure it never ends up in our DB
        user.save = notSupported('save');
        user.update = notSupported('update');
        user.destroy = notSupported('destroy');
        user.reload = notSupported('reload');
    }

    return { isValid: true, credentials, artifacts: user };
};

module.exports = DWAuth;