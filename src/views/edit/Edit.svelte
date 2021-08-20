<script type="text/javascript">
    import MainLayout from 'layout/MainLayout.svelte';
    import Step from './Step.svelte';

    let steps = [1, 2, 3, 4];
</script>

<MainLayout>
    <!-- step nav -->
    <div class="container">
        <div class="columns step-nav">
            {#each steps as step}
                <div class="column">
                    <Step>{step}</Step>
                </div>
            {/each}
        </div>
    </div>
</MainLayout>

<style>
</style>
