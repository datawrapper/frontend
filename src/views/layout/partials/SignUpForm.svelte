<script>
    import { getContext } from 'svelte';
    const messages = getContext('messages');
    let __;
    $: {
        __ = (key, scope = 'core') => messages.translate(key, scope, $messages);
    }

    let step = 'signup'; // can also be 'signin', 'password-reset', or 'otp'
    const providers = ['google', 'twitter', 'facebook', 'github'];

    let emailOpen = false;
    let passwordClear = false;

    export let target = '/';

    function capitalize(s) {
        return s
            .trim()
            .toLowerCase()
            .replace(/\w\S*/g, w => w.replace(/^\w/, c => c.toUpperCase()));
    }
</script>

<div class="content block">
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
                <div class="signup-form">
                    <button
                        class="button provider-email is-fullwidth mb-2"
                        on:click={() => (emailOpen = true)}
                    >
                        <span class="icon mr-1">
                            <i class="fa fa-envelope" />
                        </span>
                        Sign up using email</button
                    >
                </div>
                <hr />
                <div class="signup-form">
                    {#each providers as provider}
                        <a
                            href="/signin/{provider}"
                            class="button provider-{provider} is-fullwidth mb-2"
                        >
                            <span class="icon mr-1">
                                <i class="fa fa-{provider}" />
                            </span>
                            Sign up using {capitalize(provider)}</a
                        >
                    {/each}
                </div>
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
                <div class="signup-form">
                    <button
                        class="button provider-email is-fullwidth mb-2"
                        on:click={() => (emailOpen = true)}
                    >
                        <span class="icon mr-1">
                            <i class="fa fa-envelope" />
                        </span>
                        Sign in using email</button
                    >
                </div>
                <hr />
                <div class="signup-form">
                    {#each providers as provider}
                        <a
                            href="/signin/{provider}"
                            class="provider-{provider} button is-fullwidth mb-2"
                        >
                            <span class="icon mr-1">
                                <i class="fa fa-{provider}" />
                            </span>
                            Sign in with {capitalize(provider)}</a
                        >
                    {/each}
                </div>
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

<style lang="less">
    @google: #EA4335;
    @facebook: #1877F2;
    @twitter: #1D9BF0;

    .button.is-fullwidth {
        text-align: left;
        justify-content: left;
        padding-left: 70px;
    }

    .signup-form {
        max-width: 300px;

        .button .icon {
            position: absolute;
            left: 0;
            top: 0;
            width: 50px;
            height: 100%;
            border-top-left-radius: 4px;
            border-bottom-left-radius: 4px;
            background: fade(#333333, 10%);
            color: #333333;
            font-size: 24px;
            margin-left: 0;

            i {
                position: relative;
                top: 1px;
            }
        }

        :global(.button.provider-facebook .icon) {
            background: fade(@facebook, 10%);
            color: @facebook;
        }
        :global(.button.provider-google .icon) {
            background: fade(@google, 10%);
            color: @google;
        }
        :global(.button.provider-twitter .icon) {
            background: fade(@twitter, 10%);
            color: @twitter;
        }
    }
</style>
