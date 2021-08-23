<script>
    import Tabs from 'layout/partials/bulma/Tabs.svelte';
    import AnnotateTab from './visualize/AnnotateTab.svelte';
    import ChartTypeTab from './visualize/ChartTypeTab.svelte';
    import DesignTab from './visualize/DesignTab.svelte';
    import RefineTab from './visualize/RefineTab.svelte';

    export let chart;
    export let data;
    export let visualizations;

    const tabs = [
        { id: 'vis', title: 'Chart type', ui: ChartTypeTab },
        { id: 'refine', title: 'Refine', ui: RefineTab },
        { id: 'annotate', title: 'Annotate', ui: AnnotateTab },
        { id: 'design', title: 'Design', ui: DesignTab }
    ];

    let active = 'refine';
    $: activeTab = tabs.find(d => d.id === active) || tabs[0];
</script>

<div class="container">
    <div class="columns">
        <div class="column is-one-third">
            <Tabs items={tabs} bind:active />

            <svelte:component this={activeTab.ui} {data} {chart} {visualizations} />
        </div>
        <div class="column">
            <div class="box">chart preview</div>
        </div>
    </div>
</div>

<style>
    .box {
        margin: 0 auto;
        width: 550px;
    }
</style>
