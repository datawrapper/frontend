<script context="module">
    import { getDependencies } from '@datawrapper/chart-core/lib/get-dependencies.js';
    import { createAPI } from './_helpers.js';

    export async function preload(page, session) {
        if (!session.user) {
            this.error('403', 'Forbidden');
            return;
        }

        const { config } = session;
        const { chartId } = page.params;
        const fetch = this.fetch;
        const { api } = createAPI(fetch, config.apiDomain);

        let chart;
        let publishData;

        const queryString = Object.entries({
            published: page.query.published,
            ott: page.query.ott
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
            return this.error(error.status, error);
        }

        const csv = publishData.data;
        delete publishData.data;

        const themeName = page.query.theme || chart.theme;

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
            return this.error(error.status, error);
        }

        vis.locale = publishData.locales;
        delete publishData.locales;

        const css = await api(`/visualizations/${vis.id}/styles.css?theme=${theme.id}`, {
            json: false
        }).then(res => res.text());

        const chartLocale = chart.language || 'en-US';

        const deps = getDependencies({
            locale: chartLocale,
            dependencies: vis.dependencies
        });

        // load vendor locales
        let locales = {};
        try {
            const res = await fetch(`/preview/${chart.id}/locale-${chartLocale}.json`);
            locales = await res.json();
        } catch (e) {
            this.error(500, 'error loading locales');
        }

        /*
        @todo: get the correct asset from local or cdn
        http://app.datawrapper.local/static/plugins/locator-maps/vendor/mapbox-gl.min.js
        */
        const libraries = vis.libraries.map(lib => lib.uri);

        const data = {
            visJSON: vis,
            chartJSON: chart,
            publishData,
            chartData: csv,
            isPreview: true,
            chartLocale,
            locales,
            metricPrefix: {} /* NOTE: What about this? */,
            themeId: theme.id,
            fontsJSON: theme.fonts,
            typographyJSON: theme.data.typography,
            polyfillUri: `/lib/polyfills`
        };

        /* add basemap attribution again */

        return {
            data,
            chart,
            theme,
            css,
            deps,
            libraries,
            config,
            query: page.query
        };
    }
</script>

<script>
    import Chart from '@datawrapper/chart-core/lib/Chart.svelte';
    import get from '@datawrapper/shared/get';

    export let data;
    export let chart;
    export let theme;
    export let css;
    export let deps;
    export let libraries;
    export let query;
    export let config;

    const dwChartClasses = [
        `vis-height-${get(data, 'visJSON.height', 'fit')}`,
        `theme-${get(theme, 'id')}`,
        `vis-${get(data, 'visJSON.id')}`
    ];

    if (typeof window !== 'undefined') {
        window.__dwUpdate = ({ chart }) => {
            Object.assign(data.chartJSON, chart);
            data = data; // to force re-rendering
        };
    }
</script>

<svelte:head>
    {@html `<${'style'}>${css}</style>`}
    <title>{chart.title}</title>
</svelte:head>
{#each deps as script}
    <script src={`lib/chart-core/${script}`}>

    </script>
{/each}
<div class="dw-chart chart {dwChartClasses.join(' ')}">

    <Chart {data} {theme} isStylePlain={query.plain === '1'} isStyleStatic={query.static === '1'} />
    {#each libraries as lib}
        <script src={lib}>

        </script>
    {/each}

    <script src={`${config.apiDomain}/visualizations/${data.visJSON.id}/script.js`}>

    </script>
</div>
