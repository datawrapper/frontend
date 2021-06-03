<script>
    import MainLayout from 'layout/MainLayout.svelte';
    import Menu from './partials/Menu.svelte';
    import { getContext } from 'svelte';
    import groupBy from 'underscore/modules/groupBy.js';
    import pairs from 'underscore/modules/pairs.js';

    const adminPages = getContext('adminPages');

    export let title;

    $: groupedAdminPages = pairs(groupBy($adminPages, d => d.group))
        .map(([title, pages]) => ({
            title,
            items: pages
                .sort((a, b) => a.order - b.order)
                .map(page => ({
                    url: page.url || `/v2/admin/${page.id}`,
                    title: page.title
                }))
        }))
        .sort((a, b) => a.items[0].order - b.items[0].order);
</script>

<MainLayout title={`Admin - ${title}`}>
    <div class="container">
        <div class="columns is-variable is-6">
            <div class="column">
                <Menu groups={groupedAdminPages} />
                <slot name="belowNav" />
            </div>
            <div class="column is-four-fifths content">
                <h1 class="title">Admin >> {title}</h1>
                <slot />
            </div>
        </div>
    </div>
</MainLayout>

<style type="text/css">
</style>
