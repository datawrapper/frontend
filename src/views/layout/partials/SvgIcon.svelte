<script>
    export let icon = 'api';
    export let size = '1em';
    export let color = 'currentColor';
    export let valign = 'sub';

    export let className = '';

    export let spin = false;
    export let timing = 'linear';
    export let duration = '2s';
</script>

<span
    class="icon {className}"
    class:spin
    style="height:{size}; width:{size}; vertical-align: {valign}; {spin
        ? `animation-duration:${duration};  animation-timing-function: ${timing};`
        : ''}"
>
    <svg style="height:{size}; width:{size}" class="svg-{icon}-dims">
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
</style>
