/* globals API_SESSIONID, API_SUBDOMAIN, API_DOMAIN, API_BASE_URL */
import path from 'path';
import polka from 'polka';
import * as sapper from '@sapper/server';
import fetch from 'node-fetch';
import serveStatic from 'serve-static';

const corePath = path.dirname(require.resolve('@datawrapper/chart-core/package.json'));
const { PORT } = process.env;

function cookieReduceMiddleware(req, res, next) {
    req.headers.cookie = req.headers.cookie
        .split(';')
        .find(s => s.trim().startsWith(API_SESSIONID));
    next();
}

async function authMiddleware(req, res, next) {
    let user;
    req.headers.host = `${API_SUBDOMAIN}.${API_DOMAIN}`;
    /**
     * Maybe use the ORM directly in here. Have to consider the trade offs
     * - performance
     * - duplicated logic here and in API server
     * - server side only configuration (making sure secrets don't leak into the frontend etc.)
     */
    let userRequest = { ok: false };
    try {
        userRequest = await fetch(`${API_BASE_URL}/me`, {
            headers: req.headers
        });
    } catch (error) {
        console.error('\n⚠️ The API server seems to be offline!\n', error.message);
    }

    if (userRequest.ok) {
        user = await userRequest.json();
    } else {
        try {
            const session = await fetch(`${API_BASE_URL}/auth/session`, {
                method: 'POST',
                headers: req.headers
            });

            if (session.ok) {
                res.setHeader('set-cookie', session.headers.get('set-cookie'));

                userRequest = await fetch(`${API_BASE_URL}/me`, {
                    headers: {
                        cookie: session.headers.get('set-cookie').split(';')[0]
                    }
                });
            } else {
                console.error(session.url);
                console.error(session.status, session.statusText);
            }

            if (userRequest.ok) {
                res.setHeader('set-cookie', userRequest.headers.get('set-cookie'));
                user = await userRequest.json();
            } else {
                console.error(userRequest.url);
                console.error(userRequest.status, userRequest.statusText);
            }
        } catch (error) {
            console.error('\n⚠️ The API server seems to be offline!\n', error.message);
        }
    }

    req.user = user;
    next();
}

polka()
    .use(
        serveStatic(path.join(corePath, 'dist')),
        serveStatic('static'),
        cookieReduceMiddleware,
        authMiddleware,
        sapper.middleware({
            session: (req, res) => ({
                user: req.user,
                headers: req.headers
            })
        })
    )
    .listen(PORT, err => {
        if (err) process.stdout.write('error', err);
    });
