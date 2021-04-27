<script>
    import { getContext } from 'svelte';
    import DatawrapperLogo from './header/DatawrapperLogo.svelte';
    import NavBar from './header/NavBar.svelte';

    const request = getContext('request');
    let isActive = false;
</script>

<header class="py-5 mb-5" id="top">
    <div class="container">
        <nav class="navbar is-transparent" role="navigation" aria-label="main navigation">
            <div class="navbar-brand">
                {#if $request.path === '/'}
                    <DatawrapperLogo height="40" />
                {:else}
                    <a class="navbar-item" href="/" style="line-height: 1">
                        <DatawrapperLogo height="40" />
                    </a>
                {/if}

                <a
                    role="button"
                    class:is-active={isActive}
                    class="navbar-burger"
                    aria-label="menu"
                    aria-expanded="false"
                    on:click={() => (isActive = !isActive)}>
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                </a>
            </div>
            <NavBar {isActive} />
        </nav>
    </div>
</header>

<style>
    header {
        /*background: white;
        border-bottom: 1px solid #eee;*/
    }
</style>
