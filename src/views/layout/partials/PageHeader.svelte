<script>
    import DatawrapperLogo from './DatawrapperLogo.svelte';
    import NavBar from './NavBar.svelte';
</script>

<header id="top">
    <div class="container">
        <div class="flex">
            <a href="/">
                <DatawrapperLogo height="50" />
            </a>
            <NavBar />
        </div>
    </div>
</header>

<style>
    header {
        padding: 4ex 0;
    }
    .container {
        margin-bottom: 0;
    }
</style>
