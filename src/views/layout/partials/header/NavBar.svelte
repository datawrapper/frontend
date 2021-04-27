<script>
    import { getContext } from 'svelte';
    import SvgIcon from 'layout/partials/SvgIcon.svelte';

    export let isActive;

    const user = getContext('user');
    const config = getContext('config');
    const request = getContext('request');
</script>

<div class="navbar-menu" class:is-active={isActive}>
    <div class="navbar-end">
        {#each $config.headerLinks as link}
            {#if link.id === 'separator'}
                <div class="navbar-separator mx-3" />
            {:else if link.submenuItems}
                <div class="navbar-item has-dropdown is-hoverable">
                    <a class="navbar-link is-arrowless"
                        >{#if link.svgIcon}<SvgIcon
                                size="1.2rem"
                                valign="top"
                                icon={link.svgIcon}
                            />{/if}{#if link.fontIcon}<span class="icon"
                                ><i class={link.fontIcon} /></span
                            >{/if} <span>{@html link.title || ''}</span></a
                    >
                    <div class="navbar-dropdown is-right">
                        {#each link.submenuItems as subItem}
                            {#if subItem.id === 'separator'}
                                <hr class="navbar-divider" />
                            {:else}
                                <a class="navbar-item" href={subItem.url}
                                    >{#if subItem.svgIcon}<SvgIcon
                                            size="1rem"
                                            valign="top"
                                            icon={subItem.svgIcon}
                                        />{/if}{#if subItem.fontIcon}<span class="icon"
                                            ><i class={subItem.fontIcon} /></span
                                        >{/if} <span>{@html subItem.title || ''}</span></a
                                >
                            {/if}
                        {/each}
                    </div>
                </div>
            {:else}
                <a
                    class:is-active={$request.path.startsWith(link.url)}
                    class="navbar-item"
                    href={link.url}
                    >{#if link.svgIcon}<SvgIcon
                            size="1.2rem"
                            valign="top"
                            icon={link.svgIcon}
                        />{/if}{#if link.fontIcon}<span class="icon"
                            ><i class={link.fontIcon} /></span
                        >{/if} <span>{@html link.title || ''}</span></a
                >
            {/if}
        {/each}
    </div>
</div>

<style>
    .navbar-separator {
        border-left: 1px solid #d7d7d7;
        border-right: 1px solid #ffffff;
    }
    nav ul {
        margin: 0;
        display: flex;
        column-gap: 3ex;
        align-items: center;
        height: 100%;
    }
</style>
