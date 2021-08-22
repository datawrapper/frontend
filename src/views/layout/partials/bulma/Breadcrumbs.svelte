<script>
    import SvgIcon from '../SvgIcon.svelte';
    export let path = [];
</script>

<nav class="breadcrumb" aria-label="breadcrumbs">
    <ul>
        {#each path as part, i}
            <li>
                <a href={part.url}
                    >{#if part.svgIcon}
                        <SvgIcon size="1.2rem" icon={part.svgIcon} />
                    {/if}{@html part.title}</a
                >
            </li>
        {/each}
    </ul>
</nav>
