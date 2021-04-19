<script>
    export let deletable = true;
    export let type = '';
    export let content = '';
    let deleted = false;
</script>

{#if !deleted}
    <div class="notification {type ? `is-${type}` : ''}">
        {#if deletable}<button
                aria-label="delete"
                on:click={() => (deleted = true)}
                class="delete"
            />{/if}
        <slot />
    </div>
{/if}
