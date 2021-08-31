<script>
    import DatawrapperLogo from './partials/header/DatawrapperLogo.svelte';

    export let title;
</script>

<svelte:head>
    <title>Datawrapper{title ? ` - ${title}` : ''}</title>
</svelte:head>

<div class="container" style="max-width: 50rem">
    <DatawrapperLogo color="#ffffff" height="60" />
    <div class="box mt-6 p-6">
        <slot />
    </div>
</div>

<style>
    :global(html) {
        background-color: #207693;
        background-image: url(/lib/static/img/signin-background.png);
    }
    :global(html, body) {
        height: 100%;
        color: white;
        font-family: 'Roboto', Helvetica, sans-serif;
        padding-top: 15px;
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

    @media screen and (min-height: 800px) and (min-width: 600px) {
        :global(html) {
            overflow-y: hidden;
        }
    }
</style>
