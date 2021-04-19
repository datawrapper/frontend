<script>
    import MainLayout from 'layout/MainLayout.svelte';
    import { getContext } from 'svelte';

    const request = getContext('request');
    const config = getContext('config');

    export let statusCode;
    export let error;
    export let message;

    const heds = {
        404: 'error / not-found / hed',
        403: 'error / forbidden / hed',
        400: 'error / bad-request / hed'
    };
    const texts = {
        404: 'error / not-found / text',
        403: 'error / forbidden / text',
        400: 'error / bad-request / text'
    };

    $: niceHed = __(heds[statusCode] || 'error / unexpected / hed');
    $: niceText = __(texts[statusCode] || 'error / unexpected / text');

    export let __;
</script>

<MainLayout title="Error {statusCode} / {error}">
    <div class="container">
        <div class="row">
            <div class="column column-75">
                <h3 class="kicker mb-0">
                    Error {statusCode} ({error}{#if message !== error}&nbsp;/&nbsp;{message}{/if})
                </h3>
                <h2 class="has-text-red">{niceHed}</h2>
                <p class="summary">{niceText}</p>

                {#if statusCode === 404}
                    <p>Here are some other places you may want to go to now</p>
                    <ul>
                        <li><a href="/">Dashboard</a></li>
                        <li><a href="/account">User settings</a></li>
                    </ul>
                {/if}
                <p>
                    {@html __('error / support-help').replace(
                        '%s',
                        `mailto:support@datawrapper.de?subject=Error%20${statusCode}:%20${error}&body=%0A%0A%0A%0A----%0AError:%20${statusCode}%20/%20${message}%0AURL:%20${$request.method.toUpperCase()}%20${
                            $config.frontendDomain
                        }${$request.path}%0AQuery:%20${encodeURI(
                            JSON.stringify($request.query)
                        )}%0ATime:%20${new Date().toUTCString()}`
                    )}
                </p>
                <p />
            </div>
        </div>
    </div>
</MainLayout>

<style>
    .kicker {
        font-size: 24px;
        font-weight: 400;
        color: #999;
        letter-spacing: 0;
    }

    .summary {
        font-size: 2.2rem;
        letter-spacing: -0.08rem;
        line-height: 1.5;
        color: #656565;
    }
</style>
