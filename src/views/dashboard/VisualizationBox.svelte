<script>
    import purifyHTML from '@datawrapper/shared/purifyHtml';
    import { getContext } from 'svelte';
    const config = getContext('config');

    export let chart;
</script>

<figure class="box has-border p-2 pb-1 image is-4by3">
    <a href="/chart/{chart.id}/edit">
        <div class="title is-6 mb-2">
            {purifyHTML(chart.title, '')}
        </div>
        <img
            alt="preview"
            src="//{$config.imageDomain}/{chart.id}/{chart.thumbnailHash}/plain.png"
        /></a
    >
</figure>

<style>
    .title {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
</style>
