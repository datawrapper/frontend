import polka from 'polka';
import * as sapper from '@sapper/server';
import serveStatic from 'serve-static';
import generate from 'nanoid/generate';
import { preloadLocales } from './routes/preview/[chartId]/locale-[locale].json.js';

const ORM = require('@datawrapper/orm');
const { requireConfig } = require('@datawrapper/shared/node/findConfig');

const chartCore = require('@datawrapper/chart-core');
const { PORT } = process.env;

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const config = requireConfig();

function generateToken(length = 25) {
    return generate(alphabet, length);
}

function cookieReduceMiddleware(req, res, next) {
    if (req.headers.cookie) {
        req.headers.cookie = req.headers.cookie
            .split(';')
            .find(s => s.trim().startsWith(config.api.sessionID));
    }
    next();
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
        req.user = (await User.findByPk(session.user_id)).toJSON();
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

    const libs = {
        'chart-core': serveStatic(chartCore.path.dist)
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

    polka()
        .use(
            serveStatic('static'),
            serveLibraries,
            cookieReduceMiddleware,
            authMiddleware,
            sapper.middleware({
                session: (req, res) => ({
                    user: req.user,
                    headers: req.headers,
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
        });
}

main();
