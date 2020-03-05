<script context="module">
    import { getDependencies } from '@datawrapper/chart-core/lib/get-dependencies.js';
    import { createAPI } from './_helpers.js';

    export async function preload(page, session) {
        if (!session.user) {
            this.error('403', 'Forbidden');
            return;
        }

        const { chartId } = page.params;
        const fetch = this.fetch;
        const { api } = createAPI(fetch, {
            cookie: session.headers.cookie
        });

        let chart;
        let csv;
        try {
            const url = page.query.ott
                ? `/charts/${chartId}/${page.query.ott}?withData=true`
                : `/charts/${chartId}?withData=true`;
            chart = await api(url);
            csv = chart.data.chart;
        } catch (error) {
            return this.error(error.status, error.message);
        }

        const themeName = page.query.theme || chart.theme;

        const [vis, theme] = await Promise.all([
            api(`/visualizations/${chart.type}`),
            api(`/themes/${themeName}?extend=true`)
        ]);

        theme.less = '';

        const css = await api(`/visualizations/${vis.id}/styles.css?theme=${theme.id}`, {
            json: false
        }).then(res => res.text());

        const fonts = Object.entries(theme.assets).reduce((fonts, [key, value]) => {
            if (theme.assets[key].type === 'font') fonts[key] = value;
            return fonts;
        }, {});

        const chartLocale = chart.language;

        const deps = getDependencies({
            locale: chartLocale,
            dependencies: vis.dependencies
        });

        /*
        @todo: get the correct asset from local or cdn
        http://app.datawrapper.local/static/plugins/locator-maps/vendor/mapbox-gl.min.js
        */
        const libraries = vis.libraries.map(lib => `/static/plugins/${vis.__plugin}/${lib.local}`);

        let translations = {};
        try {
            translations = await fetch(
                `core/locale/${chartLocale.replace('_', '-')}.json`
            ).then(r => r.json());
        } catch (error) {
            console.error(`No locales found for [${chartLocale}]`);
        }
        if (vis.locale) {
            Object.keys(vis.locale).map(key => {
                vis.locale[key] = vis.locale[key][chartLocale];
            });
        }

        const data = {
            visJSON: vis,
            chartJSON: chart,
            chartData: csv,
            isPreview: true,
            chartLocale,
            locales: {},
            metricPrefix: {},
            themeId: theme.id,
            fontsJSON: fonts,
            typographyJSON: theme.data.typography,
            templateJS: false
        };

        const isD3Map = vis.id === 'd3-maps-choropleth' || vis.id === 'd3-maps-symbols';

        const isLocatorMap = vis.id === 'locator-map';

        /* add basemap attribution again */

        return {
            data,
            theme,
            translations,
            css,
            deps,
            libraries,
            basemap: chart.data.basemap,
            query: page.query
        };
    }
</script>

<script>
    import Chart from '@datawrapper/chart-core/lib/Chart.svelte';
    import get from '@datawrapper/shared/get';

    export let data;
    export let theme;
    export let translations;
    export let css;
    export let deps;
    export let libraries;
    export let basemap;
    export let query;

    const dwChartClasses = [
        `vis-height-${get(data, 'visJSON.height', 'fit')}`,
        `theme-${get(theme, 'id')}`,
        `vis-${get(data, 'visJSON.id')}`
    ];

    const minimap = get(data, 'chartJSON.data.minimap');
    const highlight = get(data, 'chartJSON.data.highlight');
</script>

<svelte:head>
    {@html `<${'style'}>${css}</style>`}
</svelte:head>
{#each deps as script}
    <script src={`core/${script}`}>

    </script>
{/each}
<div class="dw-chart chart {dwChartClasses.join(' ')}">
    <Chart
        {data}
        {theme}
        {translations}
        isStylePlain={query.plain === '1'}
        isStyleFullscreen={query.fs === '1'}
        isStyleNoPointer={query.nopointer === '1'} />
    {#each libraries as lib}
        <script src={lib}>

        </script>
    {/each}

    <script src={`${API_BASE_URL}/visualizations/${data.visJSON.id}/script.js`}>

    </script>
    <script>
        window.__dwParams = {};
    </script>
    {#if basemap}
        {@html `<${'script'}>
            __dwParams.d3maps_basemap = {};
            __dwParams.d3maps_basemap['${basemap.__id}'] = ${JSON.stringify(basemap)};
        </script>`}
    {/if}
    {#if minimap || highlight}
        {@html `<${'script'}>
            __dwParams.locatorMap = {};
            __dwParams.locatorMap.minimapGeom = ${minimap};
            __dwParams.locatorMap.highlightGeom = ${highlight === minimap ? '__dwParams.locatorMap.minimapGeom' : highlight};
        </script>`}
    {/if}
</div>
