<script>
    import Notification from 'layout/partials/bulma/Notification.svelte';
    import ProviderButtons from './ProviderButtons.svelte';
    import CheckPassword from './CheckPassword.svelte';
    import { trackEvent } from '@datawrapper/shared/analytics';
    import { isValidEmail } from './utils';

    export let __;
    export let target;
    export let step;
    export let email;
    export let signupWithoutPassword;
    export let providers;
    export let emailOpen;
    export let password = '';
    export let noSignIn;

    let passwordClear = false;

    let signingUp;
    let signupSuccess;
    let signupError;

    let passwordOk;
    let passwordHelp;
    let passwordSuccess;
    let passwordError;

    async function doSignUp() {
        if (signingUp) return;
        // reset messages
        signingUp = true;
        signupError = signupSuccess = '';
        try {
            await httpReq.post('/v3/auth/signup', {
                payload: {
                    email,
                    invitation: signupWithoutPassword,
                    password: !signupWithoutPassword ? password : undefined
                }
            });

            trackEvent('App', 'sign-up');

            if (!signupWithoutPassword) {
                // @todo: translate
                signupSuccess = 'Sign up successful. Redirecting to user dashboard.';
                setTimeout(() => {
                    window.location.href = target;
                }, 2000);
            } else {
                // @todo: translate
                signupSuccess =
                    'Please check your e-mail inbox to proceed on your desktop computer.';
                signingUp = false;
            }
        } catch (error) {
            if (error.name === 'HttpReqError') {
                const body = await error.response.json();
                signupError = body ? body.message : error.message;
            } else {
                signupError = error;
            }
            signingUp = false;
        }
    }
</script>

<div>
    <h2 class="title is-3">{@html __('login / signup / headline')}</h2>
    <p>{@html __('login / signup / intro')}</p>

    {#if emailOpen}
        {#if signupError || signupSuccess}
            <Notification type={signupError ? 'warning' : 'success'} deletable={false}>
                {@html signupError || signupSuccess}
            </Notification>
        {/if}
        <div class="signup-form">
            <div class="field">
                <label for="su-email" class="label">{__('email')}</label>
                <input
                    id="su-email"
                    placeholder="name@domain.tld"
                    class="input"
                    class:is-danger={email && !isValidEmail(email)}
                    bind:value={email}
                    type="email"
                />
            </div>
            <div class="field">
                <label for="su-pwd" class="label">{__('password')}</label>
                {#if passwordClear}
                    <!-- input types can't be dynamic when using two-way value binding -->
                    <input
                        id="su-pwd"
                        class="input"
                        bind:value={password}
                        type="text"
                        class:is-danger={passwordError}
                        class:is-success={!passwordError && passwordSuccess}
                    />
                {:else}
                    <input
                        class:is-danger={passwordError}
                        class:is-success={!passwordError && passwordSuccess}
                        id="su-pwd"
                        class="input"
                        bind:value={password}
                        type="password"
                    />
                {/if}
                {#if passwordError}
                    <p class="help is-danger">{@html passwordError}</p>
                {:else if passwordSuccess}
                    <p class="help is-success is-dark">{@html passwordSuccess}</p>
                {:else if passwordHelp}
                    <p class="help has-text-grey">{@html passwordHelp}</p>
                {/if}
            </div>
            <CheckPassword
                {__}
                bind:password
                bind:passwordHelp
                bind:passwordSuccess
                bind:passwordError
                bind:passwordOk
            />
            <div class="field">
                <label class="checkbox"
                    ><input bind:checked={passwordClear} type="checkbox" />
                    {@html __('account / invite / password-clear-text')}</label
                >
            </div>

            <button class="button is-primary mb-2" on:click={() => doSignUp()}>
                {@html __('Sign Up')}</button
            >
            <div class="mt-5">
                <a href="#/back" on:click|preventDefault={() => (emailOpen = false)}>
                    ←&nbsp;&nbsp;{__('signin / choose-different-provider')}</a
                >
            </div>
        </div>
    {:else}
        <ProviderButtons {__} {providers} bind:emailOpen signIn={false} />
    {/if}

    {#if !noSignIn}
        <hr />
        <p class=" mt-3">
            <strong>{__('signin / already-have-account')}</strong><br />
            <a
                href="#/signin"
                class="has-text-weight-bold"
                on:click|preventDefault={() => {
                    step = 'login';
                }}>{__('signin / signin-here')}</a
            >.
        </p>
    {/if}
</div>
