<script>
    export let deletable = true;
    export let type = '';
    export let visible = true;
</script>

{#if visible}
    <div class="notification {type ? `is-${type}` : ''}">
        {#if deletable}<button
                aria-label="delete"
                on:click={() => (visible = false)}
                class="delete"
            />{/if}
        <slot />
    </div>
{/if}
