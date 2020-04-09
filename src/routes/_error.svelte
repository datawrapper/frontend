<script>
    import { onMount } from 'svelte';
    export let status;
    export let error;

    const dev = process.env.NODE_ENV === 'development';

    onMount(() => {
        console.error(error);
    });
</script>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: center;
        max-width: 768px;
        padding: 1em;
        margin: 0 auto;
        min-height: 100vh;
    }

    h1,
    h2 {
        text-align: center;
    }

    h1 {
        font-size: 2.8em;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
    }

    .grid {
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: center;
    }

    .key {
        padding-right: 1em;
    }

    .scroll {
        overflow: scroll;
    }

    pre {
        background: #eee;
        border: 1px solid #ccc;
        padding: 1em;
        border-radius: 4px;
        line-height: 1.2;
        white-space: pre-line;
    }

    @media (min-width: 480px) {
        h1 {
            font-size: 4em;
        }
    }
</style>

<svelte:head>
    <title>{status} - {error.message}</title>
</svelte:head>

<main>
    <h1>{status}</h1>
    <h2>{error.message}</h2>

    {#if dev}
        <h3>Debug Information</h3>
        <div class="grid">
            {#if error.debug}
                {#each Object.entries(error.debug) as [key, value]}
                    <div class="key">
                        <strong>
                            <code>{key}</code>
                        </strong>
                    </div>
                    <pre class="scroll">
                        {typeof value !== 'string' ? JSON.stringify(value, null, 2) : value}
                    </pre>
                {/each}
            {/if}
            <div class="key">
                <strong>
                    <code>stacktrace</code>
                </strong>
            </div>
            <pre class="scroll">{error.stack}</pre>
        </div>
    {/if}
</main>
