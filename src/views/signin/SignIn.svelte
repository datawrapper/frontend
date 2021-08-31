<script>
    import SignInPageLayout from 'layout/SignInPageLayout.svelte';
    import SignUpForm from './SignUpForm.svelte';

    export let __;
    export let target;
</script>

<SignInPageLayout>
    <SignUpForm {__} {target} />
</SignInPageLayout>
