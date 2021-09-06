<script>
    import { getContext } from 'svelte';
    const request = getContext('request');

    export let groups = [];
    export let sticky = false;
    export let content = null;

    function getTopMostElement(scrollY, groups, content) {
        let topMost;
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            for (let j = 0; j < group.items.length; j++) {
                const item = group.items[j];
                if (item.url.startsWith('#')) {
                    const el = content.querySelector(item.url);
                    if (el) {
                        const { top } = el.getBoundingClientRect();
                        if (!topMost || top < 30) {
                            topMost = item;
                        }
                        // check last item
                        if (
                            i === groups.length - 1 &&
                            j === group.items.length - 1 &&
                            innerHeight + scrollY >= content.ownerDocument.body.offsetHeight - 2
                        )
                            topMost = item;
                    }
                }
            }
        }
        return topMost;
    }

    function isActive(item, scrollY, groups, content) {
        if (sticky && item.url.startsWith('#') && content) {
            // check if target is the top most item
            const topItem = getTopMostElement(scrollY, groups, content);
            return topItem === item;
        }
        return $request.path === item.url;
    }

    let scrollY;
    let innerHeight;
    let offsetHeight;
</script>

<svelte:window bind:scrollY bind:innerHeight />

<aside class="menu" class:sticky>
    {#each groups as g}
        {#if g.title}
            <h3 class="menu-label">{@html g.title}</h3>
        {/if}
        <ul role="navigation" class="menu-list">
            {#each g.items as item}
                <li>
                    <a class:is-active={isActive(item, scrollY, groups, content)} href={item.url}
                        >{@html item.title}</a
                    >
                </li>
            {/each}
        </ul>
    {/each}
</aside>

<style>
    .menu.sticky {
        position: sticky;
        top: 20px;
    }
</style>
