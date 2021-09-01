<script>
    import SignInPageLayout from 'layout/SignInPageLayout.svelte';
    import SignUpForm from './SignUpForm.svelte';

    export let __;
    export let target;
    export let noSignIn;
    export let noSignUp;
    export let signupWithoutPassword = false;
</script>

<SignInPageLayout title="Welcome">
    <SignUpForm {__} {target} {noSignIn} {noSignUp} {signupWithoutPassword} />
</SignInPageLayout>
