<script>
    import SvgIcon from '../layout/partials/SvgIcon.svelte';

    export let emailOpen;
    export let providers;
    export let signIn = true;
    export let __;

    let showAllProvider = true;
    $: visibleProviders = showAllProvider ? providers : providers.slice(0, 3);

    function capitalize(s) {
        return s
            .trim()
            .toLowerCase()
            .replace(/\w\S*/g, w => w.replace(/^\w/, c => c.toUpperCase()));
    }
</script>

<div class="signup-form">
    <button
        class="button provider-email is-fullwidth mb-2 has-text-weight-normal"
        on:click={() => (emailOpen = true)}
    >
        <SvgIcon icon="mail" size="28px" />
        {__(signIn ? 'signin / sign-in-using' : 'signin / sign-up-using')}
        {__('email')}</button
    >
</div>

<hr />

<p>Alternatively, sign in with</p>
<div class="signup-form" class:two-columns={showAllProvider}>
    {#each visibleProviders as provider}
        <a href="/signin/{provider}" class="button provider-{provider} is-fullwidth mb-2">
            <SvgIcon icon={provider} size="28px" />
            {showAllProvider ? '' : `Sign ${signIn ? 'in' : 'up'} using`}
            {capitalize(provider)}</a
        >
    {/each}
    {#if providers.length > visibleProviders.length}
        <a href="#/show-all" on:click|preventDefault={() => (showAllProvider = true)}
            >Show all login options</a
        >
    {/if}
</div>

<style lang="less">
    @google: #EA4335;
    @facebook: #1877F2;
    @twitter: #1D9BF0;
    @okta: #00297a;
    @onelogin: #1C1F2A;

    .button.is-fullwidth {
        text-align: left;
        justify-content: left;
        padding-left: 65px;
    }

    .signup-form {
        max-width: 300px;

        .button :global(.icon) {
            position: absolute;
            left: 0;
            top: 0;
            width: 50px !important;
            height: 100% !important;
            border-top-left-radius: 4px;
            border-bottom-left-radius: 4px;
            background: fade(#333333, 10%);
            color: #333333;
            font-size: 24px;
            margin-left: 0;
        }

        :global(.button.provider-facebook .icon) {
            background: fade(@facebook, 10%);
            color: @facebook;
        }
        :global(.button.provider-okta .icon) {
            background: fade(@okta, 10%);
            color: @okta;
        }
        :global(.button.provider-onelogin .icon) {
            background: fade(@onelogin, 10%);
            color: @onelogin;
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

    .signup-form.two-columns {
        columns: 2;
        max-width: 400px;
    }
</style>
