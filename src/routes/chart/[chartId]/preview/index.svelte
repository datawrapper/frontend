<script context="module">
    import { getDependencies } from '@datawrapper/chart-core/lib/get-dependencies.js';

    export async function preload(page, session) {
        const { chartId } = page.params;
        const fetch = this.fetch;

        function api(path, { baseUrl = API_BASE_URL } = {}) {
            return fetch(`${baseUrl}${path}`, {
                credentials: 'include',
                mode: 'cors'
            });
        }

        const chartPromise = api(`/charts/${chartId}`);
        const csvPromise = api(`/charts/${chartId}/assets/${chartId}.csv`);

        const [chartRes, csvRes] = await Promise.all([chartPromise, csvPromise]);
        const [chart, csv] = await Promise.all([chartRes.json(), csvRes.text()]);

        const visPromise = api(`/visualizations/${chart.type}`, {
            baseUrl: `http${FRONTEND_HTTPS ? 's' : ''}://${FRONTEND_DOMAIN}:3000`
        });
        const themePromise = api(`/themes/${chart.theme}?extend=true`);

        const [visRes, themeRes] = await Promise.all([visPromise, themePromise]);
        const [vis, theme] = await Promise.all([visRes.json(), themeRes.json()]);

        let css = await (await api(
            `/visualizations/${vis.id}/styles.css?theme=${theme.id}`
        )).text();

        /**
         * 'style' is interpolated to trick Prettier into not breaking this line of code.
         * Prettier and Svelte are still not best friends.
         */
        css = `<${'style'}>${css}</style>`;

        const fonts = Object.entries(theme.assets).reduce((fonts, [key, value]) => {
            if (theme.assets[key].type === 'font') fonts[key] = value;
            return fonts;
        }, {});

        const deps = getDependencies({ locale: 'en_US', dependencies: vis.dependencies });

        const data = {
            visJSON: vis,
            chartJSON: chart,
            chartData: csv,
            isPreview: false,
            chartLocale: 'en_US',
            locales: {},
            metricPrefix: {},
            themeId: theme.id,
            fontsJSON: fonts,
            typographyJSON: theme.data.typography,
            templateJS: false
        };

        const isD3Map =
            data.visJSON.id === 'd3-maps-choropleth' || data.visJSON.id === 'd3-maps-symbols';

        async function getBasemap() {
            // TO DO: set default basemap as fallback
            const basemapId = chart.metadata.visualize.basemap;

            let basemap = {};
            if (basemapId === 'custom_upload') {
                basemap = {
                    content: await (await api(`/charts/${chartId}/assets/${chartId}.map.json`)).json(),
                    meta: {
                        regions: chart.metadata.visualize.basemapRegions,
                        projection: {
                            type: chart.metadata.visualize.basemapProjection
                        },
                        extent: {
                            padding: false,
                            exclude: {}
                        }
                    }
                }

                // gather all unique keys from basemap and include them in metadata
                const keyIds = [];
                basemap.content.objects[basemap.meta.regions].geometries.forEach(geo => {
                    for (const key in geo.properties) {
                        if (key !== 'cx' && key !== 'cy' && !(keyIds.includes(key))) {
                            keyIds.push(key);
                        }
                    }
                });
                const keys = keyIds.map(key => ({ value: key, label: key }));
                basemap.meta.keys = keys;

            }
            else {
                basemap = await (await api(`/basemaps/${basemapId}`)).json();
            }
            basemap.__id = basemapId;
            return basemap;
        }

        const basemap = isD3Map ? await getBasemap() : null;

        return { data, theme, css, deps, basemap };
    }
</script>

<script>
    import { onMount } from 'svelte';
    import Chart from '@datawrapper/chart-core/lib/Chart.svelte';

    export let data;
    export let theme;
    export let css;
    export let deps;
    export let basemap;
</script>

<svelte:head>
    {@html css}
</svelte:head>
<div class="dw-chart chart">
    <Chart {data} {theme} />
    {#each deps as script}
        <script src={`vendor/${script}`}>

        </script>
    {/each}

    <script src={`chart/pYQK3/preview/${data.visJSON.id}.js?plugin=${data.visJSON.__plugin}`}>

    </script>

    {#if basemap}
        {@html `<script>__dwParams = { d3maps_basemap: {} }; __dwParams.d3maps_basemap['${basemap.__id}'] = ${JSON.stringify(basemap)};</script>`}
    {/if}
</div>
