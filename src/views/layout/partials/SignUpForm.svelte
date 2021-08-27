<script>
    import { getContext } from 'svelte';
    const messages = getContext('messages');
    let __;
    $: {
        __ = (key, scope = 'core') => messages.translate(key, scope, $messages);
    }

    let step = 'signup'; // can also be 'signin', 'password-reset', or 'otp'
    const providers = ['facebook', 'google', 'github'];

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
                <div class="field">
                    <label for="su-email" class="label">Email</label>
                    <input id="su-email" placeholder="name@domain.tld" class="input" type="email" />
                </div>
                <div class="field">
                    <label for="su-pwd" class="label">Password</label>
                    <input id="su-pwd" class="input" type={passwordClear ? 'text' : 'password'} />
                </div>
                <div class="field">
                    <label class="checkbox"
                        ><input bind:checked={passwordClear} type="checkbox" />
                        {@html __('account / invite / password-clear-text')}</label
                    >
                </div>

                <button
                    class="button is-primary is-fullwidth mb-2"
                    on:click={() => (emailOpen = true)}
                >
                    <span class="icon mr-1">
                        <i class="fa fa-pencil" />
                    </span>
                    {@html __('Sign Up')}</button
                >
                <button class="button is-fullwidth mb-2" on:click={() => (emailOpen = false)}>
                    Use different provider</button
                >
            {:else}
                <button class="button is-fullwidth mb-2" on:click={() => (emailOpen = true)}>
                    <span class="icon mr-1">
                        <i class="fa fa-email" />
                    </span>
                    Sign up using email</button
                >
                <p class="has-text-grey has-text-centered">⁓⁓⁓ or ⁓⁓⁓</p>
                {#each providers as provider}
                    <a href="/signin/{provider}" class="button is-fullwidth mb-2">
                        <span class="icon mr-1">
                            <i class="fa fa-{provider}" />
                        </span>
                        Sign in using {capitalize(provider)}</a
                    >
                {/each}
            {/if}
            <hr class="mt-4 mb-2" />
            <p class="has-text-grey mt-3">
                Already have an account? <a
                    href="#/signin"
                    on:click|preventDefault={() => {
                        step = 'signin';
                        emailOpen = false;
                    }}>Click here to sign in</a
                >
            </p>
        </div>
    {:else if step === 'signin'}
        <div>
            <h2 class="title is-3">{@html __('login / login / headline')}</h2>
            <p>{@html __('login / login / intro')}</p>
            {#if emailOpen}
                <div class="field">
                    <label for="si-email" class="label">Email</label>
                    <input id="si-email" placeholder="name@domain.tld" class="input" type="email" />
                </div>
                <div class="field">
                    <label for="si-pwd" class="label">Password</label>
                    <input id="si-pwd" class="input" type="password" />
                </div>
                <button
                    class="button is-primary is-fullwidth mb-2"
                    on:click={() => (emailOpen = true)}
                >
                    <span class="icon mr-1">
                        <i class="fa fa-sign-in" />
                    </span>
                    {@html __('Login')}</button
                >
                <button class="button is-fullwidth mb-2" on:click={() => (emailOpen = false)}>
                    Log in using different provider</button
                >
            {:else}
                <button class="button is-fullwidth mb-2" on:click={() => (emailOpen = true)}>
                    <span class="icon mr-1">
                        <i class="fa fa-email" />
                    </span>
                    Log in using email</button
                >
                <p class="has-text-grey has-text-centered">⁓⁓⁓ or ⁓⁓⁓</p>
                {#each providers as provider}
                    <a href="/signin/{provider}" class="button is-fullwidth mb-2">
                        <span class="icon mr-1">
                            <i class="fa fa-{provider}" />
                        </span>
                        Sign in using {capitalize(provider)}</a
                    >
                {/each}
            {/if}

            <hr class="mt-4 mb-2" />
            <p class="has-text-grey mt-3">
                Don't have an account, yet? <a
                    href="#/signin"
                    on:click|preventDefault={() => {
                        step = 'signup';
                        emailOpen = false;
                    }}>Click here to create one (for free)</a
                >
            </p>
        </div>
    {:else if step === 'otp'}
        <p>Please enter your one time password token:</p>
    {/if}
</div>
