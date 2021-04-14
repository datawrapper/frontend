<script>
    import MainLayout from 'layout/MainLayout.svelte';

    export let statusCode;
    export let error;
    export let message;

    export let __;
</script>

<MainLayout title="Error">
    <div class="container">
        <h1>Whoops, something unexpected happened!</h1>
        <h2>{error} [{statusCode}]</h2>
        <p>{__(message)}</p>
    </div>
</MainLayout>
