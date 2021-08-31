<script>
    export let emailOpen;
    export let providers;
    export let signIn = true;

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
        <span class="icon mr-1">
            <i class="fa fa-envelope" />
        </span>
        Sign {signIn ? 'in' : 'up'} using Email</button
    >
</div>

<hr />

<div class="signup-form" class:two-columns={showAllProvider}>
    {#each visibleProviders as provider}
        <a href="/signin/{provider}" class="button provider-{provider} is-fullwidth mb-2">
            <span class="icon mr-1">
                <i class="fa fa-{provider}" />
            </span>
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

    .button.is-fullwidth {
        text-align: left;
        justify-content: left;
        padding-left: 65px;
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

    .signup-form.two-columns {
        columns: 2;
        max-width: 400px;
    }
</style>
