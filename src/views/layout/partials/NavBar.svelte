<script>
    import { user } from 'lib/stores';
</script>

<nav>
    <ul>
        <li>Start creating</li>
        <li>My Charts</li>
        {#if $user.isAdmin}
            <li>Admin</li>
        {/if}
        <li>{$user.name}</li>
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
