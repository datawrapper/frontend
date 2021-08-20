<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let active = false;
    export let visited = false;
    export let step = { index: 0, title: 'foo' };

    // internals
    let height = 30;
    let width = 150;
    $: halfHeight = height / 2;

    const br = 4;
    const radius = 10;

    $: clipPath = `M 0 0 l ${width - halfHeight - br},0 q ${br},0 ${br * 2} ${br} L ${
        width - br * 0.5
    },${halfHeight - br} Q ${width + br * 0.5},${halfHeight} ${width - br * 0.5},${
        halfHeight + br
    } L ${width - halfHeight + br},${height - br} q ${-br},${br} ${-br * 2},${br} L 0,${height} z`;
</script>

<div
    bind:offsetHeight={height}
    bind:offsetWidth={width}
    class="px-4 py-4 is-size-5"
    class:active
    class:visited
    style="clip-path: path('{clipPath}');"
>
    <span class="step mr-2">{step.index}</span>
    {#if !active}
        <a href={step.id} on:click|preventDefault={() => dispatch('navigate', step)}
            >{@html step.title}</a
        >
    {:else}
        {@html step.title}
    {/if}
</div>

<style>
    div {
        background: var(--color-dw-gray);
        border-radius: var(--box-border-radius);
        display: inline-block;
        width: 100%;
    }
    .step {
        display: inline-block;
        font-weight: bold;
    }
    .active {
        background: var(--color-dw-red);
        color: white;
    }
    .visited {
        color: var(--color-dw-gray-30);
    }
</style>
