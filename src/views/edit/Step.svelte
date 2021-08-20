<script>
    let height = 30;
    let width = 150;
    $: halfHeight = height / 2;

    const br = 4;

    const radius = 10;

    $: clipPath = `M 0 0 l ${width - halfHeight - br},0 q ${br},0 ${
        br * 2
    } ${br} L ${width},${halfHeight} L ${width - halfHeight - br},${height} L 0,${height} z`;
</script>

<div
    bind:offsetHeight={height}
    bind:offsetWidth={width}
    class="px-4 py-3 has-text-white is-size-3"
    style="clip-path: path('{clipPath}');"
>
    <slot />
</div>

<style>
    div {
        background: var(--color-dw-red);
        font-weight: bold;
        border-radius: var(--box-border-radius);
        display: inline-block;
        width: 100%;
    }
</style>
