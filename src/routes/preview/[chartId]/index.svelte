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
        const { api, getBasemap, getLocatorMapData } = createAPI(fetch, session.headers);
        let chart;

        try {
            chart = await api(`/charts/${chartId}`);
        } catch (error) {
            return this.error(error.status, error.message);
        }

        const [vis, theme, csv] = await Promise.all([
            api(`/visualizations/${chart.type}`),
            api(`/themes/${chart.theme}?extend=true`),
            api(`/charts/${chartId}/assets/${chartId}.csv`, { json: false }).then(res => res.text())
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

        const libraries = vis.libraries.map(lib => lib.cdn);

        let translations = {};
        try {
            translations = await fetch(`core/locale/${chartLocale.replace('_', '-')}.json`).then(
                r => r.json()
            );
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
        const basemap = isD3Map ? await getBasemap(chart) : null;
        const { minimap, highlight } = await getLocatorMapData(chart, vis.id);

        return {
            data,
            theme,
            translations,
            css,
            deps,
            libraries,
            basemap,
            minimap,
            highlight,
            query: page.query
        };
    }
</script>

<script>
    import Chart from '@datawrapper/chart-core/lib/Chart.svelte';
    import get from '@datawrapper/shared/get';
    import SocialButtons from 'social-sharing/SocialButtons.svelte';

    export let data;
    export let theme;
    export let translations;
    export let css;
    export let deps;
    export let libraries;
    export let basemap;
    export let minimap;
    export let highlight;
    export let query;

    const afterBodyComponents = [];

    if (get(data, 'chartJSON.metadata.visualize.sharing.enabled')) {
        afterBodyComponents.push(SocialButtons);
    }
</script>

<svelte:head>
    {@html `<${'style'}>${css}</style>`}
</svelte:head>
<div class="dw-chart chart">
    <Chart
        {data}
        {theme}
        {translations}
        isStylePlain={query.plain === '1'}
        isStyleFullscreen={query.fs === '1'}
        isStyleNoPointer={query.nopointer === '1'}
        {afterBodyComponents} />
    {#each libraries as lib}
        <script src={lib}>

        </script>
    {/each}
    {#each deps as script}
        <script src={`core/${script}`}>

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
    {#if minimap}
        {@html `<${'script'}>
            __dwParams.locatorMap = {};
            __dwParams.locatorMap.minimapGeom = ${minimap};
            __dwParams.locatorMap.highlightGeom = ${highlight === minimap ? '__dwParams.locatorMap.minimapGeom' : highlight};
        </script>`}
    {/if}
</div>
