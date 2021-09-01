<script>
    import { getContext } from 'svelte';
    import DatawrapperLogo from './header/DatawrapperLogo.svelte';
    import NavBar from './header/NavBar.svelte';

    const config = getContext('config');
    const msg = getContext('messages');

    let __;
    $: {
        __ = (key, scope = 'core') => msg.translate(key, scope, $msg);
    }

    $: stickyHeaderThreshold = $config.stickyHeaderThreshold;

    const request = getContext('request');
    let isActive = false;

    let scrollY = 0;
    $: scrolledDown = scrollY > 0;
    const logoSize = 43;
    $: logoScale = scrolledDown ? 34 / 43 : 1;

    let innerHeight = 0;
</script>

<svelte:window bind:scrollY bind:innerHeight />

<header
    class={scrolledDown ? 'py-3 mb-3' : 'py-5 mb-5'}
    class:is-sticky={innerHeight > stickyHeaderThreshold}
    id="top"
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
            <NavBar {isActive} {__} />
        </nav>
    </div>
</header>

<style>
    header {
        background: white;
        border-bottom: 1px solid #eee;
        border-top: 3px solid var(--color-dw-blue-medium);
        transition: padding 0.2s ease-in-out, margin 0.2s ease-in-out;
    }

    header.is-sticky {
        position: sticky;
        top: 0px;
        z-index: 1000;
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
        transition: padding 0.2s ease-in-out;
    }
</style>
