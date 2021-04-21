<script>
    import { setContext, getContext } from 'svelte';
    import { writable, get } from 'svelte/store';

    import View from '__view__';

    export let stores = {};

    export function getValue(key) {
        return view[key];
    }

    let view;

    Object.keys(stores).forEach(key => {
        const store = writable(stores[key]);
        if (key === 'messages') store.translate = translate;
        setContext(key, store);
    });

    function translate(key, scope = 'core', messages) {
        if (!messages) messages = stores.messages;
        try {
            const msg = messages[scope];
            return msg[key] || key;
        } catch (e) {
            return key;
        }
    }

    const msg = getContext('messages');
    let __;
    $: {
        __ = (key, scope = 'core') => translate(key, scope, $msg);
    }
</script>

<View bind:this={view} {...$$restProps} {__} />
