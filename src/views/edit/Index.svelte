<script type="text/javascript">
    import MainLayout from 'layout/MainLayout.svelte';
    import Breadcrumbs from 'layout/partials/bulma/Breadcrumbs.svelte';
    import VisArchive from '../layout/partials/header/VisArchive.svelte';
    import Describe from './Describe.svelte';
    import Publish from './Publish.svelte';
    import Step from './Step.svelte';
    import UploadData from './UploadData.svelte';
    import Visualize from './Visualize.svelte';

    export let initUrlStep;

    let steps = [
        {
            index: 1,
            id: 'upload',
            title: 'Upload data',
            ui: UploadData
        },
        {
            index: 2,
            id: 'describe',
            title: 'Check & describe',
            ui: Describe
        },
        {
            index: 3,
            id: 'visualize',
            title: 'Visualize',
            ui: Visualize
        },
        {
            index: 4,
            id: 'publish',
            title: 'Publish & export',
            ui: Publish
        }
    ];
    let activeStep = steps.find(s => s.id === initUrlStep) || steps[0];
    let lastActiveStep = 1;

    let bcPath = [
        {
            title: 'My Charts',
            url: '/mycharts',
            svgIcon: 'user'
        },
        {
            title: 'Some folder',
            url: '/mycharts/folder/12',
            svgIcon: 'folder'
        }
    ];

    function navigateTo(step, pushState = true) {
        activeStep = step;
        if (step.index > lastActiveStep) lastActiveStep = step.index;
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
    <div class="container block">
        <Breadcrumbs title="This chart is in" path={bcPath} />
        <div class="columns step-nav">
            {#each steps as step}
                <div class="column">
                    <Step
                        {step}
                        {lastActiveStep}
                        on:navigate={evt => navigateTo(evt.detail)}
                        active={step === activeStep}
                    />
                </div>
            {/each}
        </div>
    </div>
    <!-- step content -->
    <div class="block">
        {#if activeStep}
            <svelte:component this={activeStep.ui} />
        {/if}
    </div>
</MainLayout>

<style>
</style>
