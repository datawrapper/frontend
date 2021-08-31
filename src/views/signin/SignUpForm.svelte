<script>
    import { getContext } from 'svelte';
    import ProviderButtons from './ProviderButtons.svelte';
    const messages = getContext('messages');
    let __;
    $: {
        __ = (key, scope = 'core') => messages.translate(key, scope, $messages);
    }

    let step = 'signup'; // can also be 'signin', 'password-reset', or 'otp'
    const providers = ['google', 'okta', 'onelogin', 'twitter', 'facebook', 'github'];

    let emailOpen = false;
    let passwordClear = false;

    export let target = '/';
</script>

<div class="content">
    {#if step === 'signup'}
        <div>
            <h2 class="title is-3">{@html __('login / signup / headline')}</h2>
            <p>{@html __('login / signup / intro')}</p>

            {#if emailOpen}
                <div class="signup-form">
                    <div class="field">
                        <label for="su-email" class="label">Email</label>
                        <input
                            id="su-email"
                            placeholder="name@domain.tld"
                            class="input"
                            type="email"
                        />
                    </div>
                    <div class="field">
                        <label for="su-pwd" class="label">Password</label>
                        <input
                            id="su-pwd"
                            class="input"
                            type={passwordClear ? 'text' : 'password'}
                        />
                    </div>
                    <div class="field">
                        <label class="checkbox"
                            ><input bind:checked={passwordClear} type="checkbox" />
                            {@html __('account / invite / password-clear-text')}</label
                        >
                    </div>

                    <button class="button is-primary mb-2" on:click={() => (emailOpen = true)}>
                        {@html __('Sign Up')}</button
                    >
                    <div class="mt-5">
                        <a href="#/back" on:click|preventDefault={() => (emailOpen = false)}>
                            ←&nbsp;&nbsp;Choose a different provider</a
                        >
                    </div>
                </div>
            {:else}
                <ProviderButtons {providers} bind:emailOpen signIn={false} />
            {/if}

            <hr />
            <p class=" mt-3">
                <strong>Already have an account?</strong><br />
                <a
                    href="#/signin"
                    class="has-text-weight-bold"
                    on:click|preventDefault={() => {
                        step = 'signin';
                        emailOpen = false;
                    }}>Sign in here</a
                >.
            </p>
        </div>
    {:else if step === 'signin'}
        <div>
            <h2 class="title is-3">{@html __('login / login / headline')}</h2>
            <p>{@html __('login / login / intro')}</p>
            {#if emailOpen}
                <div class="signup-form">
                    <div class="field">
                        <label for="si-email" class="label">Email</label>
                        <input
                            id="si-email"
                            placeholder="name@domain.tld"
                            class="input"
                            type="email"
                        />
                    </div>
                    <div class="field">
                        <label for="si-pwd" class="label">Password</label>
                        <input id="si-pwd" class="input" type="password" />
                    </div>
                    <button class="button is-primary mb-2" on:click={() => (emailOpen = true)}>
                        {@html __('Login')}</button
                    >
                    <div class="mt-5">
                        <a href="#/back" on:click|preventDefault={() => (emailOpen = false)}>
                            ←&nbsp;&nbsp;Choose a different provider</a
                        >
                    </div>
                </div>
            {:else}
                <ProviderButtons {providers} bind:emailOpen signIn={true} />
            {/if}

            <hr />
            <p class="mt-3">
                <strong>Don't have an account, yet?</strong><br />
                <a
                    href="#/signin"
                    class="has-text-weight-bold"
                    on:click|preventDefault={() => {
                        step = 'signup';
                        emailOpen = false;
                    }}>Create a new account</a
                >. It's free and done quickly.
            </p>
        </div>
    {:else if step === 'otp'}
        <p>Please enter your one time password token:</p>
    {/if}
</div>
