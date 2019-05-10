<script context="module">
    export function preload(page, session) {
        if (session.user && session.user.role !== 'guest') this.redirect(302, '/');
    }
</script>

<script>
    import { goto, stores } from '@sapper/app';
    const { session } = stores();
    let email = '';
    let password = '';

    let loading = false;

    async function handleSubmit(e) {
        e.preventDefault();

        loading = true;
        const res = await fetch(`http://datawrapper.localhost:3001/v3/auth/login`, {
            method: 'POST',
            credentials: 'include',
            mode: 'cors',
            body: JSON.stringify({ email, password, keepSession: true })
        });

        if (res.ok) {
            const userRes = await fetch(`http://datawrapper.localhost:3001/v3/me`, {
                credentials: 'include',
                mode: 'cors'
            });

            const user = await userRes.json();

            session.update(value => {
                value.user = user;
                return value;
            });

            goto('/');
        }
    }
</script>

<style>
    /* your styles go here */
</style>

<form>
    <label>
        <div>E-Mail</div>
        <input type="text" bind:value={email} placeholder="E-Mail" />
    </label>
    <label>
        <div>Password</div>
        <input type="password" bind:value={password} placeholder="Password" />
    </label>
    <div>
        <button on:click={handleSubmit}>Login</button>
        {loading ? '🔅' : ''}
    </div>
</form>
