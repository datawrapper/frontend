<script>
    import SvgIcon from 'layout/partials/SvgIcon.svelte';
    import { getContext } from 'svelte';
    import { patch } from '@datawrapper/shared/httpReq';

    export let __;

    const user = getContext('user');

    async function select(team) {
        await patch('/v3/me/settings', {
            payload: {
                activeTeam: team ? team.id : null
            }
        });
        $user.activeTeam = team;
        $user.teams.forEach(t => {
            t.active = team && t.id === team.id;
        });
        $user = $user;
    }
</script>

{#if $user.teams && $user.teams.length}
    {#each $user.teams as team}
        <a
            href="#/select-team/{team.id}"
            class="navbar-item team-select"
            class:is-active-team={team.active}
            on:click|preventDefault={() => select(team)}
        >
            <SvgIcon
                className={team.active ? '' : 'has-text-grey-light'}
                icon="team{team.active ? '-check' : ''}"
                size="20px"
            />
            <span>{team.name}</span>
        </a>
    {/each}
    <a
        href="#/select-team/none"
        on:click|preventDefault={() => select(null)}
        class="navbar-item team-select has-text-weight-normal"
        class:is-active-team={!$user.activeTeam}
    >
        <SvgIcon
            className={!$user.activeTeam ? '' : 'has-text-grey-light'}
            icon="user{!$user.activeTeam ? '-check' : ''}"
            size="20px"
        />
        <span>{@html __('navbar / teams / no-team')}</span>
    </a>
{:else}
    <a class="navbar-item has-text-weight-normal" href="/account/teams">
        {__('account / my-teams / create')}
    </a>
{/if}

<style>
    .team-select.is-active-team {
        cursor: default;
    }
    .team-select.is-active-team :global(.icon) {
        background: var(--color-dw-scooter-lightest);
        /* padding: 2px;
        border: 2px solid var(--color-dw-scooter-lightest);
        box-sizing: content-box;
        border-radius: 2px;
        position: relative;
        top: -2px;
        left: -2px; */
    }
</style>
