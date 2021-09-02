<script type="text/javascript">
    import { onMount } from 'svelte';

    import MainLayout from 'layout/MainLayout.svelte';
    import Header from './nav/Header.svelte';
    import Describe from './Describe.svelte';
    import Publish from './Publish.svelte';
    import Upload from './Upload.svelte';
    import Visualize from './Visualize.svelte';

    import { data, chart, unsavedChanges, initChartStore, initDataStore } from './stores';

    export let rawData; // the csv dataset
    export let rawChart; // the JSON chart object
    export let visualizations;
    export let initUrlStep;

    let steps = [
        {
            index: 1,
            id: 'upload',
            title: 'Upload data',
            ui: Upload
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
    $: lastActiveStep = $chart.last_edit_step || 1;
    let activeStep = steps.find(s => s.id === initUrlStep) || steps[0];

    onMount(() => {
        initChartStore(rawChart);
        initDataStore(rawChart.id, rawData);

        if (!initUrlStep && rawChart.last_edit_step) {
            activeStep =
                steps[Math.max(1, Math.min(steps.length - 1, rawChart.last_edit_step - 1))];
        }
        navigateTo(activeStep, initUrlStep !== activeStep.id);
    });

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
        if (lastActiveStep && step.index > lastActiveStep) {
            $chart.last_edit_step = step.index;
        }
        if (pushState)
            window.history.pushState({ id: step.id }, '', `/v2/edit/${$chart.id}/${step.id}`);
    }

    function onPopState(event) {
        navigateTo(
            steps.find(s => s.id === event.state.id),
            false
        );
    }

    function onBeforeUnload(event) {
        if (Object.keys(unsavedChanges).length) {
            event.preventDefault();
            return (event.returnValue =
                'There are unsaved changes. Do you really want to leave this page.');
        }
    }
</script>

<svelte:window
    on:popstate={onPopState}
    on:beforeunload={onBeforeUnload}
    on:pagehide={onBeforeUnload}
    on:unload={onBeforeUnload}
/>

<MainLayout title="{$chart.title} - [{$chart.id}] - {activeStep.title}">
    <section class="section">
        <!-- step nav -->
        <Header
            {steps}
            {bcPath}
            bind:activeStep
            bind:lastActiveStep
            on:navigate={evt => navigateTo(evt.detail)}
        />
        <!-- step content -->
        <div class="block">
            {#if activeStep}
                <svelte:component this={activeStep.ui} {chart} {visualizations} {data} />
            {/if}
        </div>
    </section>
</MainLayout>
