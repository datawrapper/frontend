<script>
    import { onMount, getContext, beforeUpdate } from 'svelte';
    import clone from '@datawrapper/shared/clone';
    import isEqual from 'underscore/modules/isEqual.js';
    import { loadScript, loadStylesheet } from '@datawrapper/shared/fetch';

    export let id;
    export let js;
    export let css;
    export let data;

    const messages = getContext('messages');
    const config = getContext('config');

    let component;
    let container;
    let ready = false;
    let isIE = false;
    let _data = clone(data);
    let _app;

    onMount(async () => {
        // mimic old dw setup
        window.dw = {
            backend: {
                __messages: $messages,
                __api_domain: $config.apiDomain
            }
        };

        isIE = !!window.document.documentMode;
        if (isIE) {
            // Internet Explorer compatibility
            await Promise.all([
                loadStylesheet('/static/vendor/bootstrap/css/bootstrap.css'),
                loadStylesheet('/static/vendor/bootstrap/css/bootstrap-responsive.css'),
                loadStylesheet('/static/css/datawrapper.css'),
                loadScript(js),
                loadStylesheet(css)
            ]);
            require([id], ({ App }) => {
                try {
                    _app = new App({
                        target: container,
                        data
                    });
                    _data = clone(data);
                    _app.on('state', ({ current }) => {
                        data = clone(current);
                    });
                } catch (err) {
                    console.error('x', err);
                }
            });
        } else {
            await loadScript(
                `/lib/csr/layout/partials/svelte2/Svelte2Wrapper.element.svelte.${
                    window.document.documentMode ? 'ie.' : ''
                }js`
            );
            setTimeout(() => {
                ready = true;
            }, 100);
        }
    });

    beforeUpdate(() => {
        // notify svelte2 wrapper about data changes from parent component
        if (!isEqual(_data, data)) {
            _data = clone(data);
            if (isIE) {
                if (_app) {
                    _app.set(data);
                }
            } else {
                if (component && component.update) {
                    component.update(_data);
                }
            }
        }
    });

    function update(event) {
        // notify parent component about data changes from svelte2 wrapper
        data = clone(event.detail);
    }
</script>

{#if isIE}
    <div class="svelte-2" bind:this={container} />
{:else if ready}
    <svelte2-wrapper
        bind:this={component}
        {id}
        {js}
        {css}
        on:update={update}
        data={JSON.stringify(data)}
    />
{/if}

<style>
    :global(.vis-option-type-switch) {
        position: relative;
    }
</style>
