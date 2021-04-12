<script>
    import { getContext } from 'svelte';
    const user = getContext('user');
</script>

<nav>
    <ul>
        <li>Start creating</li>
        <li>My Charts</li>
        {#if $user.isAdmin}
            <li>Admin</li>
        {/if}
        <li>
            {#if $user.isGuest}Guest{:else}{$user.name}{/if}
        </li>
        <li>{$user.language}</li>
    </ul>
</nav>

<style>
    nav ul {
        margin: 0;
        display: flex;
        column-gap: 2ex;
    }
    nav ul li {
        list-style: none;
    }
</style>
