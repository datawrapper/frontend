const { getDependencies } = require('@datawrapper/chart-core/lib/get-dependencies.js');
const chartCore = require('@datawrapper/chart-core');
const Boom = require('@hapi/boom')
const jsesc = require('jsesc');
const get = require('lodash/get');

module.exports = {
    name: 'routes/preview',
    version: '1.0.0',
    register: async (server, options) => {
        const { loadLocales, loadVendorLocale, createAPI, initCaches } = require('./utils');
        const locales = await loadLocales();
        const config = server.methods.config();
        const apiBase = `${config.api.https ? 'https' : 'http'}://${config.api.subdomain}.${config.api.domain
            }/v3`;

        server.route({
            method: 'GET',
            path: '/{chartId}',
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
                    theme: request.query.theme
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

                const deps = getDependencies({
                    locale: props.chart.language,
                    dependencies: props.visualization.dependencies
                });

                props = Object.assign(props, {
                    isIframe: true,
                    isPreview: true,
                    locales: {
                        dayjs: loadVendorLocale(locales, 'dayjs', chartLocale),
                        numeral: loadVendorLocale(locales, 'numeral', chartLocale)
                    },
                });

                const libraries = props.visualization.libraries.map(lib => lib.uri);
                const { html, head } = chartCore.svelte.render(props);

                return h.view('preview', {
                    __DW_SVELTE_PROPS__: jsesc(JSON.stringify(props), {
                        isScriptContext: true,
                        json: true,
                        wrap: true
                    }),
                    CHART_HTML: html,
                    CHART_HEAD: head,
                    VIS_SCRIPT: `${apiBase}/visualizations/${props.visualization.id}/script.js`,
                    MAIN_SCRIPT: '/lib/chart-core/main.js',
                    POLYFILL_SCRIPT: '/lib/chart-core/load-polyfills.js',
                    DEPS: deps.map(el => `/lib/chart-core/${el}`),
                    LIBRARIES: libraries,
                    CSS: `${props.styles.fonts}\n${props.styles.css}`,
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
