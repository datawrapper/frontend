<script type="text/javascript">
    import MainLayout from 'layout/MainLayout.svelte';
    import Step from './Step.svelte';

    export let initUrlStep;

    let steps = [
        {
            index: 1,
            id: 'upload',
            title: 'Upload data'
        },
        {
            index: 2,
            id: 'describe',
            title: 'Check & describe'
        },
        {
            index: 3,
            id: 'visualize',
            title: 'Visualize'
        },
        {
            index: 4,
            id: 'publish',
            title: 'Publish & export'
        }
    ];
    let activeStep = steps.find(s => s.id === initUrlStep) || steps[0];

    function navigateTo(step, pushState = true) {
        activeStep = step;
        if (pushState) window.history.pushState(step, '', step.id);
    }

    function onPopState(event) {
        navigateTo(
            steps.find(s => s.id === event.state.id),
            false
        );
    }
</script>

<svelte:window on:popstate={onPopState} />

<MainLayout>
    <!-- step nav -->
    <div class="container">
        <div class="columns step-nav">
            {#each steps as step}
                <div class="column">
                    <Step
                        {step}
                        on:navigate={evt => navigateTo(evt.detail)}
                        active={step === activeStep}
                    />
                </div>
            {/each}
        </div>
    </div>
</MainLayout>

<style>
</style>
