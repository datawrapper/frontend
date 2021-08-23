<script>
    import Tabs from 'layout/partials/bulma/Tabs.svelte';
    import AnnotateTab from './visualize/AnnotateTab.svelte';
    import ChartTypeTab from './visualize/ChartTypeTab.svelte';
    import DesignTab from './visualize/DesignTab.svelte';
    import RefineTab from './visualize/RefineTab.svelte';
    import { getContext } from 'svelte';

    export let chart;
    export let data;
    export let visualizations;

    const config = getContext('config');
    $: stickyHeaderThreshold = $config.stickyHeaderThreshold;

    const tabs = [
        { id: 'vis', title: 'Chart type', ui: ChartTypeTab },
        { id: 'refine', title: 'Refine', ui: RefineTab },
        { id: 'annotate', title: 'Annotate', ui: AnnotateTab },
        { id: 'design', title: 'Design', ui: DesignTab }
    ];

    let active = 'refine';
    $: activeTab = tabs.find(d => d.id === active) || tabs[0];

    let scrollY = 0;
    let innerHeight = 0;
</script>

<svelte:window bind:innerHeight bind:scrollY />

<div class="container">
    <div class="columns">
        <div class="column is-one-third">
            <div
                class="vis-controls block"
                class:sticking={scrollY >= 50}
                class:is-sticky={innerHeight > stickyHeaderThreshold}
            >
                <Tabs items={tabs} bind:active />
            </div>
            <div class="block">
                <svelte:component this={activeTab.ui} {data} {chart} {visualizations} />
            </div>
        </div>
        <div class="column">
            <div class="preview" class:sticky-nav={innerHeight > stickyHeaderThreshold}>
                <div class="box block">chart preview</div>
                <div class="block" style="text-align: center;">
                    - - - - - Some more controls - - - - -<br />x x x x x x
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .box {
        margin-left: auto;
        margin-right: auto;
        width: 600px;
        height: 500px;
    }
    .preview {
        position: sticky;
        top: 20px;
    }
    .preview.sticky-nav {
        top: 170px;
    }

    .vis-controls.is-sticky {
        position: sticky;
        top: 150px;
        z-index: 920;
    }
    .vis-controls.is-sticky.sticking {
        background: var(--color-dw-background);
        padding-top: 20px;
        padding-bottom: 20px;
    }
    /* .vis-controls.is-sticky:before {
        content: " ";
        display: block;
        background: red;
        width: 100%;
        height: 30px;
        position: absolute;
        bottom: 0;
    } */
</style>
