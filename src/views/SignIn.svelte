<script>
    import SignUpForm from 'layout/partials/SignUpForm.svelte';
    import DatawrapperLogo from './layout/partials/header/DatawrapperLogo.svelte';

    export let __;
    export let target;
</script>

<div class="container">
    <div class="columns is-vcentered">
        <div class="column">
            <section class="hero">
                <div class="hero-body">
                    <DatawrapperLogo color="white" />
                    <p class="title mt-4">Enrich your stories with charts, maps, and tables.</p>
                    <p class="subtitle is-3">
                        Sign up is free! <a target="_blank" href="https://www.datawrapper.de"
                            >Learn more about Datawrapper</a
                        >
                    </p>
                </div>
            </section>
        </div>
        <div class="column is-narrow">
            <div class="signup-form">
                <SignUpForm {__} {target} />
            </div>
        </div>
    </div>
</div>

<style>
    :global(html) {
        background-color: #207693;
        background-image: url(https://www.datawrapper.de/wp-content/uploads/2021/08/dw-hero-website-home_big.png);
    }

    .columns {
        max-width: 100%;
        min-height: 100vh;
    }

    .title {
        font-family: Bitter;
        color: #fff;
        text-shadow: 0 0 1px rgba(0, 0, 0, 0.25);
        font-weight: 700;
        font-size: 52px;
        line-height: 115%;
    }
    .subtitle {
        color: #fff;
    }

    .hero a {
        color: #fff;
        text-decoration: underline;
    }

    .signup-form {
        background: white;
        border-radius: 4px;
        width: 100%;
        max-width: 26rem;
        padding: 30px;
        margin-right: 2rem;
        transition: height 1s ease-in-out;
    }

    @media screen and (min-height: 600px) and (min-width: 600px) {
        :global(html) {
            overflow-y: hidden;
        }
    }

    @media screen and (max-width: 1100px) {
        .title {
            font-size: 40px;
        }
    }

    @media (max-width: 600px) {
        .signup-form {
            margin-right: 0;
            margin-left: 10px;
        }
    }
</style>
