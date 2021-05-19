const { getDependencies } = require('@datawrapper/chart-core/lib/get-dependencies.js');
const { fakeBoolean } = require('@datawrapper/schemas/themeData/shared');
const { Team } = require('@datawrapper/orm/models');
const chartCore = require('@datawrapper/chart-core');
const Joi = require('@hapi/joi');
const Boom = require('@hapi/boom');
const jsesc = require('jsesc');
const get = require('lodash/get');

module.exports = {
    name: 'routes/preview',
    version: '1.0.0',
    register: async (server, options) => {
        const { loadLocales, loadVendorLocale, createAPI, initCaches } = require('./utils');
        const { getStyles, getVis, getTheme } = initCaches(server);
        const locales = await loadLocales();
        const config = server.methods.config();
        const apiBase = `${config.api.https ? 'https' : 'http'}://${config.api.subdomain}.${
            config.api.domain
        }/v3`;

        server.route({
            method: 'GET',
            path: '/{chartId}',
            options: {
                validate: {
                    query: Joi.object({
                        theme: Joi.string().optional(),
                        ott: Joi.string().optional(),
                        search: Joi.string().optional(),
                        published: fakeBoolean,
                        static: fakeBoolean,
                        plain: fakeBoolean,
                        fitchart: fakeBoolean,
                        fitheight: fakeBoolean,
                        svgonly: fakeBoolean,
                        map2svg: fakeBoolean,
                        transparent: fakeBoolean
                    })
                }
            },
            handler: async (request, h) => {
                const { auth, params } = request;
                const { chartId } = params;

                const api = createAPI(
                    apiBase,
                    config.api.sessionID,
                    auth.credentials && auth.credentials.data ? auth.credentials.data.id : ''
                );

                let chart;

                const queryString = Object.entries({
                    published: request.query.published,
                    ott: request.query.ott
                })
                    .filter(([, value]) => Boolean(value))
                    .map(([key, value]) => `${key}=${value}`)
                    .join('&');

                let publishData, vis, theme, css, csv;

                try {
                    publishData = await api(`/charts/${chartId}/publish/data?${queryString}`);
                    chart = publishData.chart;
                    csv = publishData.data;
                    delete publishData.data;
                    delete publishData.chart;
                } catch (ex) {
                    return Boom.unauthorized();
                }

                const themeName = request.query.theme || chart.theme;

                try {
                    const results = await Promise.all([
                        getVis(api, chart.type),
                        getTheme(api, themeName),
                        getStyles(api, chart.type, themeName, !!request.query.transparent)
                    ]);

                    vis = results[0];
                    theme = results[1];
                    css = results[2];

                    theme.less = '';
                    vis.locale = publishData.locales;
                    delete publishData.locales;
                } catch (error) {
                    server.logger.error(
                        `Error fetching information for ${chart.id}: ${error.message}`
                    );
                    return Boom.badImplementation();
                }

                const chartLocale = chart.language || 'en-US';

                const deps = getDependencies({
                    locale: chartLocale,
                    dependencies: vis.dependencies
                });

                const libraries = vis.libraries.map(lib => lib.uri);

                const team = await Team.findByPk(chart.organizationId);

                const props = {
                    data: {
                        visJSON: vis,
                        chartJSON: chart,
                        publishData,
                        chartData: csv,
                        isPreview: true,
                        chartLocale,
                        locales: {
                            dayjs: loadVendorLocale(locales, 'dayjs', chartLocale, team),
                            numeral: loadVendorLocale(locales, 'numeral', chartLocale, team)
                        },
                        metricPrefix: {} /* NOTE: What about this? */,
                        themeId: theme.id,
                        fontsJSON: theme.fonts,
                        typographyJSON: theme.data.typography,
                        polyfillUri: `/lib/polyfills`
                    },
                    theme,
                    translations: vis.locale,
                    frontendDomain: config.frontend.domain
                };

                const { html, head } = chartCore.svelte.render(props);

                return h.view('preview.pug', {
                    __DW_SVELTE_PROPS__: jsesc(JSON.stringify(props), {
                        isScriptContext: true,
                        json: true,
                        wrap: true
                    }),
                    CHART_HTML: html,
                    CHART_HEAD: head,
                    VIS_SCRIPT: `${apiBase}/visualizations/${props.data.visJSON.id}/script.js`,
                    MAIN_SCRIPT: '/lib/chart-core/main.js',
                    POLYFILL_SCRIPT: '/lib/chart-core/load-polyfills.js',
                    DEPS: deps.map(el => `/lib/chart-core/${el}`),
                    LIBRARIES: libraries,
                    CSS: css,
                    CHART_CLASS: [
                        `vis-height-${get(vis, 'height', 'fit')}`,
                        `theme-${get(theme, 'id')}`,
                        `vis-${get(vis, 'id')}`
                    ]
                });
            }
        });
    }
};
