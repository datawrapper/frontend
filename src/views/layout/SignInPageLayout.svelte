<script>
    import DatawrapperLogo from './partials/header/DatawrapperLogo.svelte';

    export let title;
</script>

<svelte:head>
    <title>Datawrapper{title ? ` - ${title}` : ''}</title>
</svelte:head>

<div class="container">
    <DatawrapperLogo color="#ffffff" height="40" />
    <div class="body">
        <slot />
    </div>
</div>

<style>
    :global(body) {
        background: linear-gradient(90deg, #0f4656 0%, #085e55 100%);
        height: 100%;
        color: white;
        font-family: 'Roboto', Helvetica, sans-serif;
        padding-top: 15px;
    }

    :global(a) {
        color: #1d81a2;
        text-decoration: none;
    }

    :global(a:hover) {
        color: #15607a;
        text-decoration: underline;
    }

    :global(button.plain-link) {
        background: transparent;
        border: 0;
        padding: 0;
        line-height: inherit;
        font-size: inherit;
        vertical-align: inherit;
        color: #1d81a2;
        vertical-align: baseline;
    }

    :global(button.plain-link:hover) {
        text-decoration: underline;
        color: #15607a;
    }
    .container {
        max-width: 676px;
        margin: 2em auto;
    }

    .body {
        margin-top: 30px;
        color: #444;
        font-size: 14px;
        line-height: 20px;
        background-color: #ffffff;
        border-radius: 6px;
        outline: none;
        padding: 30px 30px 26px;
        box-shadow: 0 3px 7px rgba(0, 0, 0, 0.3);
    }
</style>
