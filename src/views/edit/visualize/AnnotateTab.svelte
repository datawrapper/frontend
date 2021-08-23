<script>
    export let chart;
</script>

Title: <input type="text" class="input" bind:value={$chart.title} />
Description:
<input type="text" class="input" bind:value={$chart.metadata.describe.intro} />
