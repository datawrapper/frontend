const { fakeBoolean } = require('@datawrapper/schemas/themeData/shared');
const { Team } = require('@datawrapper/orm/models');
const chartCore = require('@datawrapper/chart-core');
const Joi = require('joi');
const Boom = require('@hapi/boom');
const jsesc = require('jsesc');
const get = require('lodash/get');
const fs = require('fs').promises;
const path = require('path');

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
        const frontendBase = `${config.frontend.https ? 'https' : 'http'}://${
            config.frontend.domain
        }`;
        const webComponentJS = await fs.readFile(
            path.join(chartCore.path.dist, 'web-component.js'),
            'utf-8'
        );
        const validate = {
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
                transparent: fakeBoolean
            })
        };

        async function getChart(chartId, query, credentials) {
            const api = createAPI(
                apiBase,
                config.api.sessionID,
                credentials && credentials.data ? credentials.data.id : ''
            );

            let chart;

            const queryString = Object.entries({
                published: query.published,
                ott: query.ott,
                theme: query.theme,
                transparent: query.transparent
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

            return props;
        }

        server.route({
            method: 'GET',
            path: '/{chartId}',
            options: {
                validate
            },
            handler: async (request, h) => {
                const { auth, params } = request;
                let props = await getChart(params.chartId, request.query, auth.credentials);
                const chartLocale = props.chart.language || 'en-US';
                const team = await Team.findByPk(props.chart.organizationId);

                props = Object.assign(props, {
                    isIframe: true,
                    isPreview: true,
                    polyfillUri: '/lib/polyfills',
                    locales: {
                        dayjs: loadVendorLocale(locales, 'dayjs', chartLocale, team),
                        numeral: loadVendorLocale(locales, 'numeral', chartLocale, team)
                    },
                    assets: props.assets.reduce((acc, item) => {
                        const { name, value } = item;
                        acc[item.name] = { value };
                        return acc;
                    }, {}),
                    fontendDomain: config.frontend.domain
                });

                const { css, fonts } = props.styles;
                delete props.styles;

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
                    DEPS: ['/lib/chart-core/dw-2.0.min.js'],
                    LIBRARIES: props.visualization.libraries.map(lib => lib.uri),
                    CSS: `${fonts}\n${css}`,
                    CHART_CLASS: [
                        `vis-height-${get(props.visualization, 'height', 'fit')}`,
                        `theme-${get(props.theme, 'id')}`,
                        `vis-${get(props.visualization, 'id')}`
                    ]
                });
            }
        });

        server.route({
            method: 'GET',
            path: '/{chartId}/embed.js',
            options: {
                validate
            },
            handler: async (request, h) => {
                const { auth, params } = request;
                let props = await getChart(params.chartId, request.query, auth.credentials);
                const chartLocale = props.chart.language || 'en-US';
                const team = await Team.findByPk(props.chart.organizationId);

                props = Object.assign(props, {
                    isIframe: false,
                    isPreview: true,
                    polyfillUri: '/lib/polyfills',
                    locales: {
                        dayjs: loadVendorLocale(locales, 'dayjs', chartLocale, team),
                        numeral: loadVendorLocale(locales, 'numeral', chartLocale, team)
                    },
                    assets: props.assets.reduce((acc, item) => {
                        const { name, value } = item;
                        acc[item.name] = { value };
                        return acc;
                    }, {}),
                    fontendDomain: config.frontend.domain,
                    dependencies: [
                        `${frontendBase}/lib/chart-core/dw-2.0.min.js`,
                        ...props.visualization.libraries.map(lib => `${frontendBase}${lib.uri}`),
                        `${config.api.https ? 'https' : 'http'}://${config.api.subdomain}.${
                            config.api.domain
                        }/v3/visualizations/${props.visualization.id}/script.js`
                    ],
                    blocks: props.blocks.map(block => {
                        block.source.js = `${frontendBase}${block.source.js}`;
                        block.source.css = `${frontendBase}${block.source.css}`;
                        return block;
                    })
                });

                return h
                    .response(webComponentJS + `\n\n__dw.render(${JSON.stringify(props)});`)
                    .header('Content-Type', 'application/javascript');
            }
        });
    }
};
