import path from 'path';
import polka from 'polka';
import * as sapper from '@sapper/server';
import serveStatic from 'serve-static';
import { customAlphabet } from 'nanoid';
import { preloadLocales } from './routes/preview/[chartId]/locale-[locale].json.js';

const ORM = require('@datawrapper/orm');
const { requireConfig } = require('@datawrapper/shared/node/findConfig');

const chartCore = require('@datawrapper/chart-core');
const { PORT } = process.env;

const generateToken = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    25
);

const config = requireConfig();

function cookieReduceMiddleware(req, res, next) {
    if (req.headers.cookie) {
        req.headers.cookie = req.headers.cookie
            .split(';')
            .find(s => s.trim().startsWith(config.api.sessionID));
    }
    next();
}

/**
 * Code in Sapper:
 * https://github.com/sveltejs/sapper/blob/master/runtime/src/server/middleware/get_page_handler.ts#L57
 *
 * Issue:
 * https://github.com/sveltejs/sapper/issues/567
 *
 * Sapper currently set's a hard coded max-age directive as Cache-Control header.
 * There is an open issue on Github with a discussion to remove that or make it configurable.
 *
 * This middleware is copied from that issue and only a workaround.
 * Thanks Nolan!
 *
 */
function overrideSetHeader(req, res, next) {
    const origSetHeader = res.setHeader;
    res.setHeader = function(key, value) {
        if (key === 'Cache-Control') {
            if (value === 'max-age=600') {
                // HTML files
                return origSetHeader.apply(this, ['Cache-Control', 'public, no-cache']);
            }
        }

        return origSetHeader.apply(this, arguments);
    };
    return next();
}

async function authMiddleware(req, res, next) {
    const { Session, User } = require('@datawrapper/orm/models');
    req.headers.host = `${config.api.subdomain}.${config.api.domain}`;

    let session;
    if (req.headers.cookie) {
        const sessionId = req.headers.cookie.split('=')[1];
        // check session in DB
        session = await Session.findByPk(sessionId);
    }

    if (session && session.user_id) {
        // it's a user session, so find user
        req.user = (await User.findByPk(session.user_id)).serialize();
    } else {
        if (!session) {
            // no cookie or session expired, let's create a new session
            const sessionId = generateToken();
            await Session.create({
                id: sessionId,
                user_id: null,
                persistent: false,
                data: {
                    'dw-user-id': null,
                    persistent: false,
                    last_action_time: Math.floor(Date.now() / 1000)
                }
            });
            // have to rely on config.api.domain because config.frontend.domain includes the subdomain!
            res.setHeader(
                'set-cookie',
                [
                    `${config.api.sessionID}=${sessionId}`,
                    'path=/',
                    `domain=.${config.api.domain}`,
                    'HttpOnly',
                    ...(config.frontend.https ? ['Secure'] : [])
                ].join('; ')
            );
        }
        req.user = {
            role: 'guest'
        };
    }
    next();
}

async function main() {
    await ORM.init(config);
    await preloadLocales();

    const polyfillDir = path.join(
        path.dirname(require.resolve('@datawrapper/polyfills/package.json')),
        'polyfills'
    );

    const libs = {
        'chart-core': serveStatic(chartCore.path.dist),
        polyfills: serveStatic(polyfillDir)
    };

    const serveLibraries = (req, res, next) => {
        for (const lib in libs) {
            if (req.url.startsWith(`/lib/${lib}/`)) {
                req.url = req.url.substr(5 + lib.length);
                return libs[lib](req, res, next);
            }
        }
        return next();
    };

    const app = polka()
        .use(
            serveStatic('static'),
            serveLibraries,
            cookieReduceMiddleware,
            authMiddleware,
            overrideSetHeader,
            sapper.middleware({
                session: (req, res) => ({
                    user: req.user,
                    config: {
                        apiDomain: `http${config.api.https ? 's' : ''}://${config.api.subdomain}.${
                            config.api.domain
                        }/v3`
                    }
                })
            })
        )
        .listen(PORT, err => {
            if (err) process.stdout.write('error', err);
            else {
                if (process.send) {
                    // graceful start and stop
                    process.send('ready');
                }

                process.on('SIGINT', async function() {
                    console.log('received SIGINT, closing connections...'); // eslint-disable-line
                    app.server.close(() => {
                        console.log('server has stopped'); // eslint-disable-line
                        process.exit(0);
                    });
                });
            }
        });
}

main();
