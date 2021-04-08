<script>
    import MainLayout from 'layout/MainLayout.svelte';
    import { getContext } from 'svelte';
    import groupBy from 'underscore/modules/groupBy';
    import pairs from 'underscore/modules/pairs';

    const adminPages = getContext('adminPages');
    const request = getContext('request');

    export let title;

    $: groupedAdminPages = pairs(groupBy($adminPages, d => d.group))
        .map(([group, pages]) => ({
            group,
            pages: pages
                .sort((a, b) => a.order - b.order)
                .map(page => ({
                    url: page.url || `/v2/admin/${page.id}`,
                    title: page.title
                }))
        }))
        .sort((a, b) => a.pages[0].order - b.pages[0].order);
</script>

<MainLayout title={`Admin - ${title}`}>
    <div class="container">
        <div class="columns">
            <div class="column sidebar">
                {#each groupedAdminPages as g}
                    <h3>{g.group}</h3>
                    <ul role="navigation">
                        {#each g.pages as page}
                            <li class:active={$request.path === page.url}>
                                <a href={page.url}>{page.title}</a>
                            </li>
                        {/each}
                    </ul>
                {/each}
                <slot name="belowNav" />
            </div>
            <div class="column content">
                <h1>Admin >> {title}</h1>
                <slot />
            </div>
        </div>
    </div>
</MainLayout>

<style type="text/css">
    .columns {
        display: flex;
    }
    .sidebar {
        width: 30%;
    }
    li.active {
        font-weight: bold;
        color: #222;
    }
    li.active a {
        color: #222;
    }
    h3 {
        text-transform: uppercase;
        font-size: 13px;
    }
</style>
