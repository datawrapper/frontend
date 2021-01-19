<script>
    import PageHeader from './partials/PageHeader.svelte';
    import PageFooter from './partials/PageFooter.svelte';

    export let title;
</script>

<svelte:head>
    <title>Datawrapper{title ? ` - ${title}` : ''}</title>
</svelte:head>

<div class="container">
    <PageHeader />
</div>

<slot />

<div class="container">
    <PageFooter />
</div>

<style type="text/css">
    :global(body) {
        font-family: 'Roboto', Helvetica, sans-serif;
        line-height: 20px;
        font-size: 14px;
        color: #333;
        background: #f9f9f9;
        position: relative;
        margin: 0;
    }

    :global(.container) {
        max-width: 1200px;
        margin: 0 auto 4ex;
    }

    :global(.flex) {
        display: flex;
        justify-content: space-between;
    }

    @media (max-width: 1220px) {
        :global(.container) {
            margin-left: 3ex;
            margin-right: 3ex;
        }
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
