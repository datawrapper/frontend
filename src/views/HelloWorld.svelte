<script type="text/javascript">
    import MainLayout from 'layout/MainLayout.svelte';
    import Svelte2Wrapper from 'layout/partials/Svelte2Wrapper.svelte';
    import { onMount, onDestroy, getContext } from 'svelte';

    export let magicNumber;

    const user = getContext('user');
    const __ = getContext('translate');

    let knocked = false;

    function knock() {
        knocked = true;
    }

    function causeError() {
        throw new Error('This is a serious error!');
    }

    let interval;
    onMount(() => {
        interval = setInterval(() => {
            magicNumber++;
        }, 1000);
    });

    onDestroy(() => {
        clearInterval(interval);
    });

    let data = {
        settings: {
            webhook_url: 'test'
        }
    };

    $: message = !knocked ? `Knock, knock. Who's there? (click me!)` : `Hello ${$user.name}!`;
</script>

<MainLayout title="Hello world">
    <div class="container">
        <h1 style="color:#c04" on:click={knock}>{message}</h1>
        <p>{__('team / invite / intro')}</p>
        <p>The magic number is&nbsp;<b>{magicNumber}</b>!</p>
        <button on:click={causeError}>Throw an error!</button>
        <hr />
        <h2>Webhook URL: <input bind:value={data.settings.webhook_url} /> (svelte3)</h2>
        <Svelte2Wrapper
            id="plugin-team-integrations"
            js="/static/plugins/team-integrations/team-integrations.js"
            css="/static/plugins/team-integrations/team-integrations.css"
            bind:data
        />
    </div>
</MainLayout>

<style>
    p {
        font-size: 20px;
        margin-bottom: 2ex;
    }

    b {
        font-size: 250%;
        color: magenta;
    }
</style>
