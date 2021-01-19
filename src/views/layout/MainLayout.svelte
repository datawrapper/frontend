<script>
    import NavBar from './partials/NavBar.svelte';
    import PageFooter from './partials/PageFooter.svelte';

    export let title;
</script>

<svelte:head>
    <title>Datawrapper{title ? ` - ${title}` : ''}</title>
</svelte:head>

<div class="container">
    <NavBar />
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
</style>
