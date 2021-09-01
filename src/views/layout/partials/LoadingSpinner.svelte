<script>
    import SvgIcon from './SvgIcon.svelte';

    export let color;
    export let className;
</script>

<SvgIcon
    valign="sub"
    icon="loading-spinner"
    timing="steps(12)"
    duration="1s"
    {color}
    {className}
    size="1.1rem"
    spin
/>
