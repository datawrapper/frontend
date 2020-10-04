const Boom = require('@hapi/boom')
const { User } = require('@datawrapper/orm/models');

module.exports = {
    name: 'routes/signin',
    version: '1.0.0',
    register: async (server, options) => {
        const oauth = server.methods.config('oauth');

        for (var provider in oauth) {
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
                        };

                        const { profile } = request.auth.credentials;

                        request.logger().info(profile);

                        const oAuthSignin = `${provider}::${profile.id}`;
                        const name = profile.displayName;

                        const user = await User.find({ where: { oauth_signin: oAuthSignin } });

                        if (user) {
                            // login user
                        } else {
                            // create user
                        }

                        return h.redirect('/');
                    }
                }
            });
        }
    }
};