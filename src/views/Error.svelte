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
        <div class="columns">
            <div class="column is-four-fifths">
                <h3 class="is-size-4 mb-2 has-text-grey">
                    Error {statusCode} ({error}{#if message !== error}&nbsp;/&nbsp;{message}{/if})
                </h3>
                <h1 class="title is-1 has-text-danger mt-1">{niceHed}</h1>
                <p class="subtitle is-4">{niceText}</p>

                <div class="content">
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
                </div>
            </div>
        </div>
    </div>
</MainLayout>
