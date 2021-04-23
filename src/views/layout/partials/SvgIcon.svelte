<script>
    export let icon = 'api';
    export let size = '0.9rem';
    export let color = 'inherit';

    export let className = '';
</script>

<span class="icon {className}" style="height:{size}px;width:{size}px">
    <svg style="height:{size}px;width:{size}px" class="svg-{icon}-dims">
        <use style="fill: {color}" xlink:href="/lib/icons/symbol/svg/sprite.symbol.svg#{icon}" />
    </svg>
</span>
