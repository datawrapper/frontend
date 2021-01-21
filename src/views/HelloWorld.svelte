<script type="text/javascript">
    import MainLayout from 'layout/MainLayout.svelte';
    import { config, user } from 'lib/stores';
    import __ from 'lib/translate';
    import { onMount } from 'svelte';

    export let magicNumber;

    let knocked = false;

    function knock() {
        knocked = true;
    }

    $: message = knocked ? `Knock, knock. Who's there?` : `Hello ${$user.name}, click me!`;
</script>

<MainLayout title="Hello world">
    <div class="container">
        <h1 style="color:#d00" on:click={knock}>{message}</h1>
        <p>{ __('team / invite / intro') }</p>
        The magic number is <b>{magicNumber}</b>!
    </div>
</MainLayout>

<style>
	p {
		font-size: 20px;
		margin-bottom: 2ex;
	}
</style>