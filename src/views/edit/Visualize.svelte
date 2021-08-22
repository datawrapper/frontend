<script>
    import Tabs from 'layout/partials/bulma/Tabs.svelte';
    export let chart;

    let active = 'refine';
</script>

<div class="container">
    <div class="columns">
        <div class="column is-one-third">
            <Tabs
                items={[
                    { id: 'vis', title: 'Chart type' },
                    { id: 'refine', title: 'Refine' },
                    { id: 'annotate', title: 'Annotate' },
                    { id: 'design', title: 'Design' }
                ]}
                bind:active
            />

            {#if active === 'annotate'}
                Title: <input type="text" class="input" bind:value={$chart.title} />
                Description:
                <input type="text" class="input" bind:value={$chart.metadata.describe.intro} />
            {/if}
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
