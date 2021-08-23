<script type="text/javascript">
    import MainLayout from 'layout/MainLayout.svelte';
    import Breadcrumbs from 'layout/partials/bulma/Breadcrumbs.svelte';
    import SvgIcon from 'layout/partials/SvgIcon.svelte';
    import { onMount } from 'svelte';

    import VisArchive from '../layout/partials/header/VisArchive.svelte';
    import Describe from './Describe.svelte';
    import Publish from './Publish.svelte';
    import Step from './nav/Step.svelte';
    import UploadData from './UploadData.svelte';
    import Visualize from './Visualize.svelte';

    import {
        data,
        chart,
        unsavedChanges,
        hasUnsavedChanges,
        initChartStore,
        initDataStore
    } from './stores';

    export let rawData; // the csv dataset
    export let rawChart; // the JSON chart object
    export let visualizations;
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
    <!-- step nav -->
    <div class="container block">
        <div class="columns is-2 is-variable">
            <div class="column is-narrow pr-0 breadcrumbs-pre">This chart is in</div>
            <div class="column pl-0">
                <Breadcrumbs path={bcPath} />
            </div>
            <div class="column is-narrow is-size-7 has-text-grey-light">
                {#if $hasUnsavedChanges}
                    <em
                        ><SvgIcon
                            valign="sub"
                            icon="loading-spinner"
                            timing="steps(12)"
                            duration="1s"
                            color="var(--color-dw-gray-30)"
                            className="ml-2 mr-0"
                            size="1.1rem"
                            spin
                        /> storing changes...</em
                    >
                {/if}
            </div>
        </div>

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
            <svelte:component this={activeStep.ui} {chart} {visualizations} {data} />
        {/if}
    </div>
</MainLayout>

<style>
    .breadcrumbs-pre {
        color: var(--color-dw-gray-60);
    }
</style>
