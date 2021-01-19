<script type="text/javascript">
    import MainLayout from './layout/MainLayout.svelte';
    export let name = 'world';
    export let dev = false;
    function foo() {
        name = 'Knock Knock';
    }
</script>

<MainLayout title="Fooo">
	<div class="container">
	    <h1 style="color:red" on:click={foo}>Hello {name}</h1>
	</div>
</MainLayout>
