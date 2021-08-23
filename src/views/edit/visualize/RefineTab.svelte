<script>
    import Svelte2Wrapper from 'layout/partials/svelte2/Svelte2Wrapper.svelte';
    import SvelteChart from '@datawrapper/chart-core/lib/dw/svelteChart';
    import dwVisualization from '@datawrapper/chart-core/lib/dw/visualization';
    import cloneDeep from 'lodash/cloneDeep';
    import { onMount } from 'svelte';

    SvelteChart.prototype.store = d => d;
    SvelteChart.prototype.storeData = d => d;

    const mockChart = new SvelteChart({});

    export let data;
    export let chart;
    export let visualizations;
    let chartReady = false;
    let dataReady = false;

    onMount(() => {
        // visualizations.forEach(vis => {
        //     dwVisualization.register(vis.id, { meta: vis });
        // });

        data.subscribe(csv => {
            if (csv) {
                mockChart.load(csv, false).then(ds => {
                    if (!dataReady) {
                        dataReady = true;
                        chart.subscribe(data => {
                            const cloned = cloneDeep(data);
                            const vis = dwVisualization('d3-bars');
                            if (vis && dataReady) {
                                vis.chart(mockChart);
                                cloned.vis = vis;
                                cloned.visualization = vis.meta;
                                cloned.dataset = ds;
                                mockChart.set(cloned);
                                chartReady = true;
                            }
                        });
                    }
                });
            }
        });
    });

    let state = {};
</script>

<div>
    {#if chartReady && dataReady}
        <Svelte2Wrapper
            id="svelte/d3-bars/controls"
            js="/static/plugins/d3-bars/controls.js"
            css="/static/plugins/d3-bars/controls.css"
            module="Refine"
            store={mockChart}
            bind:data={state}
        />
    {/if}
</div>
