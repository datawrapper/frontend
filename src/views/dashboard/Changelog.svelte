<script>
    import LoadingSpinner from 'layout/partials/LoadingSpinner.svelte';
    import { onMount } from 'svelte';
    import Parser from 'rss-parser/dist/rss-parser';
    import dayjs from 'dayjs';
    import relativeTime from 'dayjs/plugin/relativeTime';

    dayjs.extend(relativeTime);

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
                        <div class="has-text-grey is-size-7 is-uppercase mb-1">
                            {@html item.title.split(' / ')[1]} -- {dayjs(
                                item.title.split(' / ')[0]
                            ).fromNow()}
                        </div>
                        <div class="content">{@html item.content}</div>
                    </div>
                {/each}
            {/if}
        </div>
    </div>
{/if}
