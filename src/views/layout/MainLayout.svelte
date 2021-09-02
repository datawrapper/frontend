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

<PageFooter />

<style type="text/css">
</style>
