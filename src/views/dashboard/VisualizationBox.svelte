<script>
    import purifyHTML from '@datawrapper/shared/purifyHtml';
    export let chart;
</script>

<figure class="box has-border p-2 pb-1 image is-4by3">
    <a href="/chart/{chart.id}/edit">
        <div class="title is-6 mb-2">
            {purifyHTML(chart.title, '')}
        </div>
        <img
            alt="preview"
            src="//charts.datawrapper.local/preview/{chart.id}/{chart.thumbnailHash}/plain.png"
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
