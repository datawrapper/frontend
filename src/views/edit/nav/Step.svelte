<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let active = false;
    export let lastActiveStep;
    $: visited = step.index <= lastActiveStep;
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

<a
    href={step.id}
    on:click|preventDefault={() => !active && dispatch('navigate', step)}
    bind:offsetHeight={height}
    bind:offsetWidth={width}
    class="px-4 py-3 is-size-5"
    class:active
    class:visited
    style="clip-path: path('{clipPath}');"
>
    <span class="step ml-1 mr-3 is-size-2">{step.index}</span>{@html step.title}
    {#if !active && visited}
        <i class="fa fa-check" />
    {/if}
</a>

<style lang="less">
    a {
        background: var(--color-dw-grey-lighter);
        border-radius: 4px;
        display: inline-block;
        width: 100%;
        line-height: 2rem;

        &.active {
            background: var(--color-dw-firebrick);
            color: white;
            cursor: default;

            &:hover {
                text-decoration: none;
            }
        }
    }
    .step {
        display: inline-block;
        font-weight: bold;
        color: white;
        vertical-align: -0.2rem;
        text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.1);
    }
</style>
