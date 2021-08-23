<script>
    import { onMount } from 'svelte';
    import SvgIcon from '../SvgIcon.svelte';
    import httpReq from '@datawrapper/shared/httpReq';
    import purifyHTML from '@datawrapper/shared/purifyHtml';
    import truncate from '@datawrapper/shared/truncate';

    let items = [];

    onMount(async () => {
        // load recently edited visualizations
        const { list: charts } = await httpReq.get('/v3/charts?orderBy=lastModifiedAt&limit=10');
        items = charts;
    });
</script>

<div class="navbar-dropdown is-right">
    {#if !items.length}
        <div class="has-text-grey is-size-7" style="text-align: center;">
            <SvgIcon
                valign="sub"
                icon="loading-spinner"
                timing="steps(12)"
                duration="1s"
                color="var(--color-dw-gray-30)"
                className="ml-2 mr-0"
                size="1.1rem"
                spin
            /> loading...
        </div>
    {:else}
        {#each items as item}
            <a class="navbar-item" href="/v2/edit/{item.id}/">
                <div class="columns is-variable is-0">
                    <div class="column is-narrow">
                        <img width="40" src={item.thumbnails.plain} alt="" class="mr-2" />
                    </div>
                    <div class="column">
                        {truncate(purifyHTML(item.title, ''), 30, 20)}
                    </div>
                </div>
            </a>
        {/each}
    {/if}
</div>

<style>
    .navbar-dropdown {
        width: 260px;
    }

    img {
        vertical-align: baseline;
        position: relative;
        top: 2px;
        max-height: auto;
    }
    .vis-archive-item {
        display: inline-block;
        width: 98%;
        font-weight: normal !important;
        padding-right: 1rem !important;
        white-space: normal !important;
        font-size: 13px !important;
    }
</style>
