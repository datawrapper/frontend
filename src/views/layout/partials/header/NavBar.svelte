<script>
    import { getContext } from 'svelte';
    import VisArchive from './VisArchive.svelte';
    import TeamSelect from './TeamSelect.svelte';
    import { post, patch } from '@datawrapper/shared/httpReq';
    import SvgIcon from 'layout/partials/SvgIcon.svelte';
    import NavBarIcon from './NavBarIcon.svelte';

    export let isActive;
    export let __;

    const user = getContext('user');
    const config = getContext('config');
    const request = getContext('request');

    async function onNavItemClick(event, item) {
        if (item.type === 'logout') {
            event.preventDefault();
            await post('/v3/auth/logout');
            window.location.reload();
        } else if (item.type === 'language') {
            event.preventDefault();
            await patch('/v3/me', {
                payload: {
                    language: item.id
                }
            });
            window.location.reload();
        }
    }
</script>

<div class="navbar-menu" class:is-active={isActive}>
    <div class="navbar-end">
        {#each $config.headerLinks as link}
            {#if link.type === 'separator'}
                <hr class="navbar-separator mx-3 my-0" />
            {:else if link.type === 'visArchive'}
                <!-- visualization archive is a special component -->
                <VisArchive {link} {__} />
            {:else if link.submenuItems}
                <!-- top level navbar entry with submenu -->
                <div
                    class="navbar-item has-dropdown is-hoverable is-size-5 has-text-weight-medium ml-1"
                    class:just-arrow={link.type === 'visArchive' &&
                        !link.title &&
                        !link.icon &&
                        !link.svgIcon}
                >
                    <a
                        href={link.url || '#/dropdown'}
                        on:click={event => onNavItemClick(event, link)}
                        class="navbar-link"
                        style={link.style || ''}
                        class:is-arrowless={link.type !== 'visArchive'}
                    >
                        <NavBarIcon item={link} />
                        <span>{@html link.title || ''}</span></a
                    >
                    <!-- navbar dropdown menu -->
                    <div class="navbar-dropdown is-right is-boxed">
                        {#each link.submenuItems as subItem}
                            {#if subItem.type === 'separator'}
                                <hr class="navbar-divider" />
                            {:else if subItem.type === 'activeTeam'}
                                <div class="navbar-item active-team is-size-7">
                                    In: <SvgIcon
                                        icon="folder{$user.activeTeam ? '-shared' : ''}"
                                        color="#a7a7a7"
                                        className="mx-1"
                                        size="1.2rem"
                                    />
                                    {$user.activeTeam ? $user.activeTeam.name : 'My Charts'}
                                </div>
                            {:else if subItem.type === 'teamSelector'}
                                <TeamSelect {__} />
                            {:else if subItem.type === 'html'}
                                <div
                                    class="navbar-item has-text-weight-normal "
                                    on:click={event => onNavItemClick(event, subItem)}
                                    style={subItem.style || ''}
                                >
                                    {@html subItem.content}
                                </div>
                            {:else if subItem.submenuItems}
                                <!-- dropdown with dropdown -->
                                <a
                                    class="navbar-item has-dropdown is-hoverable has-text-weight-normal "
                                    href="#/dropdown"
                                >
                                    <NavBarIcon item={subItem} />
                                    <span>{@html subItem.title || ''}</span>
                                    <div class="navbar-dropdown is-right  is-boxed">
                                        {#each subItem.submenuItems as subItem2}
                                            <a
                                                class="navbar-item has-text-weight-normal {subItem2.class ||
                                                    ''}"
                                                on:click={event => onNavItemClick(event, subItem2)}
                                                style={subItem2.style}
                                            >
                                                <NavBarIcon item={subItem2} />
                                                <span>{@html subItem2.title}</span>
                                            </a>
                                        {/each}
                                    </div>
                                </a>
                            {:else}
                                <a
                                    class="navbar-item has-text-weight-normal"
                                    href={subItem.url}
                                    on:click={event => onNavItemClick(event, subItem)}
                                    ><NavBarIcon item={subItem} />
                                    <span>{@html subItem.title || ''}</span></a
                                >
                            {/if}
                        {/each}
                    </div>
                </div>
            {:else}
                <!-- top-level navbar link/icon -->
                <a
                    class:is-active={link.url === '/'
                        ? $request.path === '/'
                        : $request.path.startsWith(link.url)}
                    class="navbar-item is-size-5 has-text-weight-medium ml-1"
                    on:click={event => onNavItemClick(event, link)}
                    href={link.url}
                    ><NavBarIcon item={link} /> <span>{@html link.title || ''}</span></a
                >
            {/if}
        {/each}
    </div>
</div>

<style lang="less">
    .navbar-menu {
        :global(.navbar-item, .navbar-link) {
            border-radius: var(--radius);
        }
        :global(a.navbar-item:hover) {
            color: var(--color-dw-scooter);
        }
        :global(.just-arrow) {
            // padding: 0 !important;
            // margin: 0 !important;
        }
        // :global(.navbar-item.just-arrow:hover .navbar-link) {
        //     background: transparent;
        // }
        :global(.navbar-dropdown .navbar-item.active-team) {
            background: #f9f9f9;
            margin: 0;
            margin-bottom: 0px;
            margin-bottom: -0.5rem;
            padding: 0.5rem 1rem !important;
            border-bottom-left-radius: 4px;
            border-bottom-right-radius: 4px;
        }

        .navbar-separator {
            display: flex;
            background: var(--color-dw-grey-light);
            height: 3em;
            width: 1px;
            align-self: center;
        }
        .navbar-item.has-dropdown {
            .navbar-link:hover {
                color: inherit;
            }
        }
    }
    :global(.navbar-compact) .navbar-separator {
        transition: height 0.2 ease-in-out;
        height: 1.5em;
    }

    .navbar-item.has-dropdown .navbar-item.has-dropdown .navbar-dropdown {
        position: absolute;
        left: -100%;
        right: 100%;
        top: -6px;
        display: none;
    }

    .navbar-item.has-dropdown .navbar-item.has-dropdown:hover .navbar-dropdown {
        display: block;
    }
</style>
