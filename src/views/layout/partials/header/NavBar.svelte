<script>
    import { getContext } from 'svelte';
    import SvgIcon from 'layout/partials/SvgIcon.svelte';
    import VisArchive from './VisArchive.svelte';

    export let isActive;

    const user = getContext('user');
    const config = getContext('config');
    const request = getContext('request');
</script>

<div class="navbar-menu" class:is-active={isActive}>
    <div class="navbar-end">
        {#each $config.headerLinks as link}
            {#if link.type === 'separator'}
                <div class="navbar-separator mx-3">
                    <span aria-hidden="true" />
                </div>
            {:else if link.submenuItems}
                <div class="navbar-item has-dropdown is-hoverable">
                    <a
                        href={link.url || '#/dropdown'}
                        class="navbar-link"
                        class:is-arrowless={link.type !== 'visArchive'}
                        >{#if link.svgIcon}<SvgIcon
                                size={link.svgIconSize || '20px'}
                                crisp={!!link.svgIconCrisp}
                                valign="top"
                                icon={link.svgIcon}
                            />{/if}{#if link.fontIcon}<span class="icon"
                                ><i class={link.fontIcon} /></span
                            >{/if} <span>{@html link.title || ''}</span></a
                    >
                    {#if link.type === 'visArchive'}
                        <VisArchive />
                    {:else}
                        <div class="navbar-dropdown is-right">
                            {#each link.submenuItems as subItem}
                                {#if subItem.type === 'separator'}
                                    <hr class="navbar-divider" />
                                {:else if subItem.type === 'activeTeam'}
                                    <div class="navbar-item active-team is-size-7">
                                        In: <SvgIcon
                                            icon="folder-shared"
                                            color="#a7a7a7"
                                            className="mx-1"
                                            size="1.2rem"
                                        /> TeamName
                                    </div>
                                {:else if subItem.type === 'visArchive'}
                                    <div class="navbar-item active-team is-size-7">
                                        In: <SvgIcon
                                            icon="folder-shared"
                                            color="#a7a7a7"
                                            className="mx-1"
                                            size="1.2rem"
                                        /> TeamName
                                    </div>
                                {:else if subItem.type === 'html'}
                                    <div class="navbar-item" style={subItem.style || ''}>
                                        {@html subItem.content}
                                    </div>
                                {:else}
                                    <a class="navbar-item" href={subItem.url}
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
                <a
                    class:is-active={link.url === '/'
                        ? $request.path === '/'
                        : $request.path.startsWith(link.url)}
                    class="navbar-item"
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

<style>
    :global(.navbar-dropdown) {
        border-radius: var(--box-border-radius);
        border: 1px solid var(--color-dw-gray);
        box-shadow: 0px 4px 4px 0px #00000040;
    }
    .navbar-item.is-active {
        background: var(--color-dw-blue-light) !important;
        border-radius: var(--box-border-radius);
    }

    .navbar-item {
        font-size: 16px;
        font-family: Roboto;
        font-weight: 500;
        margin: 0 0.2rem;
        padding: 0.25rem 1rem !important;
        transition: all 0.5s ease-in-out;
    }

    .navbar-item :global(.icon) {
        margin-right: 1ex;
        color: var(--color-dw-blue-medium);
    }
    .navbar-item.active-team {
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

    :global(.navbar-compact) .navbar-separator span {
        margin-top: 0.23rem;
        margin-bottom: 0.23rem;
        height: 2.2rem;
    }

    .navbar-menu :global(.is-size-7) {
        font-weight: normal;
    }
</style>
