<script>
    import { onMount, getContext, beforeUpdate } from 'svelte';
    import clone from '@datawrapper/shared/clone';
    import isEqual from 'underscore/modules/isEqual';
    import { loadScript } from '@datawrapper/shared/fetch';

    export let id;
    export let js;
    export let css;
    export let data;

    const messages = getContext('messages');
    const config = getContext('config');

    let component;
    let ready = false;
    let _data = clone(data);

    onMount(async () => {
        // mimic old dw setup
        window.dw = {
            backend: {
                __messages: $messages,
                __api_domain: $config.apiDomain
            }
        };

        await loadScript(
            `/lib/csr/layout/partials/Svelte2Wrapper.element.svelte.${
                window.document.documentMode ? 'ie.' : ''
            }js`
        );

        setTimeout(() => {
            ready = true;
        }, 100);
    });

    beforeUpdate(() => {
        // notify svelte2 wrapper about data changes from parent component
        if (!isEqual(_data, data)) {
            _data = clone(data);
            if (component && component.update) {
                component.update(_data);
            }
        }
    });

    function update(event) {
        // notify parent component about data changes from svelte2 wrapper
        data = clone(event.detail);
    }
</script>

{#if ready}
    <svelte2-wrapper
        bind:this={component}
        {id}
        {js}
        {css}
        on:update={update}
        data={JSON.stringify(data)}
    />
{/if}
