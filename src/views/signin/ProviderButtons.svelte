<script>
    import SvgIcon from '../layout/partials/SvgIcon.svelte';

    export let emailOpen;
    export let providers;
    export let signIn = true;
    export let target;
    export let __;

    $: showTwoColumns = providers.length > 3;
</script>

<div class="signup-form">
    <button
        class="button provider-email mb-2 has-text-weight-normal is-fullwidth"
        on:click={() => (emailOpen = true)}
    >
        <SvgIcon icon="mail" size="28px" />
        {__(signIn ? 'signin / sign-in-using' : 'signin / sign-up-using')}
        {__('email')}</button
    >
</div>

<hr />
{#if showTwoColumns}
    <p>{__('signin / alternative-signin')}</p>
{/if}
<div class="signup-form" class:two-columns={showTwoColumns}>
    {#each providers as provider}
        <a
            href="{provider.url}{target ? `?ref=${target}` : ''}"
            class="button provider-{provider.label.toLowerCase()} mb-2 is-fullwidth">
            <SvgIcon icon={provider.icon} />
            {showTwoColumns ? '' : __(signIn ? 'signin / sign-in-using' : 'signin / sign-up-using')}
            {provider.label}</a>
    {/each}
</div>

<style lang="less">
    @google: #EA4335;
    @facebook: #1877F2;
    @twitter: #1D9BF0;
    @okta: #00297a;
    @onelogin: #1C1F2A;
    @microsoft: #0072c6;

    .button {
        text-align: left;
        justify-content: left;
        padding-left:3rem;
    }

    .signup-form {
        max-width: 300px;

        .button :global(.icon) {
            position: absolute;
            left: 0;
            top: 0;
            width: 2.4rem !important;
            height: 100% !important;
            border-top-left-radius: var(--radius);
            border-bottom-left-radius: var(--radius);
            background: fade(#333, 10%);
            color: var(--color-dw-black-bis);
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
        :global(.button.provider-microsoft .icon) {
            background: fade(@microsoft, 10%);
            color: @microsoft;
        }
    }

</style>
