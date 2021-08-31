<script>
    import { getContext } from 'svelte';
    import ProviderButtons from './ProviderButtons.svelte';
    import CheckPassword from './CheckPassword.svelte';
    import httpReq from '@datawrapper/shared/httpReq';
    import Notification from 'layout/partials/bulma/Notification.svelte';
    import { trackEvent } from '@datawrapper/shared/analytics';

    export let __;
    export let target = '/';

    let step = 'signup'; // can also be 'signin', 'password-reset', or 'otp'
    const providers = ['google', 'okta', 'onelogin', 'twitter', 'facebook', 'github'];

    // eslint-disable-next-line
    const emailRegex =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    function isValidEmail(s) {
        return emailRegex.test(s);
    }

    let emailOpen = false;
    let passwordClear = false;

    let suEmail = '';
    let siPassword = '';
    let rememberLogin = true;
    let suPassword = '';
    let suPasswordOk;
    let passwordHelp;
    let passwordSuccess;
    let passwordError;

    let loginOTP;
    let loginSuccess;
    let loginError;
    let loggingIn = false;

    async function doSignIn() {
        loginError = loginSuccess = loginOTP = '';
        loggingIn = true;
        try {
            await httpReq.post('/v3/auth/login', {
                payload: {
                    email: suEmail,
                    password: siPassword,
                    keepSession: rememberLogin,
                    ...(loginOTP ? { otp: loginOTP } : {})
                }
            });
            step = 'signin';
            loginSuccess = 'Login successful, reloading page';
            setTimeout(() => {
                window.window.location.href = target;
            }, 2000);
        } catch (error) {
            if (error.name === 'HttpReqError') {
                const body = await error.response.json();
                if (body.statusCode === 401 && body.message === 'Need OTP') {
                    step = 'otp';
                    loginOTP = '';
                    loggingIn = false;
                    return;
                }
                loginError = body ? body.message : error.message;
            } else {
                loginError = error;
            }
        }
        loggingIn = false;
    }
</script>

<div class="content" data-piwik-mask>
    {#if step === 'signup'}
        <div>
            <h2 class="title is-3">{@html __('login / signup / headline')}</h2>
            <p>{@html __('login / signup / intro')}</p>

            {#if emailOpen}
                <div class="signup-form">
                    <div class="field">
                        <label for="su-email" class="label">{__('email')}</label>
                        <input
                            id="su-email"
                            placeholder="name@domain.tld"
                            class="input"
                            class:is-danger={suEmail && !isValidEmail(suEmail)}
                            bind:value={suEmail}
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
                                bind:value={suPassword}
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
                                bind:value={suPassword}
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
                        bind:password={suPassword}
                        bind:passwordHelp
                        bind:passwordSuccess
                        bind:passwordError
                        bind:passwordOk={suPasswordOk}
                    />
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
                            ←&nbsp;&nbsp;{__('signin / choose-different-provider')}</a
                        >
                    </div>
                </div>
            {:else}
                <ProviderButtons {__} {providers} bind:emailOpen signIn={false} />
            {/if}

            <hr />
            <p class=" mt-3">
                <strong>{__('signin / already-have-account')}</strong><br />
                <a
                    href="#/signin"
                    class="has-text-weight-bold"
                    on:click|preventDefault={() => {
                        step = 'signin';
                    }}>{__('signin / signin-here')}</a
                >.
            </p>
        </div>
    {:else if step === 'signin'}
        <div>
            <h2 class="title is-3">{@html __('login / login / headline')}</h2>
            <p>{@html __('login / login / intro')}</p>
            {#if emailOpen}
                <div class="signup-form">
                    {#if loginError || loginSuccess}
                        <Notification type={loginError ? 'danger' : 'success'} closeable={false}>
                            {@html loginError || loginSuccess}
                        </Notification>
                    {/if}
                    <div class="field">
                        <label for="si-email" class="label">{__('email')}</label>
                        <input
                            id="si-email"
                            placeholder="name@domain.tld"
                            class="input"
                            class:is-danger={suEmail && !isValidEmail(suEmail)}
                            bind:value={suEmail}
                            type="email"
                        />
                    </div>
                    <div class="field">
                        <label for="si-pwd" class="label">{__('password')}</label>
                        <input id="si-pwd" bind:value={siPassword} class="input" type="password" />
                    </div>
                    <div class="field">
                        <label class="checkbox"
                            ><input bind:checked={rememberLogin} type="checkbox" />
                            {@html __('Remember login?')}</label
                        >
                    </div>
                    <button class="button is-primary mb-2" on:click={doSignIn}>
                        {@html __('Login')}</button
                    >
                    <div class="mt-5">
                        <a href="#/back" on:click|preventDefault={() => (emailOpen = false)}>
                            ←&nbsp;&nbsp;{__('signin / choose-different-provider')}</a
                        >
                    </div>
                </div>
            {:else}
                <ProviderButtons {__} {providers} bind:emailOpen signIn={true} />
            {/if}

            <hr />
            <p class="mt-3">
                <strong>{__('signin / no-account-yet')}</strong><br />
                <a
                    href="#/signin"
                    class="has-text-weight-bold"
                    on:click|preventDefault={() => {
                        step = 'signup';
                    }}>{__('signup / create-account')}</a
                >. {__('signin / its-free')}
            </p>
        </div>
    {:else if step === 'otp'}
        <p />
        <p>{__('signin / enter-otp')}</p>
    {/if}
</div>

<style>
    .signup-form {
        max-width: 300px;
    }
</style>
