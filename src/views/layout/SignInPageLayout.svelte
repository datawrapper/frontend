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

<div class="container">
    <div class="columns is-vcentered ">
        <div class="column is-1" />
        <div class="column">
            <div class="columns is-gapless">
                <div class="column box left">
                    <DatawrapperLogo height="60" />

                    <div class="terms is-size-7">
                        {@html __('signin / terms')}
                    </div>
                </div>
                <div class="column is-8 box right">
                    <slot />
                </div>
            </div>
        </div>
        <div class="column is-1" />
    </div>
</div>

<style>
    :global(html) {
        background-color: #207693;
        background-image: url(/lib/static/img/signin-background.png);
    }
    .columns.is-vcentered {
        min-height: 100vh;
    }

    .terms {
        position: absolute;
        bottom: 0px;
        left: 0;
        padding: 50px 90px 50px 50px;
    }
    .box {
        box-shadow: none;
        border-radius: 0;
    }
    .box.left {
        padding: 50px !important;
        position: relative;
    }
    .box.right {
        background: var(--color-dw-background);
        padding: 50px 100px !important;
    }
    @media screen and (max-width: 600px) {
        .box.right {
            padding: 20px 20px 40px !important;
        }
        .box.left {
            padding: 20px !important;
        }
        .terms {
            position: static;
            padding: 20px 0 0;
        }
        .box.left > :global(svg) {
            height: 43px;
            width: 160px;
        }
    }
    @media screen and (min-height: 600px) and (min-width: 600px) {
        :global(html) {
            overflow-y: hidden;
        }
    }
</style>
