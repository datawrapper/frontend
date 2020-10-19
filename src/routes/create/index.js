const Joi = require('@hapi/joi');
const createChart = require('@datawrapper/service-utils/createChart');
const { Chart, Folder, Team } = require('@datawrapper/orm');

module.exports = {
    name: 'routes/create',
    version: '1.0.0',
    register: async (server) => {
        server.route({
            method: 'GET',
            options: {
                validate: {
                    params: Joi.object({
                        workflow: Joi.string()
                            .required()
                            .valid('chart', 'map', 'table')
                    }),
                    query: Joi.object({
                        type: Joi.string()
                            .valid(Array.from(server.app.visualizations.keys()))
                            .optional(),
                        folder: Joi.string()
                            .optional(),
                        basemap: Joi.string()
                            .optional(),
                        theme: Joi.string()
                            .optional(),
                        template: Joi.string()
                            .optional()
                    })
                }
            },
            path: '/{workflow}',
            handler: async (request, h) => {
                const { auth, query, params } = request;
                const user = auth.artifacts;

                const chart = await createChart({
                    server,
                    user,
                    session: auth.credentials.session,
                    payload: {
                        type: query.type,
                        theme: query.theme,
                        metadata: query.basemap ? { visualize: { basemap: query.basemap } }
                    }
                });

                if (query.folder) {
                    const folder = await Folder.findByPk(query.folder);

                    if (await folder.isWritableBy(user)) {
                        chart.in_folder = query.folder;
                    }
                }

                if (query.template) {
                    const chartTemplate = await Chart.findByPk(query.template);

                    if (chartTemplate && chartTemplate.organization_id) {
                        const team = await Team.findByPk(chart.organization_id);

                        if (team.settings['chart-templates']) {
                            const publicChart = await PublicChart.findByPk(chartTemplate.id);

                            if (publicChart) {
                                // copy properties from publicchart
                            } else {
                                // copy properties from chart
                            }

                            await request.server.methods.logAction(user.id, `chart/template`, chartTemplate.id);
                        }
                    }
                }


                await chart.save();
                h.redirect(`/${params.workflow}/${chart.id}/edit`);
            }
        });
    }
};
