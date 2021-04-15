<script>
    import { getContext } from 'svelte';
    import DatawrapperLogo from './header/DatawrapperLogo.svelte';
    import NavBar from './header/NavBar.svelte';

    const request = getContext('request');
</script>

<header class="py-5 mb-5" id="top">
    <div class="container">
        <div class="flex">
            {#if $request.path === '/'}
                <DatawrapperLogo height="40" />
            {:else}
                <a href="/" style="line-height: 1">
                    <DatawrapperLogo height="40" />
                </a>
            {/if}
            <NavBar />
        </div>
    </div>
</header>

<style>
    header {
        /*background: white;
        border-bottom: 1px solid #eee;*/
    }
    .container {
        margin-bottom: 0;
    }
</style>
