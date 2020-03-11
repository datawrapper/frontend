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
            const { theme, ...query } = page.query;
            const chartQueryParams = new URLSearchParams({ ...query, withData: true });
            const url = `/charts/${chartId}?${chartQueryParams}`;
            chart = await api(url);
            csv = chart.data.chart;
        } catch (error) {
            return this.error(error.status, error.message);
        }

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
            return this.error(error.status, error.message);
        }

        const css = await api(`/visualizations/${vis.id}/styles.css?theme=${theme.id}`, {
            json: false
        }).then(res => res.text());

        const chartLocale = chart.language;

        const deps = getDependencies({
            locale: chartLocale,
            dependencies: vis.dependencies
        });

        /*
        @todo: get the correct asset from local or cdn
        http://app.datawrapper.local/static/plugins/locator-maps/vendor/mapbox-gl.min.js
        */
        const libraries = vis.libraries.map(lib => lib.local);

        let translations = {};
        try {
            translations = await fetch(
                `core/locale/${chartLocale.replace('_', '-')}.json`
            ).then(r => r.json());
        } catch (error) {
            console.error(`No locales found for [${chartLocale}]`);
        }

        if (vis.locale) {
            Object.entries(vis.locale).map(([key, value]) => {
                vis.locale[key] = value[chart.language];
            });
        }

        const data = {
            visJSON: vis,
            chartJSON: chart,
            chartData: csv,
            isPreview: true,
            chartLocale,
            locales: {} /* NOTE: What about this? */,
            metricPrefix: {} /* NOTE: What about this? */,
            themeId: theme.id,
            fontsJSON: theme.fonts,
            typographyJSON: theme.data.typography,
            templateJS: false
        };

        /* add basemap attribution again */

        return {
            data,
            theme,
            translations,
            css,
            deps,
            libraries,
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
    export let query;

    const dwChartClasses = [
        `vis-height-${get(data, 'visJSON.height', 'fit')}`,
        `theme-${get(theme, 'id')}`,
        `vis-${get(data, 'visJSON.id')}`
    ];
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
</div>
