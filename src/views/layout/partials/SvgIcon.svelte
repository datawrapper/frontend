<script>
    export let icon = 'api';
    export let size;
    export let color = 'currentColor';
    export let valign = 'sub';
    export let crisp = false;

    export let className = '';

    export let spin = false;
    export let timing = 'linear';
    export let duration = '2s';
</script>

<span
    class="icon {className}"
    class:spin
    style="vertical-align: {valign}; {size ? `font-size:${size}` : ''} {spin
        ? `animation-duration:${duration};  animation-timing-function: ${timing};`
        : ''}"
>
    <svg class="svg-{icon}-dims" class:crisp>
        <use style="fill: {color}" xlink:href="/lib/icons/symbol/svg/sprite.symbol.svg#{icon}" />
    </svg>
</span>

<style>
    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(359deg);
        }
    }
    .spin {
        animation: spin 2s infinite linear;
    }
    .crisp {
        shape-rendering: crispEdges;
    }

    :global(.icon) {
        font-size: 1em;
    }
    .icon svg {
        width: 1em;
        height: 1em;
    }
</style>
