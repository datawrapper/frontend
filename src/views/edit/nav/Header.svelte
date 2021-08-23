<script>
    import { createEventDispatcher, getContext } from 'svelte';
    import Breadcrumbs from 'layout/partials/bulma/Breadcrumbs.svelte';
    import SvgIcon from 'layout/partials/SvgIcon.svelte';
    import Step from './Step.svelte';

    import { hasUnsavedChanges } from '../stores';

    const config = getContext('config');
    $: stickyHeaderThreshold = $config.stickyHeaderThreshold;

    const dispatch = createEventDispatcher();

    export let bcPath;
    export let steps;
    export let activeStep;
    export let lastActiveStep;

    let innerHeight = 0;
</script>

<svelte:window bind:innerHeight />

<div class="container block" class:is-sticky={innerHeight > stickyHeaderThreshold}>
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

    <div class="editor-step-nav">
        <div class="columns step-nav">
            {#each steps as step}
                <div class="column">
                    <Step
                        {step}
                        {lastActiveStep}
                        on:navigate={evt => dispatch('navigate', evt.detail)}
                        active={step === activeStep}
                    />
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .breadcrumbs-pre {
        color: var(--color-dw-gray-60);
    }
    .is-sticky {
        position: sticky;
        top: 40px;
        z-index: 900;
        background: var(--color-dw-background);
    }
</style>
