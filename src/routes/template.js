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

                const props = { chartData, dataset };
                const layout = 'SignInPageLayout';
                return h.view('EditInDatawrapper.svelte', { layout, props });
            }
        });
    }
};
