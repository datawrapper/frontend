<script>
    import { getContext } from 'svelte';
    import DatawrapperLogo from './header/DatawrapperLogo.svelte';
    import NavBar from './header/NavBar.svelte';

    const request = getContext('request');
    let isActive = false;

    let scrollingUp = false;
    let lastScrollY = 0;
    let scrollY = 0;
    $: scrolledDown = scrollY > 0;
    const logoSize = 43;
    $: logoScale = scrolledDown ? 34 / 43 : 1;

    function onScroll() {
        if (scrollY && lastScrollY) {
            scrollingUp = scrollY < lastScrollY && Math.abs(scrollY - lastScrollY) < 50;
        }
        lastScrollY = scrollY;
    }
</script>

<svelte:window bind:scrollY on:scroll={onScroll} />

<header
    class={scrolledDown ? 'py-3 mb-3' : 'py-5 mb-5'}
    id="top"
    class:hidden={!scrollingUp && scrolledDown}
>
    <div class="container">
        <nav
            class="navbar"
            class:navbar-compact={scrolledDown}
            role="navigation"
            aria-label="main navigation"
        >
            <div class="navbar-brand">
                <div
                    style="transform:scale({logoScale}); transform-origin: left center; transition: transform 0.2s ease-in-out"
                >
                    {#if $request.path === '/'}
                        <DatawrapperLogo height={logoSize} />
                    {:else}
                        <a class="navbar-item" href="/" style="line-height: 1">
                            <DatawrapperLogo height={logoSize} />
                        </a>
                    {/if}
                </div>

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
        border-top: 3px solid var(--color-dw-blue-medium);
        position: sticky;
        top: 0px;
        z-index: 1000;
        transition: all 0.2s ease-in-out;
    }

    header.hidden {
        top: -80px;
    }

    .navbar-burger > span {
        height: 2px;
        width: 20px;
    }

    .navbar-brand .navbar-item {
        padding-top: 0;
        padding-bottom: 0;
    }

    .navbar-compact .navbar-item {
        padding: 0.15rem 1rem !important;
    }
</style>
