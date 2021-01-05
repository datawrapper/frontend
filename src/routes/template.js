const Boom = require('@hapi/boom');
const jsesc = require('jsesc');


module.exports = {
    name: 'routes/template',
    version: '1.0.0',
    async register(server, options) {
        server.route({
            path: '/',
            method: 'POST',
            config: {
                auth: false
            },
            async handler(request, h) {
                console.log('POST', request.payload)
                // if (!request.auth.isAuthenticated) {
                //     throw Boom.unauthorized();
                // }
                const { payload } = request;
                if (!payload) throw Boom.badRequest('you need to send form-encoded data');

                const chartData = {
                    title: payload.title,
                    theme: payload.theme,
                    type: payload.type,
                    language: payload.language,
                    last_edit_step: payload.last_edit_step,
                    forked_from: payload.forked_from,
                    metadata: payload.metadata ? JSON.parse(payload.metadata) : undefined,
                };
                const dataset = payload.data || '';
                const { config } = request.server.methods;
                const api = config('api');
                const { domain, subdomain } = api;

                const props = { chartData, dataset, apiDomain: `${subdomain}.${domain}` };
                const layout = 'SignInPageLayout';
                return h.view('EditInDatawrapper.svelte', { layout, props });
            }
        });
    }
};
