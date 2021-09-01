<script>
    import LoadingSpinner from 'layout/partials/LoadingSpinner.svelte';
    import { onMount } from 'svelte';
    import Parser from 'rss-parser/dist/rss-parser';

    let error = false;
    let items = [];

    onMount(async () => {
        const parser = new Parser();
        let feed = await parser.parseURL('https://www.datawrapper.de/feed/changelogs');
        items = feed.items;
    });
</script>

{#if !error}
    <div class="block box has-border">
        <h2 class="title is-3">Changelog</h2>
        <div>
            {#if !items.length}
                <LoadingSpinner /> loading...
            {:else}
                {#each items.slice(0, 10) as item}
                    <div class="item block">
                        <div>{item.title}</div>
                        <div class="content">{@html item.content}</div>
                    </div>
                {/each}
            {/if}
        </div>
    </div>
{/if}
