<script>
    import { getContext } from 'svelte';
    import DatawrapperLogo from './header/DatawrapperLogo.svelte';
    import NavBar from './header/NavBar.svelte';

    const request = getContext('request');
    let isActive = false;

    let scrollY = 0;
    $: scrolledDown = scrollY > 0;
    $: logoSize = scrolledDown ? 34 : 43;
</script>

<svelte:window bind:scrollY />

<header class={scrolledDown ? 'py-3 mb-3' : 'py-5 mb-5'} id="top">
    <div class="container">
        <nav
            class="navbar"
            class:navbar-compact={scrolledDown}
            role="navigation"
            aria-label="main navigation"
        >
            <div class="navbar-brand">
                {#if $request.path === '/'}
                    <DatawrapperLogo height={logoSize} />
                {:else}
                    <a class="navbar-item" href="/" style="line-height: 1">
                        <DatawrapperLogo height={logoSize} />
                    </a>
                {/if}

                <a
                    role="button"
                    class:is-active={isActive}
                    class="navbar-burger"
                    aria-label="menu"
                    aria-expanded="false"
                    href="#/mobile-menu"
                    on:click|preventDefault={() => (isActive = !isActive)}
                >
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
        background: white;
        border-bottom: 1px solid #eee;
        border-top: 3px solid #1d81a2;
        position: sticky;
        top: 0px;
        z-index: 1000;
        transition: all 0.2s ease-in-out;
    }
</style>
