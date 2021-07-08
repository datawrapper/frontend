<script>
    import { getContext } from 'svelte';
    const user = getContext('user');
    const request = getContext('request');
</script>

<nav>
    <ul />
</nav>

<style>
    nav ul {
        margin: 0;
        display: flex;
        column-gap: 3ex;
        align-items: center;
        height: 100%;
    }
</style>
