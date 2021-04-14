const Joi = require('@hapi/joi');
const Boom = require('@hapi/boom');
const set = require('lodash/set');

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

        const additionalFields = {
            description: 'metadata.describe.intro',
            aria_description: 'metadata.describe.aria-description',
            source_name: 'metadata.describe.source-name',
            source_url: 'metadata.describe.source-url',
            notes: 'metadata.annotate.notes',
            byline: 'metadata.describe.byline'
        };

        server.route({
            path: '/',
            method: 'POST',
            options: {
                auth: false,
                validate: {
                    payload: Joi.object({
                        title: Joi.string().optional().allow(''),
                        description: Joi.string().optional().allow(''),
                        aria_description: Joi.string().optional().allow(''),
                        type: Joi.string().optional(),
                        theme: Joi.string().optional(),
                        source_name: Joi.string().optional().allow(''),
                        source_url: Joi.string().optional().allow(''),
                        notes: Joi.string().optional().allow(''),
                        byline: Joi.string().optional().allow(''),
                        language: Joi.string()
                            .pattern(/[a-z][a-z](-[A-Z][A-Z])?/)
                            .optional()
                            .default('en-US'),
                        metadata: Joi.string().optional(),
                        last_edit_step: Joi.number().integer().min(2).max(4).optional().default(3),
                        data: Joi.string().optional()
                    })
                }
            },
            async handler(request, h) {
                const { payload } = request;
                if (!payload) throw Boom.badRequest('you need to send form-encoded data');

                const chartData = {
                    title: payload.title,
                    theme: payload.theme || 'datawrapper-data',
                    type: payload.type,
                    language: payload.language,
                    last_edit_step: payload.last_edit_step || 3,
                    metadata: payload.metadata ? JSON.parse(payload.metadata) : undefined
                };
                Object.keys(additionalFields).forEach(key => {
                    if (payload[key]) {
                        set(chartData, additionalFields[key], payload[key]);
                    }
                });
                const dataset = payload.data || '';
                const props = { chartData, dataset };
                const layout = 'SignInPageLayout';
                return h.view('Create.svelte', { layout, props });
            }
        });
    }
};
