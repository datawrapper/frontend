const Joi = require('@hapi/joi');
const Boom = require('@hapi/boom');

module.exports = {
    name: 'routes/template',
    version: '1.0.0',
    async register(server, options) {
        server.route({
            path: '/',
            method: 'GET',
            async handler(request, h) {
                return h.redirect('/chart/create');
            }
        });

        server.methods.prepareView('Create.svelte');

        server.route({
            path: '/',
            method: 'POST',
            options: {
                auth: false,
                validate: {
                    payload: Joi.object({
                        title: Joi.string().optional(),
                        type: Joi.string().optional(),
                        theme: Joi.string().optional(),
                        language: Joi.string()
                            .pattern(/[a-z][a-z](-[A-Z][A-Z])?/)
                            .optional(),
                        metadata: Joi.string().optional(),
                        last_edit_step: Joi.number().integer().min(2).max(4).optional(),
                        data: Joi.string().optional()
                    })
                }
            },
            async handler(request, h) {
                const { payload } = request;
                if (!payload) throw Boom.badRequest('you need to send form-encoded data');

                const chartData = {
                    title: payload.title,
                    theme: payload.theme,
                    type: payload.type,
                    language: payload.language,
                    last_edit_step: payload.last_edit_step || 3,
                    metadata: payload.metadata ? JSON.parse(payload.metadata) : undefined
                };
                const dataset = payload.data || '';
                const props = { chartData, dataset };
                const layout = 'SignInPageLayout';
                return h.view('Create.svelte', { layout, props });
            }
        });
    }
};
