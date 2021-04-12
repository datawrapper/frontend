<script>
    export let dataset = '';
    export let chartData = {};

    import { onMount } from 'svelte';

    import get from '@datawrapper/shared/get';
    import dayjs from 'dayjs';
    import httpReq from '@datawrapper/shared/httpReq';
    import { autoTickFormatDate } from '@datawrapper/shared/autoTickFormat';
    import delimited from '@datawrapper/chart-core/lib/dw/dataset/delimited';
    import SignInPageLayout from './layout/SignInPageLayout.svelte';

    let loggedIn = false;
    let ds;

    $: columns = ds
        ? ds.columns().map(col => {
              let range = col.range();
              if (col.type() === 'date') {
                  const fmt = autoTickFormatDate(range).split('|')[0];
                  range = range.map(d => dayjs(d).format(fmt));
              }
              if (col.type() === 'text') {
                  // use first and last value
                  const values = col.values().sort();
                  range = [values[0], values[values.length - 1]];
              }

              return {
                  name: col.title(),
                  type: col.type(),
                  range
              };
          })
        : null;

    onMount(async () => {
        httpReq.get('/v3/me').then(res => {
            loggedIn = res.role !== 'guest';
        });

        ds = await delimited({ csv: dataset }).dataset();
    });

    function openInDatawrapper() {
        httpReq
            .post('/v3/charts', {
                payload: chartData
            })
            .then(res => {
                // upload data
                httpReq
                    .put(`/v3/charts/${res.id}/data`, {
                        headers: {
                            'Content-Type': 'text/csv'
                        },
                        body: dataset
                    })
                    .then(res2 => {
                        setTimeout(() => {
                            // redirect to chart
                            window.location.href =
                                res.type === 'locator-maps'
                                    ? `/edit/${res.id}`
                                    : `/chart/${res.id}/edit`;
                        }, 400);
                    });
            });
    }

    function dontOpen() {
        window.close();
    }

    const fields = [
        {
            key: 'title',
            label: 'Title'
        },
        {
            key: 'metadata.describe.intro',
            label: 'Description'
        },
        {
            key: 'metadata.annotate.notes',
            label: 'Notes'
        },
        {
            key: 'metadata.describe.byline',
            label: 'Byline'
        },
        {
            key: 'metadata.describe.source-name',
            label: 'Source'
        },
        {
            key: 'metadata.describe.source-url',
            label: 'Source URL'
        }
    ];

    const noFormat = s => s;
</script>

<SignInPageLayout title="Edit Visualization in Datawrapper">
    <h1>Create a new Datawrapper visualization</h1>

    <p>Please confirm that you want to create a new visualization based on the provided template</p>

    <table>
        {#each fields as field}
            {#if get(chartData, field.key)}
                <tr
                    ><th>{field.label}</th><td
                        >{(field.format || noFormat)(get(chartData, field.key))}</td
                    ></tr
                >
            {/if}
        {/each}
        <tr
            ><th>Dataset columns</th><td>
                {#if ds}
                    {#each columns as col}
                        <div class="column t-{col.type}">
                            <div class="title">{col.name}</div>
                            <div class="type">{col.type}</div>
                            <div class="range">{col.range.join(' - ')}</div>
                        </div>
                    {/each}
                {/if}
            </td></tr
        >
    </table>

    {#if !loggedIn}
        <p>
            Datawrapper is a tool that lets you create and publish charts, maps & tables for free.
            If you don't have an account yet, you can try out our tool and sign up later.
        </p>
    {:else}
        <p>Do you really want to create the visualization and add it to your account?</p>
    {/if}

    <button class="btn btn-primary" on:click={openInDatawrapper}
        >Yes, create new visualization</button
    >
    <button class="btn" on:click={dontOpen}>No</button>
</SignInPageLayout>

<style>
    h1 {
        font-weight: 400;
        line-height: 1.25;
        margin-top: 0;
    }
    p {
        font-size: 18px;
        line-height: 1.25;
    }
    th,
    td {
        padding: 5px 10px 5px 0;
    }
    .column {
        display: inline-block;
        padding: 3px 10px;
        margin: 0 6px 0 0;
        border: 1px solid #ddd;
        border-radius: 4px;
    }
    .column .title {
        color: #222;
    }
    .column .type {
        font-size: 11px;
        text-transform: uppercase;
        color: #777;
    }
    .column .range {
        color: #999;
        font-style: italic;
    }
    .btn {
        display: inline-block;
        background: #cccccc;
        font-size: 17px;
        padding: 14px 18px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 8px;
        border-radius: 6px;
        border: 0;
        line-height: 1;
        margin-right: 10px;
        cursor: pointer;
    }
    img {
        max-width: 100%;
    }
    .btn-primary {
        color: #fff;
        background: #18a1cd;
    }
    pre {
        background: #eee;
        margin-top: 0;
        padding: 10px;
        max-height: 200px;
        overflow-y: scroll;
    }
    table {
        width: 100%;
    }
    th {
        text-align: left;
        vertical-align: top;
    }
</style>
