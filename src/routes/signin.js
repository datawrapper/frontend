const Boom = require('@hapi/boom');
const Bell = require('@hapi/bell');
const { User } = require('@datawrapper/orm/models');

const { login, getStateOpts } = require('@datawrapper/service-utils/auth')(
    require('@datawrapper/orm/models')
);

module.exports = {
    name: 'routes/signin',
    version: '1.0.0',
    register: async (server, options) => {
        const oauth = server.methods.config('general').oauth;

        for (var provider in oauth) {
            if (!Object.keys(Bell.providers).includes(provider)) continue;

            server.route({
                method: ['GET', 'POST'],
                path: `/${provider}`,
                options: {
                    auth: {
                        mode: 'try',
                        strategy: provider
                    },
                    handler: async function (request, h) {
                        if (!request.auth.isAuthenticated) {
                            throw Boom.unauthorized();
                        }

                        const { config } = request.server.methods;
                        const { profile } = request.auth.credentials;
                        const api = config('api');

                        const oAuthSignin = `${provider}::${profile.id}`;
                        const name = profile.displayName;
                        const email = profile.email;

                        // check if we already have this user id in our database
                        let user = await User.findOne({ where: { oauth_signin: oAuthSignin } });

                        if (!user && email) {
                            // if not, check if that email is already registered
                            user = await User.findOne({ where: { email } });

                            if (user) {
                                // that email already exists, but it is activated?
                                if (user.role !== 'pending') {
                                    // yes, user exists and was activated
                                    user.name = name;
                                    user.oauth_signin = oAuthSignin;
                                } else {
                                    // this was never activated, so ANYONE could have created
                                    // the account. since we now know the real owner, let's
                                    // reset the password to be save that whoever created
                                    // the account in the first place, but didn't activate the
                                    // email, no longer has access!
                                    user.pwd = '';
                                }
                            }
                        } else if (user) {
                            if (user.deleted || user.email === 'DELETED') {
                                user.email = email;
                                user.deleted = false;
                            }
                        }

                        if (user) {
                            await user.save();
                        } else {
                            // create new user

                            user = await User.create({
                                role: 'editor',
                                name,
                                email: email || '',
                                pwd: '',
                                oauth_signin: oAuthSignin
                            });
                        }

                        const session = await login(user.id, request.auth.credentials, true);
                        await request.server.methods.logAction(user.id, `login/${provider}`);

                        return h
                            .response({
                                [api.sessionID]: session.id
                            })
                            .state(api.sessionID, session.id, getStateOpts(request.server, 90))
                            .redirect('/');
                    }
                }
            });
        }
    }
};
