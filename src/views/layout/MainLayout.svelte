<script>
    import PageHeader from './partials/PageHeader.svelte';
    import PageFooter from './partials/PageFooter.svelte';

    export let title;
</script>

<svelte:head>
    <title>{title ? `${title} - ` : ''}Datawrapper</title>
</svelte:head>

<PageHeader />

<slot />

<div class="container">
    <PageFooter />
</div>

<style type="text/css">
    :global(body) {
        background: var(--color-dw-white-bis);
    }
</style>
