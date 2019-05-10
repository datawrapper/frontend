<script context="module">
    export async function preload(page, session) {
        const { chartId } = page.params;
        let chart;
        try {
            const chartRes = await this.fetch(
                `http://datawrapper.localhost:3001/v3/charts/${chartId}`,
                {
                    credentials: 'include'
                }
            );

            if (!chartRes.ok) {
                this.error(chartRes.status, chartRes.statusText);
            }
            chart = await chartRes.json();
        } catch (error) {
            this.error(500, 'Internal server error');
        }

        return { chart };
    }
</script>

<script>
    export let chart;

    const text = `{
	"title": "${chart.title}"
}`;

    async function handleKeyup(e) {
        if (e.which === 13 && e.altKey) {
            const res = await fetch(`http://datawrapper.localhost:3001/v3/charts/${chart.id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(e.target.value)
            });
            document.querySelector('iframe').src += '';
        }
    }
</script>

<style>
    iframe {
        display: block;
        height: 500px;
        width: 100%;
        padding: 1rem;
        border: 1px #ccc solid;
        grid-area: chart;
    }

    textarea {
        width: 500px;
        height: 500px;
        background: #ccc;
        font-size: 18px;
        padding: 18px;
    }

    .editor {
        grid-area: editor;
        display: grid;
        justify-content: center;
    }

    .chart {
        display: flex;
    }

    .container {
        display: grid;
        grid-template: 'editor chart';
        grid-gap: 20px;
        grid-template-columns: 3fr 2fr;
        padding: 20px;
    }
</style>

<h1>Chart editor</h1>

<div class="container">
    <div class="chart">
        <iframe title={chart.title} src={`chart/${chart.id}/preview`} frameborder="0" />
    </div>
    <div class="editor">
        <textarea on:keyup={handleKeyup} placeholder="edit chart">{text}</textarea>
    </div>
</div>
<details>
    <summary>Chart data</summary>
    <pre>{JSON.stringify(chart, null, 2)}</pre>
</details>
