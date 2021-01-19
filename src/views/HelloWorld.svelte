<script type="text/javascript">
    import MainLayout from './layout/MainLayout.svelte';
    export let name = 'world';
    function foo() {
        name = 'Knock Knock';
    }
</script>

<MainLayout title="Fooo">
    <h1 style="color:red" on:click={foo}>Hello {name}</h1>
</MainLayout>
