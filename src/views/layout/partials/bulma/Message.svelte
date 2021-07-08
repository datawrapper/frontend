<script>
    export let title = '';
    export let type = 'info';

    let visible = true;
</script>

{#if visible}
    <article class="message {type ? `is-${type}` : ''}">
        {#if title}
            <div class="message-header">
                <p>{@html title}</p>
                <button class="delete" on:click={() => (visible = false)} aria-label="delete" />
            </div>
        {/if}
        <div class="message-body">
            <slot />
        </div>
    </article>
{/if}
