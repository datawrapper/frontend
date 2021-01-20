<script>
	export let dataset = '';
	export let chartData = {};

	import httpReq from '@datawrapper/shared/httpReq';
	import SignInPageLayout from './layout/SignInPageLayout.svelte';

	function openInDatawrapper() {
		httpReq.post('/v3/charts', {
            payload: chartData
        }).then(res => {
            // upload data
            httpReq.put('/v3/charts/'+res.id+'/data', {
                headers: {
                    'Content-Type': 'text/csv'
                },
                body: dataset
            }).then(res2 => {
                // redirect to chart
                window.location.href = res.type === 'locator-maps' ? '/edit/'+res.id : '/chart/'+res.id+'/edit';
            });
        });
	}
</script>

<style>
	h1 {
		font-weight: 400;
		line-height: 1.25;
		margin-top: 0;
	}
	p {
		font-size: 18px;
		line-height: 1.25;
	}
	.btn {
		display: inline-block;
		background: #cccccc;
		font-size: 20px;
		padding: 24px 28px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1px;
		margin-bottom: 8px;
		border-radius: 6px;
		border: 0;
		line-height: 1;
		margin-right: 10px;
		cursor: pointer;
	}
	img {
		max-width: 100%;
	}
	.btn-primary {
		color: #fff;
		background: #18a1cd;
	}
	pre {
		background: #eee;
		margin-top: 0;
		padding: 10px;
		max-height: 200px;
		overflow-y: scroll;
	}
	table {
		width: 100%;
	}
	th {
		text-align: left;
		vertical-align: top;
	}
</style>

<SignInPageLayout title="Edit Visualization in Datawrapper">
 	<h1>Edit Visualization in Datawrapper</h1>
	<p>Datawrapper lets you create and publish charts, maps & tables for free. If you don't have an account yet, you can try out our tool and sign up later.</p>

	{#if chartData.forked_from}
	<img src="https://img.datawrapper.de/{chartData.forked_from}/full.png" />
	{:else}
	<table>
		{#if chartData.title}
		<tr><th>Title</th><td>{chartData.title}</td></tr>
		{/if}
		{#if chartData.type}
		<tr><th>Type</th><td>{chartData.type}</td></tr>
		{/if}
		<tr><th>Dataset</th><td><pre>
	{dataset}
	</pre></td></tr>
	</table>
	{/if}

	<p>Confirm that you want to copy this visualization:</p>
	<button class="btn btn-primary" on:click="{openInDatawrapper}">Yes, edit in Datawrapper</button>
	<button class="btn" on:click=''>No</button>
</SignInPageLayout>
