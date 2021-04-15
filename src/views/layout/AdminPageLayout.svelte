<script>
    import MainLayout from 'layout/MainLayout.svelte';
    import StackedNav from './partials/StackedNav.svelte';
    import { getContext } from 'svelte';
    import groupBy from 'underscore/modules/groupBy';
    import pairs from 'underscore/modules/pairs';

    const adminPages = getContext('adminPages');

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
        <div class="row">
            <div class="column column-25 pr-6">
                {#each groupedAdminPages as g}
                    <StackedNav title={g.group} items={g.pages} />
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
</style>
