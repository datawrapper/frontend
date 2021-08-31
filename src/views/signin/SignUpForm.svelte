<script>
    import { getContext } from 'svelte';
    import LogIn from './LogIn.svelte';
    import SignUp from './SignUp.svelte';

    export let __;
    export let target = '/';

    const providers = ['google', 'okta', 'onelogin', 'twitter', 'facebook', 'github'];

    let step = 'signin'; // can also be 'signin', 'password-reset', or 'otp'

    // eslint-disable-next-line
    const emailRegex =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    function isValidEmail(s) {
        return emailRegex.test(s);
    }

    let email = '';
    let emailOpen = false;

    let loginOTP;
</script>

<div class="content" data-piwik-mask>
    {#if step === 'signup'}
        <SignUp {__} {providers} {target} bind:emailOpen bind:email bind:step />
    {:else if step === 'signin'}
        <LogIn {__} {providers} {target} bind:emailOpen bind:email bind:step />
    {:else if step === 'otp'}
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
</div>

<style>
    .content :global(.signup-form) {
        max-width: 300px;
    }
</style>
