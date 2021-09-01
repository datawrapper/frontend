<script>
    import { getContext } from 'svelte';
    import LogIn from './LogIn.svelte';
    import SignUp from './SignUp.svelte';

    export let __;
    export let target = '/';
    export let noSignUp = false;
    export let noSignIn = false;
    export let signupWithoutPassword = false;

    const providers = ['google', 'okta', 'onelogin', 'twitter', 'facebook', 'github'];

    let step = noSignIn ? 'signup' : 'login'; // can also be 'login'

    let email = '';
    let emailOpen = false;
</script>

<div class="content" data-piwik-mask>
    {#if step === 'signup' && !noSignUp}
        <SignUp
            {__}
            {providers}
            {target}
            {noSignIn}
            {signupWithoutPassword}
            bind:emailOpen
            bind:email
            bind:step
        />
    {:else if step === 'login' && !noSignIn}
        <LogIn {__} {providers} {target} {noSignUp} bind:emailOpen bind:email bind:step />
    {/if}
</div>

<style>
    .content :global(.signup-form) {
        max-width: 300px;
    }
</style>
