<script>
    import { onMount, getContext } from 'svelte';
    import SvgIcon from '../SvgIcon.svelte';
    import httpReq from '@datawrapper/shared/httpReq';
    import purifyHTML from '@datawrapper/shared/purifyHtml';
    import truncate from '@datawrapper/shared/truncate';
    import NavBarIcon from './NavBarIcon.svelte';

    const request = getContext('request');
    const user = getContext('user');

    let items = [];
    export let link;
    export let __;

    onMount(async () => {
        // load recently edited visualizations
        const { list: charts } = await httpReq.get('/v3/charts?orderBy=lastModifiedAt&limit=10');
        items = charts;
    });

    $: title = $user.activeTeam ? __('Team Charts') : __('My Charts');
    $: url = $user.activeTeam ? `/team/${$user.activeTeam.id}` : '/mycharts';
</script>

<a
    class:is-active={url === '/' ? $request.path === '/' : $request.path.startsWith(url)}
    class="navbar-item is-size-5 has-text-weight-medium ml-1 pr-1"
    href={url}><NavBarIcon item={{ svgIcon: 'cabinet', title: true }} /> <span>{title}</span></a
>
<div
    class="navbar-item has-dropdown is-hoverable is-size-5 has-text-weight-medium"
    class:just-arrow={link.type === 'visArchive' && !link.title && !link.icon && !link.svgIcon}
>
    <a
        href={link.url || '#/dropdown'}
        on:click|preventDefault
        class="navbar-link pl-3 pr-5"
        style={link.style || ''}
        class:is-arrowless={link.type !== 'visArchive'}
    >
        <NavBarIcon item={link} />
        <span>{@html link.title || ''}</span></a
    >

    <div class="navbar-dropdown is-right is-boxed">
        {#if !items.length}
            <div class="has-text-grey is-size-7 has-text-centered">
                <SvgIcon
                    valign="middle"
                    icon="loading-spinner"
                    timing="steps(12)"
                    duration="1s"
                    className="mr-2 is-size-6"
                    spin
                /> loading...
            </div>
        {:else}
            {#each items as item}
                <a class="navbar-item vis-archive-item" href="/chart/{item.id}/edit">
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
</div>

<style>
    .just-arrow .navbar-link:not(.is-arrowless)::after {
        right: unset;
        position: relative;
    }
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
