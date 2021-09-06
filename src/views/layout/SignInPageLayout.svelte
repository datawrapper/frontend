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
    <div class="hero-body">
        <div class="container is-max-desktop box p-0 is-radiusless">
            <div class="columns is-gapless">
                <div class="column is-one-third is-flex is-flex-direction-column">
                    <div
                        class="p-6 is-flex is-flex-direction-column is-justify-content-space-between is-flex-grow-1">
                        <DatawrapperLogo height="60" />
                        <div class="terms is-size-7 is-hidden-mobile">
                            {@html __('signin / terms')}
                        </div>
                    </div>
                </div>
                <div class="column has-background-light is-flex is-flex-direction-column">
                    <div
                        class="p-6 is-flex is-flex-direction-column is-justify-content-space-between is-flex-grow-1"
                    >
                        <slot />
                        <div class="terms is-size-7 is-hidden-tablet">
                            {@html __('signin / terms')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<style lang="scss">
    @import 'bulma/sass/utilities/_all.sass';
    :global(html) {
        background-color: var(--color-dw-scooter);
        background-image: url(/lib/static/img/dw-hero-16-9-bg.jpg);
    }

    @include desktop {
        .hero-body {
            .container {
                background: red;
            }
        }
    }
    @media screen and (min-height: 600px) and (min-width: 600px) {
        :global(html) {
            overflow-y: hidden;
        }
    }
</style>
