<script>
    import { getContext } from 'svelte';
    const config = getContext('config');
    const msg = getContext('messages');

    let __;
    $: {
        __ = (key, scope = 'core') => msg.translate(key, scope, $msg);
    }
</script>

<footer class="footer">
    <div class="columns">
        <div class="column">
            <p class="mb-0">{@html __('footer / datawrapper-gmbh')}</p>
            <nav>
                <ul>
                    {#each $config.footerLinks as link}
                        <li><a href={link.url}>{link.title.en}</a></li>
                    {/each}
                </ul>
            </nav>
        </div>
        <div class="column is-narrow">
            <a href="#top" on:click|preventDefault={() => window.scrollTo(0, 0)}
                >{__('Back to top')}</a
            >{#if config.dev}
                <br />
                {$config.apiDomain}
            {/if}
        </div>
    </div>
</footer>

<style>
    footer {
        border-top: 1px solid #ccc;
        padding-top: 2ex;
        margin-top: 2ex;
        font-size: 14px;
    }
    nav ul {
        color: silver;
        margin: 0;
        padding: 0;
    }
    nav ul li {
        display: inline-block;
        margin-right: 0.3ex;
    }
    nav ul li + li {
        margin-left: 0.3ex;
    }
    nav ul li + li:before {
        content: ' – ';
    }
</style>
