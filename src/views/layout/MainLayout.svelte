<script>
    import PageHeader from './partials/PageHeader.svelte';
    import PageFooter from './partials/PageFooter.svelte';

    export let title;
</script>

<svelte:head>
    <title>Datawrapper{title ? ` - ${title}` : ''}</title>
</svelte:head>

<PageHeader />

<slot />

<div class="container">
    <PageFooter />
</div>

<style type="text/css">
    :global(body) {
        color: #333;
        background: #f9f9f9;
        position: relative;
        margin: 0;
    }

    :global(a) {
        color: #1d81a2;
        text-decoration: none;
    }
    :global(a:hover) {
        text-decoration: underline;
        color: #15607a;
    }
</style>
