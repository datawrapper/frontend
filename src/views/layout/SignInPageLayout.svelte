<script>
    import DatawrapperLogo from 'layout/partials/header/DatawrapperLogo.svelte';
    export let title;

    import { getContext } from 'svelte';
    const msg = getContext('messages');

    let __;
    $: {
        __ = (key, scope = 'core') => msg.translate(key, scope, $msg);
    }
</script>

<svelte:head>
    <title>Datawrapper{title ? ` - ${title}` : ''}</title>
</svelte:head>

<section class="hero is-fullheight">
    <div class="hero-body is-justify-content-center">
        <div class="box columns is-radiusless p-0">
            <div
                class="column p-6 is-flex is-flex-direction-column is-justify-content-space-between"
            >
                <DatawrapperLogo height="60" />
                <div class="terms is-size-7">
                    {@html __('signin / terms')}
                </div>
            </div>
            <div class="column is-8 p-6 has-background-light">
                <slot />
            </div>
        </div>
    </div>
</section>

<style>
    :global(html) {
        background-color: #207693;
        background-image: url(/lib/static/img/signin-background.png);
    }
    @media screen and (min-height: 600px) and (min-width: 600px) {
        :global(html) {
            overflow-y: hidden;
        }
    }
</style>
