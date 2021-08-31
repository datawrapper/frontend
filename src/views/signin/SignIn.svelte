<script>
    import SignUpForm from './SignUpForm.svelte';
    import DatawrapperLogo from 'layout/partials/header/DatawrapperLogo.svelte';

    export let __;
    export let target;
</script>

<div class="container">
    <div class="columns is-vcentered ">
        <div class="column is-1" />
        <div class="column">
            <div class="columns is-gapless">
                <div class="column box left">
                    <DatawrapperLogo height="60" />

                    <div class="terms is-size-7">
                        By using Datawrapper you agree to our <a
                            href="https://www.datawrapper.de/terms">Terms of Use</a
                        >.
                    </div>
                </div>
                <div class="column is-8 box right">
                    <div class="signup-form">
                        <SignUpForm {__} {target} />
                    </div>
                </div>
            </div>
        </div>
        <div class="column is-1" />
    </div>
</div>

<style>
    :global(html) {
        background-color: #207693;
        background-image: url(https://www.datawrapper.de/wp-content/uploads/2021/08/dw-hero-website-home_big.png);
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
    .box.left {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        padding: 50px !important;
        position: relative;
    }
    .box.right {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        background: var(--color-dw-background);
        padding: 50px 100px !important;
    }
    .signup-form {
        transition: height 1s ease-in-out;
    }

    @media screen and (min-height: 600px) and (min-width: 600px) {
        :global(html) {
            overflow-y: hidden;
        }
    }

    @media (max-width: 600px) {
        .signup-form {
            margin-right: 0;
            margin-left: 10px;
        }
    }
</style>
