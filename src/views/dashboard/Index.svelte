<script type="text/javascript">
    import MainLayout from 'layout/MainLayout.svelte';
    import range from 'lodash/range';

    export let __;
</script>

<MainLayout>
    <div class="container">
        <div class="columns">
            <div class="column is-8">
                <h2 class="title is-3">Recently edited</h2>
                <div class="columns is-multiline is-mobile">
                    {#each range(12) as i}
                        <div class="column is-one-third">
                            <figure class="box has-border p-2 pb-1 image is-4by3">
                                <div class="title is-5 mb-2">
                                    Global CO2 emissions from fossil-fuel
                                </div>
                                <img
                                    alt="preview"
                                    src="http://charts.datawrapper.local/preview/StxC5/be390c78d8947430cae734becf0ba454/plain.png"
                                />
                            </figure>
                        </div>
                    {/each}
                </div>
                <h2 class="title is-3">Recently published</h2>
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
        DAShBOARD
    </div>
</MainLayout>

<style>
</style>
