<script>
    import SvgIcon from '../SvgIcon.svelte';

    export let title = '';

    export let path = [];
</script>

<div class="columns is-2 is-variable breadcrumbs-wrap">
    {#if title}
        <div class="column is-narrow pr-0">
            <span>{@html title}</span>
        </div>
    {/if}
    <div class="column pl-0">
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
    </div>
</div>

<style>
    .breadcrumbs-wrap {
        color: var(--color-dw-gray-60);
    }
</style>
