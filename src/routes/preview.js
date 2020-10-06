const { getDependencies } = require('@datawrapper/chart-core/lib/get-dependencies.js');
const chartCore = require('@datawrapper/chart-core');
const Boom = require('@hapi/boom')
const got = require('got');
const jsesc = require('jsesc');
const get = require('lodash/get');
const path = require('path');
const fs = require('fs-extra');

module.exports = {
    name: 'routes/preview',
    version: '1.0.0',
    register: async (server, options) => {
        const locales = await loadLocales();

        async function loadLocales() {
            const VENDORS = ['dayjs', 'numeral'];
            const locales = [];

            for (const vendor of VENDORS) {
                locales[vendor] = new Map();
                const basePath = path.resolve(
                    __dirname,
                    '../../node_modules/@datawrapper/locales/locales/',
                    vendor
                );
                const files = await fs.readdir(basePath);
                for (let i = files.length - 1; i >= 0; i--) {
                    const file = files[i];
                    if (/.*\.js/.test(file)) {
                        const content = await fs.readFile(path.join(basePath, file), 'utf-8');
                        locales[vendor].set(path.basename(file, '.js'), content);
                    }
                }
            }
            return locales;
        }

        function loadVendorLocale(locales, vendor, locale) {
            const culture = locale.replace('_', '-').toLowerCase();
            const tryLocales = [culture];
            if (culture.length > 2) {
                // also try just language as fallback
                tryLocales.push(culture.split('-')[0]);
            }
            for (let i = 0; i < tryLocales.length; i++) {
                if (locales[vendor].has(tryLocales[i])) {
                    return locales[vendor].get(tryLocales[i]);
                }
            }
            // no locale found at all
            return 'null';
        }

        function createAPI(baseUrl, sessionID, session) {
            async function api(path, { json = true } = {}) {
                const response = await got(`${baseUrl}${path}`, {
                    headers: session
                        ? {
                              Cookie: `${sessionID}=${session}`
                          }
                        : undefined
                });

                if (json) {
                    return JSON.parse(response.body);
                } else {
                    return response.body;
                }
            }

            return api;
        }

        server.route({
            method: 'GET',
            path: '/{chartId}',
            handler: async (request, h) => {
                const { auth, params } = request;
                const { chartId } = params;
                const config = server.methods.config();
                const apiBase = `${config.api.https ? 'https' : 'http'}://${config.api.subdomain}.${
                    config.api.domain
                }/v3`;

                const api = createAPI(
                    apiBase,
                    config.api.sessionID,
                    auth.credentials && auth.credentials.data ? auth.credentials.data.id : ''
                );

                let chart;
                let publishData;

                const queryString = Object.entries({
                    published: request.query.published,
                    ott: request.query.ott
                })
                    .filter(([, value]) => Boolean(value))
                    .map(([key, value]) => `${key}=${value}`)
                    .join('&');

                // load chart
                try {
                    const url = `/charts/${chartId}/publish/data?${queryString}`;
                    publishData = await api(url);
                    chart = publishData.chart;
                    publishData.chart = undefined;
                } catch (error) {
                    return Boom.unauthorized();
                }

                const csv = publishData.data;
                delete publishData.data;

                const themeName = request.query.theme || chart.theme;

                let vis, theme;

                try {
                    const results = await Promise.all([
                        api(`/visualizations/${chart.type}`),
                        api(`/themes/${themeName}?extend=true`)
                    ]);
                    vis = results[0];
                    theme = results[1];
                    theme.less = '';
                } catch (error) {
                    return Boom.badImplementation();
                }

                vis.locale = publishData.locales;
                delete publishData.locales;

                const css = await api(`/visualizations/${vis.id}/styles.css?theme=${theme.id}`, {
                    json: false
                });

                const chartLocale = chart.language || 'en-US';

                const deps = getDependencies({
                    locale: chartLocale,
                    dependencies: vis.dependencies
                });

                const libraries = vis.libraries.map(lib => lib.uri);

                const props = {
                    data: {
                        visJSON: vis,
                        chartJSON: chart,
                        publishData,
                        chartData: csv,
                        isPreview: true,
                        chartLocale,
                        locales: {
                            dayjs: loadVendorLocale(locales, 'dayjs', chartLocale),
                            numeral: loadVendorLocale(locales, 'numeral', chartLocale)
                        },
                        metricPrefix: {} /* NOTE: What about this? */,
                        themeId: theme.id,
                        fontsJSON: theme.fonts,
                        typographyJSON: theme.data.typography,
                        polyfillUri: `/lib/polyfills`
                    },
                    theme,
                    translations: vis.locale
                };

                const { html, head } = chartCore.svelte.render(props);

                return h.view('preview', {
                    __DW_SVELTE_PROPS__: jsesc(JSON.stringify(props), {
                        isScriptContext: true,
                        json: true,
                        wrap: true
                    }),
                    CHART_HTML: html,
                    CHART_HEAD: head,
                    VIS_SCRIPT: `${apiBase}/visualizations/${props.data.visJSON.id}/script.js`,
                    MAIN_SCRIPT: '/lib/chart-core/main.js',
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