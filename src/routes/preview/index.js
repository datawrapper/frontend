const { fakeBoolean } = require('@datawrapper/schemas/themeData/shared');
const { Team } = require('@datawrapper/orm/models');
const chartCore = require('@datawrapper/chart-core');
const Joi = require('joi');
const Boom = require('@hapi/boom');
const jsesc = require('jsesc');
const get = require('lodash/get');

module.exports = {
    name: 'routes/preview',
    version: '1.0.0',
    register: async (server, options) => {
        const { loadLocales, loadVendorLocale, createAPI, initCaches } = require('./utils');
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
                    params: Joi.object({
                        chartId: Joi.string()
                            .alphanum()
                            .length(5)
                            .required()
                            .description('5 character long chart ID.')
                    }),
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
                        transparent: fakeBoolean,
                        logo: Joi.string().optional().valid('auto', 'on', 'off').default('auto')
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
                    ott: request.query.ott,
                    theme: request.query.theme,
                    transparent: request.query.transparent,
                    logo: request.query.logo
                })
                    .filter(([, value]) => Boolean(value))
                    .map(([key, value]) => `${key}=${value}`)
                    .join('&');

                let props;

                try {
                    props = await api(`/charts/${chartId}/publish/data?${queryString}`);
                } catch (ex) {
                    return Boom.unauthorized();
                }

                const chartLocale = props.chart.language || 'en-US';

                const dependencies = ['dw-2.0.min.js'];

                const team = await Team.findByPk(props.chart.organizationId);
                props = Object.assign(props, {
                    isIframe: true,
                    isPreview: true,
                    polyfillUri: '/lib/polyfills',
                    locales: {
                        dayjs: loadVendorLocale(locales, 'dayjs', chartLocale, team),
                        numeral: loadVendorLocale(locales, 'numeral', chartLocale, team)
                    }
                });

                const css = props.styles;
                const fonts = props.theme.fontsCSS;
                delete props.styles;
                delete props.theme.fontsCSS;

                const assets = {};
                props.assets.forEach(({ name, value }) => {
                    assets[name] = {
                        value
                    };
                });
                props.assets = assets;

                const libraries = props.visualization.libraries.map(lib => lib.uri);

                props.frontendDomain = config.frontend.domain;

                const { html, head } = chartCore.svelte.render(props);

                return h.view('preview.pug', {
                    __DW_SVELTE_PROPS__: jsesc(JSON.stringify(props), {
                        isScriptContext: true,
                        json: true,
                        wrap: true
                    }),
                    CHART_HTML: html,
                    CHART_HEAD: head,
                    CHART_LOCALE: chartLocale,
                    VIS_SCRIPT: `${apiBase}/visualizations/${props.visualization.id}/script.js`,
                    MAIN_SCRIPT: '/lib/chart-core/main.js',
                    POLYFILL_SCRIPT: '/lib/chart-core/load-polyfills.js',
                    DEPS: dependencies.map(el => `/lib/chart-core/${el}`),
                    LIBRARIES: libraries,
                    CSS: `${fonts}\n${css}`,
                    CHART_CLASS: [
                        `vis-height-${get(props.visualization, 'height', 'fit')}`,
                        `theme-${get(props.theme, 'id')}`,
                        `vis-${get(props.visualization, 'id')}`
                    ]
                });
            }
        });
    }
};
