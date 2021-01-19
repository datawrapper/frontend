<script type="text/javascript">
    import MainLayout from './layout/MainLayout.svelte';
    export let name = 'world';
    export let dev = false;
    function foo() {
        name = 'Knock Knock';
    }
</script>

<MainLayout title="Hello world" {dev}>
	<div class="container">
	    <h1 style="color:red" on:click={foo}>Hello {name}, click me!</h1>
	</div>
</MainLayout>
