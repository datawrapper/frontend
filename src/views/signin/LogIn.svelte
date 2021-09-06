<script>
    import httpReq from '@datawrapper/shared/httpReq';
    import Notification from 'layout/partials/bulma/Notification.svelte';
    import LoadingSpinner from 'layout/partials/LoadingSpinner.svelte';
    import ProviderButtons from './ProviderButtons.svelte';
    import { isValidEmail } from './utils';

    export let __;
    export let step;
    export let target = '/';
    export let emailOpen;
    export let providers;
    export let noSignUp;

    export let email = '';
    let password = '';
    let rememberLogin = true;

    let loginSuccess;
    let loginError;
    let loggingIn = false;

    // otp stuff
    let needOTP = false;
    let loginOTP;

    let resetPassword = false;
    let requestingPassword = false;

    async function doLogIn() {
        loginError = loginSuccess = loginOTP = '';
        loggingIn = true;
        try {
            await httpReq.post('/v3/auth/login', {
                payload: {
                    email,
                    password,
                    keepSession: rememberLogin,
                    ...(loginOTP ? { otp: loginOTP } : {})
                }
            });
            needOTP = false;
            loginSuccess = __('signin / login-success');
            setTimeout(() => {
                window.window.location.href = target;
            }, 2000);
        } catch (error) {
            if (error.name === 'HttpReqError') {
                const body = await error.response.json();
                if (body.statusCode === 401 && body.message === 'Need OTP') {
                    needOTP = true;
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

    async function doResetPassword() {
        requestingPassword = true;
        loginError = loginSuccess = '';
        try {
            await httpReq.post('/v3/auth/reset-password', {
                payload: {
                    email
                }
            });
            loginSuccess = __('signin / password-reset / success');
        } catch (error) {
            if (error.name === 'HttpReqError') {
                const body = await error.response.json();
                const errMsgKey = `signin / password-reset / error / ${body.message}`;
                loginError = body.message
                    ? __(errMsgKey) !== errMsgKey
                        ? __(errMsgKey)
                        : body.message
                    : error.message;
            } else {
                loginError = error;
            }
        }
        requestingPassword = false;
    }
</script>

<div>
    <h2 class="title is-3">{@html __('login / login / headline')}</h2>
    <p>{@html __('login / login / intro')}</p>
    {#if emailOpen}
        {#if loginError || loginSuccess}
            <Notification type={loginError ? 'warning' : 'success'} deletable={false}>
                {@html loginError || loginSuccess}
            </Notification>
        {/if}
        <div class="signup-form">
            {#if !needOTP}
                <div class="field">
                    <label for="si-email" class="label">{__('email')}</label>
                    <input
                        id="si-email"
                        placeholder="name@domain.tld"
                        class="input"
                        class:is-danger={email && !isValidEmail(email)}
                        bind:value={email}
                        type="email"
                    />
                </div>
                {#if !resetPassword}
                    <div class="field">
                        <label for="si-pwd" class="label">{__('password')}</label>
                        <input id="si-pwd" bind:value={password} class="input" type="password" />
                    </div>
                    <div class="field">
                        <label class="checkbox"
                            ><input bind:checked={rememberLogin} type="checkbox" />
                            {@html __('Remember login?')}</label>
                    </div>
                {/if}
            {:else}
                <p>{__('signin / enter-otp')}</p>
                <div class="field">
                    <!-- svelte-ignore a11y-autofocus -->
                    <input
                        id="otp"
                        autocomplete="off"
                        data-lpignore="true"
                        autofocus
                        bind:value={loginOTP}
                        class="input"
                        type="password"
                    />
                </div>
            {/if}
            {#if !resetPassword}
                <button class="button is-primary mb-2" on:click={doLogIn}>
                    {#if loggingIn}<LoadingSpinner />{/if}
                    {@html __('Login')}</button
                >
                <div class="mt-3">
                    <a
                        on:click|preventDefault={() => (resetPassword = true)}
                        href="#/forgot-password">{@html __("Can't recall your password?")}</a
                    >
                </div>
                <div class="mt-5">
                    <a href="#/back" on:click|preventDefault={() => (emailOpen = false)}>
                        ←&nbsp;&nbsp;{__('signin / choose-different-provider')}</a
                    >
                </div>
            {:else}
                <button class="button is-primary mb-2" on:click={doResetPassword}>
                    {#if requestingPassword}<LoadingSpinner />{/if}
                    {@html __('Send new password')}
                </button>
                <div class="mt-3">
                    <a on:click|preventDefault={() => (resetPassword = false)} href="#/return"
                        >{@html __('Return to login...')}</a
                    >
                </div>
            {/if}
        </div>
    {:else}
        <ProviderButtons {__} {target} {providers} bind:emailOpen signIn={true} />
    {/if}

    {#if !noSignUp}
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
    {/if}
</div>
