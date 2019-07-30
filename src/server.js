import path from 'path';
import polka from 'polka';
import * as sapper from '@sapper/server';
import fetch from 'node-fetch';
import serveStatic from 'serve-static';

const corePath = path.dirname(require.resolve('@datawrapper/chart-core/package.json'));
const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

async function authMiddleware(req, res, next) {
    let user = undefined;

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
        process.stderr.write(error);
    }

    if (userRequest.ok) {
        user = await userRequest.json();
    } else {
        try {
            const session = await fetch(`${API_BASE_URL}/auth/session`, {
                method: 'POST',
                headers: req.headers
            });

            res.setHeader('set-cookie', session.headers.get('set-cookie'));

            userRequest = await fetch(`${API_BASE_URL}/me`, {
                headers: {
                    cookie: session.headers.get('set-cookie').split(';')[0]
                }
            });

            res.setHeader('set-cookie', userRequest.headers.get('set-cookie'));
            user = await userRequest.json();
        } catch (error) {
            process.stderr.write(error);
        }
    }

    req.user = user;
    next();
}

polka()
    .use(
        serveStatic(path.join(corePath, 'dist')),
        serveStatic('static'),
        authMiddleware,
        sapper.middleware({
            session: (req, res) => ({
                user: req.user
            })
        })
    )
    .listen(PORT, err => {
        if (err) process.stdout.write('error', err);
    });
