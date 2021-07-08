<svelte:options tag="svelte2-wrapper" />

<script>
    import { onMount, onDestroy, beforeUpdate, createEventDispatcher } from 'svelte';
    import { get_current_component } from 'svelte/internal';
    import { loadScript } from '@datawrapper/shared/fetch';

    const svelteDispatch = createEventDispatcher();
    const component = get_current_component();
    const dispatch = (name, detail) => {
        svelteDispatch(name, detail);
        component.dispatchEvent && component.dispatchEvent(new CustomEvent(name, { detail }));
    };

    export let id;
    export let js;
    export let css;
    export let data;

    export function update(data) {
        if (_app) _app.set(data);
    }

    let _data;

    let container;
    let parent;
    let loading = true;

    let _app;

    function loadCSS(src) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = src;
            link.onload = () => {
                resolve();
            };
            link.onerror = reject;
            parent.appendChild(link);
        });
    }

    onMount(async () => {
        await Promise.all([
            loadCSS('/static/vendor/bootstrap/css/bootstrap.css'),
            loadCSS('/static/vendor/bootstrap/css/bootstrap-responsive.css'),
            loadCSS('/static/css/datawrapper.css'),
            loadScript(js),
            loadCSS(css)
        ]);

        const style = document.createElement('style');
        style.innerText = `
    .vis-option-type-switch {
        position: relative;
    }`;
        parent.appendChild(style);

        require([id], ({ App }) => {
            try {
                loading = false;
                _app = new App({
                    target: container,
                    data: JSON.parse(data)
                });
                _data = data;
                _app.on('state', ({ current }) => {
                    data = current;
                    dispatch('update', current);
                });
            } catch (err) {
                console.error(err);
            }
        });
    });

    onDestroy(() => {
        container.innerHTML = '';
    });
</script>

<div class="visconfig" bind:this={parent}>
    <div class="svelte-2" bind:this={container}>
        {#if loading}<span class="loading">loading...</span>{/if}
    </div>
</div>

<style lang="less">
    .svelte-2 {
        position: relative;

        .loading {
            color: #888;
        }
    }
</style>
