<script>
    import { onMount } from 'svelte';
    import SvgIcon from '../SvgIcon.svelte';
    import VisArchiveRow from './VisArchiveRow.svelte';

    let items = [];

    onMount(() => {
        // load recently edited visualizations
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
            <VisArchiveRow bind:item />
        {/each}
    {/if}
</div>

<style>
    .navbar-dropdown {
        width: 260px;
    }
</style>
