const path = require('path');
const Boom = require('@hapi/boom');
const Joi = require('joi');
const set = require('lodash/set');
const { readdir } = require('fs').promises;
const { Op } = require('@datawrapper/orm').db;
const { Chart, User } = require('@datawrapper/orm/models');

module.exports = {
    name: 'routes/edit',
    version: '1.0.0',
    register: async (server, options) => {
        const config = server.methods.config();

        server.methods.prepareView('edit/Index.svelte');

        server.route({
            method: 'GET',
            path: '/{chartId}/{step?}',
            options: {
                validate: {
                    params: Joi.object({
                        chartId: Joi.string()
                            .alphanum()
                            .length(5)
                            .required()
                            .description('5 character long chart ID.'),
                        step: Joi.string().alphanum()
                    })
                },
                // auth: false,
                async handler(request, h) {
                    const { params, auth } = request;
                    const chart = await getChart(params.chartId, request);

                    const api = server.methods.createAPI(config, auth);

                    const data = await api(`/charts/${chart.id}/data`, { json: false });

                    return h.view('edit/Index.svelte', {
                        htmlClass: 'has-background-white-ter',
                        props: {
                            rawChart: chart,
                            rawData: data,
                            initUrlStep: params.step,
                            visualizations: Array.from(server.app.visualizations.keys()).map(key =>
                                server.app.visualizations.get(key)
                            )
                        }
                    });
                }
            }
        });

        async function getChart(id, request) {
            const isAdmin = server.methods.isAdmin(request);
            const options = {
                where: {
                    id,
                    deleted: { [Op.not]: true }
                }
            };
            if (isAdmin) {
                set(options, ['include'], [{ model: User, attributes: ['name', 'email'] }]);
            }
            const chart = await Chart.findOne(options);
            if (!chart) {
                throw Boom.notFound('There is no visualization with that id');
            }
            return chart;
        }

        server.methods.prepareView('edit/App.svelte');
    }
};
