<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let items = []; // { id, title }
    export let active;

    function setActive(item) {
        active = item.id;
        dispatch('change', item);
    }
</script>

<div class="tabs is-boxed">
    <ul>
        {#each items as item}
            <li class:is-active={active === item.id}>
                <a on:click|preventDefault={() => setActive(item)} href="#/{item.id}"
                    >{@html item.title}</a
                >
            </li>
        {/each}
    </ul>
</div>
