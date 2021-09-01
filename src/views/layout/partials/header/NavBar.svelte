<script>
    import { getContext } from 'svelte';
    import SvgIcon from 'layout/partials/SvgIcon.svelte';
    import VisArchive from './VisArchive.svelte';
    import TeamSelect from './TeamSelect.svelte';
    import { post } from '@datawrapper/shared/httpReq';

    export let isActive;

    const user = getContext('user');
    const config = getContext('config');
    const request = getContext('request');

    async function onNavItemClick(event, item) {
        if (item.type === 'logout') {
            event.preventDefault();
            await post('/v3/auth/logout');
            window.location.reload();
        }
    }
</script>

<div class="navbar-menu" class:is-active={isActive}>
    <div class="navbar-end">
        {#each $config.headerLinks as link}
            {#if link.type === 'separator'}
                <div class="navbar-separator mx-3">
                    <span aria-hidden="true" />
                </div>
            {:else if link.submenuItems}
                <!-- top level navbar entry with submenu -->
                <div
                    class="navbar-item has-dropdown is-hoverable"
                    class:just-arrow={link.type === 'visArchive' &&
                        !link.title &&
                        !link.icon &&
                        !link.svgIcon}
                >
                    <a
                        href={link.url || '#/dropdown'}
                        on:click={event => onNavItemClick(event, link)}
                        class="navbar-link"
                        class:is-arrowless={link.type !== 'visArchive'}
                        >{#if link.svgIcon}<SvgIcon
                                size={link.svgIconSize || '20px'}
                                crisp={!!link.svgIconCrisp}
                                valign="top"
                                icon={link.svgIcon}
                                className={link.title ? '' : 'mr-0'}
                            />{/if}{#if link.fontIcon}<span class="icon"
                                ><i class={link.fontIcon} /></span
                            >{/if} <span>{@html link.title || ''}</span></a
                    >
                    {#if link.type === 'visArchive'}
                        <!-- visualization archive is a special component -->
                        <VisArchive />
                    {:else}
                        <!-- navbar dropdown menu -->
                        <div class="navbar-dropdown is-right">
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
                                    <TeamSelect />
                                {:else if subItem.type === 'html'}
                                    <div
                                        class="navbar-item"
                                        on:click={event => onNavItemClick(event, subItem)}
                                        style={subItem.style || ''}
                                    >
                                        {@html subItem.content}
                                    </div>
                                {:else}
                                    <a
                                        class="navbar-item"
                                        href={subItem.url}
                                        on:click={event => onNavItemClick(event, subItem)}
                                        >{#if subItem.svgIcon}<SvgIcon
                                                size="20px"
                                                valign="top"
                                                icon={subItem.svgIcon}
                                            />{/if}{#if subItem.fontIcon}<span class="icon"
                                                ><i class={subItem.fontIcon} /></span
                                            >{/if} <span>{@html subItem.title || ''}</span></a
                                    >
                                {/if}
                            {/each}
                        </div>
                    {/if}
                </div>
            {:else}
                <!-- top-level navbar link/icon -->
                <a
                    class:is-active={link.url === '/'
                        ? $request.path === '/'
                        : $request.path.startsWith(link.url)}
                    class="navbar-item"
                    on:click={event => onNavItemClick(event, link)}
                    href={link.url}
                    >{#if link.svgIcon}<SvgIcon
                            size={link.svgIconSize || '20px'}
                            crisp={!!link.svgIconCrisp}
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

<style lang="less">
    .navbar-menu {
        :global(.navbar-item) {
            transition: none !important;
            font-size: 16px;
            font-family: Roboto;
            font-weight: 500;
            margin: 0 0.2rem;
            padding: 0.25rem 1rem !important;
            transition: all 0.5s ease-in-out;

            &:hover {
                background: var(--color-dw-gray-90) !important;
                border-radius: var(--box-border-radius);

                a.navbar-link:hover {
                    background: none !important;
                }
            }

            &.is-active {
                background: var(--color-dw-blue-light) !important;
                border-radius: var(--box-border-radius);
            }

            &.just-arrow {
                padding: 0 !important;
                margin: 0 !important;
                // margin-left: -1.5em!important;

                .navbar-link:after {
                    right: 1.4em;
                }
            }
        }

        :global(.navbar-item .icon) {
            margin-right: 1ex;
            color: var(--color-dw-blue-medium);
        }

        :global(a.navbar-item:hover) {
            background: var(--color-dw-gray-90) !important;
            border-radius: var(--box-border-radius);
        }

        :global(.navbar-dropdown) {
            border-radius: var(--box-border-radius);
            border: 1px solid var(--color-dw-gray);
            box-shadow: 0px 4px 4px 0px #00000040;
        }

        :global(.navbar-dropdown .navbar-item) {
            font-weight: normal;
            font-size: 14px;
        }

        :global(.navbar-dropdown .navbar-item.active-team) {
            background: #f9f9f9;
            font-weight: normal;
            color: #a7a7a7;
            margin: 0;
            margin-bottom: 0px;
            margin-bottom: -0.5rem;
            padding: 0.5rem 1rem !important;
            border-bottom-left-radius: var(--box-border-radius);
            border-bottom-right-radius: var(--box-border-radius);
        }

        .navbar-separator span {
            border-left: 1px solid var(--color-dw-gray);
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
            display: inline-block;
            height: 2.2rem;
            transition: all 0.5s ease-in-out;
        }
    }

    .navbar-item.has-dropdown:hover .navbar-link {
        background: transparent;
    }

    :global(.navbar-compact) .navbar-separator span {
        transition: height, margin 0.2 ease-in-out;
        margin-top: 0.23rem;
        margin-bottom: 0.23rem;
        height: 2.2rem;
    }

    .navbar-menu :global(.is-size-7) {
        font-weight: normal;
    }
</style>
