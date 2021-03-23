<script>
    import { setContext } from 'svelte';
    import { writable, get } from 'svelte/store';

    import View from '__view__';

    export let stores = {};

    Object.keys(stores).forEach(key => {
        setContext(key, writable(stores[key]));
    });
    setContext('translate', function (key, scope = 'core') {
        const messages = stores.messages;
        try {
            const msg = messages[scope];
            return msg[key] || key;
        } catch (e) {
            return key;
        }
    });
</script>

<View {...$$restProps} />