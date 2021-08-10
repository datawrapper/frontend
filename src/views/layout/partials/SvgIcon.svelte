<script>
    export let icon = 'api';
    export let size = '1em';
    export let color = 'currentColor';
    export let valign = 'sub';

    export let className = '';
</script>

<span class="icon {className}" style="height:{size}; width:{size}; vertical-align: {valign}">
    <svg style="height:{size}; width:{size}" class="svg-{icon}-dims">
        <use style="fill: {color}" xlink:href="/lib/icons/symbol/svg/sprite.symbol.svg#{icon}" />
    </svg>
</span>
