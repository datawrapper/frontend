<script type="text/javascript">
    import MainLayout from 'layout/MainLayout.svelte';
    import range from 'lodash/range';
    import VisualizationBox from './VisualizationBox.svelte';

    export let __;
    export let recentlyEdited;
    export let recentlyPublished;
</script>

<MainLayout>
    <div class="container">
        <div class="columns">
            <div class="column is-8">
                <div class="block">
                    <h2 class="title is-3">Recently edited</h2>
                    <div class="columns is-multiline is-mobile">
                        {#each recentlyEdited as chart}
                            <div class="column is-one-third">
                                <VisualizationBox {chart} />
                            </div>
                        {/each}
                    </div>
                </div>
                <div class="block mt-6">
                    <h2 class="title is-3">Recently published</h2>
                    <div class="columns is-multiline is-mobile">
                        {#each recentlyPublished as chart}
                            <div class="column is-one-third">
                                <VisualizationBox {chart} />
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
            <div class="column">
                <div class="block box has-border">
                    <h2 class="title is-3">My team</h2>
                </div>
                <div class="block box has-border">
                    <h2 class="title is-3">Changelog</h2>
                </div>
            </div>
        </div>
    </div>
</MainLayout>

<style>
</style>
