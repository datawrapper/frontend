<script>
    import httpReq from '@datawrapper/shared/httpReq';
    import Notification from 'layout/partials/bulma/Notification.svelte';
    import ProviderButtons from './ProviderButtons.svelte';
    import { isValidEmail } from './utils';

    export let __;
    export let step;
    export let target = '/';
    export let emailOpen;
    export let providers;
    export let noSignUp;

    let email = '';
    let password = '';
    let rememberLogin = true;

    let loginSuccess;
    let loginError;
    let loggingIn = false;

    // otp stuff
    let needOTP = false;
    let loginOTP;

    async function doSignIn() {
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
            step = 'signin';
            // @todo: translate
            loginSuccess = 'Login successful, reloading page';
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
</script>

<div>
    <h2 class="title is-3">{@html __('login / login / headline')}</h2>
    <p>{@html __('login / login / intro')}</p>
    {#if emailOpen}
        <div class="signup-form">
            {#if loginError || loginSuccess}
                <Notification type={loginError ? 'danger' : 'success'} deletable={false}>
                    {@html loginError || loginSuccess}
                </Notification>
            {/if}
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
                <div class="field">
                    <label for="si-pwd" class="label">{__('password')}</label>
                    <input id="si-pwd" bind:value={password} class="input" type="password" />
                </div>
                <div class="field">
                    <label class="checkbox"
                        ><input bind:checked={rememberLogin} type="checkbox" />
                        {@html __('Remember login?')}</label
                    >
                </div>
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
            <button class="button is-primary mb-2" on:click={doSignIn}> {@html __('Login')}</button>
            <div class="mt-5">
                <a href="#/back" on:click|preventDefault={() => (emailOpen = false)}>
                    ←&nbsp;&nbsp;{__('signin / choose-different-provider')}</a
                >
            </div>
        </div>
    {:else}
        <ProviderButtons {__} {providers} bind:emailOpen signIn={true} />
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
