<script>
    import { getContext } from 'svelte';
    const request = getContext('request');

    export let groups = [];
</script>

<aside class="menu">
    {#each groups as g}
        {#if g.title}
            <h3 class="menu-label">{@html g.title}</h3>
        {/if}
        <ul role="navigation" class="menu-list">
            {#each g.items as item}
                <li>
                    <a class:is-active={$request.path === item.url} href={item.url}
                        >{@html item.title}</a
                    >
                </li>
            {/each}
        </ul>
    {/each}
</aside>
