<script context="module">
    export async function preload(page, session) {
        if (!session.user || session.user.role === 'anonymous') {
            /* https://stackoverflow.com/a/2839594 */
            this.redirect(302, '/login');
            return { user: session.user, charts: {} };
        }

        const chartRes = await this.fetch(`${API_BASE_URL}/charts?limit=5&published=true`, {
            credentials: 'include'
        });

        const charts = await chartRes.json();

        return { user: session.user, charts };
    }
</script>

<script>
    export let user;
    export let charts;
</script>

<style>
    h1,
    h2,
    p {
        text-align: center;
        margin: 0 auto;
    }

    h1 {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 2.8em;
        text-transform: uppercase;
        font-weight: 700;
        margin: 0 0 0.5em 0;
    }

    p {
        margin: 1em auto;
    }

    img {
        height: 100px;
        margin-right: 20px;
    }

    @media (min-width: 480px) {
        h1 {
            font-size: 4em;
        }
    }
</style>

<svelte:head>
    <title>Datawrapper</title>
</svelte:head>

<h1>
    <img src="https://jadeaviablog.files.wordpress.com/2013/08/emimem.jpg" alt="Eminem" />
    <div>The new Data Rapper</div>
</h1>

<h2>🙋🏻‍♂️</h2>

<p>
    <strong>{user.email}</strong>
</p>

<p>
    <strong>You have {user.chartCount} charts! Well done!</strong>
</p>

<ul>
    {#each charts.list as chart}
        <li>
            <a href="./chart/{chart.id}">
                <code>[{chart.id}]</code>
            </a>
            - {chart.title}
        </li>
    {/each}
</ul>
