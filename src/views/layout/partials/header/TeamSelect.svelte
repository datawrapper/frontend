<script>
    import SvgIcon from 'layout/partials/SvgIcon.svelte';
    import { getContext } from 'svelte';
    const user = getContext('user');

    function select(team) {
        // todo
    }
</script>

<div>
    {#if $user.teams.length}
        {#each $user.teams as team}
            <a
                href="#/select-team/{team.id}"
                class="navbar-item team-select"
                class:is-active-team={team.active}
                on:click|preventDefault={() => select(team)}
            >
                <SvgIcon icon="team" size="20px" />
                {team.name}
            </a>
        {/each}
        <a
            href="#/select-team/none"
            on:click|preventDefault={() => select(null)}
            class="navbar-item team-select"
            class:is-active-team={!$user.activeTeam}
        >
            <SvgIcon icon="user" size="20px" /> No team
        </a>
    {:else}
        <!-- advertise team feature -->
        <a class="navbar-item" href="/account/teams"> Create a team </a>
    {/if}
</div>

<style>
    .team-select :global(.icon) {
        color: var(--color-dw-gray-50) !important;
    }
    .team-select.is-active-team {
        cursor: default;
    }
    .team-select.is-active-team :global(.icon) {
        color: var(--color-dw-blue-medium) !important;
    }
</style>
