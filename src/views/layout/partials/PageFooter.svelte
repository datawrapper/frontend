<script>
    import { config } from 'lib/stores';
</script>

<footer>
    <div class="flex">
        <div>
            Datawrapper is developed by <b>Datawrapper GmbH.</b>
            <nav>
                <ul>
                    <li>Quick Start</li>
                    <li>Tutorial</li>
                </ul>
            </nav>
        </div>
        <div class="right">
            <a href="#top">Back to top</a><br />
            {$config.apiDomain} / {$config.dev ? 'dev' : 'prod'}
            <div />
        </div>
    </div>
</footer>

<style>
    footer {
        border-top: 1px solid #ccc;
        padding-top: 2ex;
        margin-top: 2ex;
        font-size: 12px;
    }
    nav ul {
        margin: 0;
        padding: 0;
    }
    nav ul li {
        display: inline-block;
        margin-right: 1ex;
    }
</style>
