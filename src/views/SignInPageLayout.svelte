<script>
	import DatawrapperLogo from './shared/DatawrapperLogo.svelte';
</script>

<svelte:head>
	<title>Datawrapper</title>
</svelte:head>

<style>
	:global(body) {
		background: linear-gradient(90deg, #0f4656 0%,#085e55 100%);
		height: 100%;
		color: white;
		font-family: 'Roboto', Helvetica, sans-serif;
	}

	.container {
		max-width: 676px;
		margin: 2em auto;
	}

	.body {
		margin-top: 50px;
		color: #444;
		font-size: 14px;
		line-height: 20px;
		background-color: #ffffff;
		border-radius: 6px;
		outline: none;
		padding: 20px;
		box-shadow: 0 3px 7px rgba(0, 0, 0, 0.3);
	}
</style>

<div class="container">
	<DatawrapperLogo color="#ffffff" />
	<div class="body">
		<slot></slot>
	</div>
</div>