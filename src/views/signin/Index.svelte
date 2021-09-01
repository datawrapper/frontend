<script>
    import SignInPageLayout from 'layout/SignInPageLayout.svelte';
    import SignUpForm from './SignUpForm.svelte';

    export let __;
    export let target;
    export let noSignin;
</script>

<SignInPageLayout title="Welcome">
    <SignUpForm {__} {target} {noSignin} />
</SignInPageLayout>
