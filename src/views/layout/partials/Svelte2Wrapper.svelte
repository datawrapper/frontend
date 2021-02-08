<script>
	import { onMount, beforeUpdate } from 'svelte';
	import { messages } from 'lib/stores';
	import isEqual from 'underscore/modules/isEqual';
	import { loadScript, loadStylesheet } from '@datawrapper/shared/fetch';

	export let id;
	export let js;
	export let css;
	export let data;


	let _data;

	let container;
	let loading = true;

	let _app;

	beforeUpdate(() => {
		if (!isEqual(_data, data)) {
			_data = JSON.parse(JSON.stringify(data));
			if (_app) _app.set(data);
		}
	});

	onMount(async () => {
		await Promise.all([ loadScript(js), loadStylesheet(css) ]);

		// mimic old dw setup
		window.dw = {
			backend: {
				__messages: $messages
			}
		}
		require([id], ({ App }) => {
			loading = false;
			_app = new App({
				target: container,
				data
			});
			_app.on('state', ({ current }) => {
				data = current;
			});
		})
	})
</script>

<style lang="less">
	.svelte-2 {
		position: relative;

		:global(.vis-option-type-switch) {
			position: relative;
		}

		.loading {
			color: #888;
		}
	}
</style>

<div class="svelte-2" bind:this={container}>
	{#if loading}<span class="loading">loading...</span>{/if}
</div>