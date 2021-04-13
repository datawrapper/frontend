<script>
    export let dataset = '';
    export let chartData = {};

    import { onMount, getContext, setContext } from 'svelte';

    // dynamic language
    const msg = getContext('messages');
    export let __;

    import get from '@datawrapper/shared/get';
    import dayjs from 'dayjs';
    import httpReq from '@datawrapper/shared/httpReq';
    import { autoTickFormatDate } from '@datawrapper/shared/autoTickFormat';
    import delimited from '@datawrapper/chart-core/lib/dw/dataset/delimited';
    import SignInPageLayout from './layout/SignInPageLayout.svelte';

    let loggedIn = false;
    let ds;
    let showData = false;

    $: columns = ds
        ? ds
              .columns()
              .slice(0, 10)
              .map(col => {
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
            if (res.language !== 'en-US') {
                // request language
                httpReq
                    .get('/v2/stores/messages.json', { baseUrl: `//${window.location.host}` })
                    .then(res => {
                        msg.set(res);
                    });
            }
        });

        httpReq.get(`/v3/visualizations/${chartData.type || 'd3-lines'}`).then(res => {
            chartData.niceType = `<img style="vertical-align:middle;height:20px" alt="" src="/static/plugins/${
                res.__plugin
            }/${res.id}.svg" /> ${res.__title || ''}`;
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

    $: fields = [
        {
            key: 'niceType',
            label: __('create / field / type'),
            html: true
        },
        {
            key: 'title',
            label: __('Title')
        },
        {
            key: 'metadata.describe.intro',
            label: __('Description')
        },
        {
            key: 'metadata.annotate.notes',
            label: __('Notes')
        },
        {
            key: 'metadata.describe.byline',
            label: __('visualize / annotate / byline')
        },
        {
            key: 'metadata.describe.source-name',
            label: __('Source name')
        },
        {
            key: 'metadata.describe.source-url',
            label: __('Source URL')
        }
    ];

    const noFormat = s => s;
</script>

<SignInPageLayout title="Edit Visualization in Datawrapper">
    <h1>{__('create / hed')}</h1>

    <p>{__('create / confirm')}</p>

    <table>
        {#each fields as field}
            {#if get(chartData, field.key)}
                <tr
                    ><th>{field.label}:</th><td class={field.key.split('.').slice(-1)[0]}
                        >{#if field.html}{@html get(chartData, field.key)}{:else}{get(
                                chartData,
                                field.key
                            )}{/if}</td
                    ></tr
                >
            {/if}
        {/each}
        <tr
            ><th>{__('create / field / dataset columns')}:</th><td>
                {#if ds}
                    {#each columns as col}
                        <div class="column t-{col.type}">
                            <div class="title">{col.name}</div>
                            <div class="type">{col.type}</div>
                            <div class="range">({col.range.join(' - ')})</div>
                        </div>
                    {/each}
                    {#if ds.numColumns() > 10}
                        and {ds.numColumns() - 1} more
                    {/if}
                {/if}
            </td></tr
        >
        <tr
            ><th>{__('create / field / dataset rows')}:</th><td>
                {#if ds}
                    {ds.numRows()} (<button
                        on:click={() => (showData = !showData)}
                        class="plain-link"
                        >{__('create / ' + (showData ? 'hide' : 'show') + ' dataset')}</button
                    >)
                {/if}
            </td></tr
        >
        {#if showData && ds}
            <tr
                ><th>{__('create / field / dataset')}:</th><td>
                    <div
                        style="max-height: 300px; overflow: auto; background: #f5f5f5; padding: 10px 20px; max-width: 490px;"
                    >
                        <table class="data">
                            <thead>
                                <tr>
                                    {#each ds.columns() as col}
                                        <th>{col.name()}</th>
                                    {/each}
                                </tr>
                            </thead>
                            <tbody>
                                {#each ds.column(0).values() as v, i}
                                    <tr>
                                        {#each ds.columns() as col}
                                            <td>{col.raw(i) || '-'}</td>
                                        {/each}
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </td></tr
            >
        {/if}
    </table>

    <p>{__('create / confirm-q')}</p>

    <button class="btn btn-primary" on:click={openInDatawrapper}
        >{__('create / confirm-q / yes')}</button
    >
    <button class="btn" on:click={dontOpen}>{__('create / confirm-q / no')}</button>
    <hr />
    <p class="footer">{@html __('create / footer')}</p>
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
    p.footer {
        font-size: 14px;
        margin-bottom: 0;
        line-height: 20px;
    }
    th,
    td {
        padding: 5px 10px 5px 0;
    }
    .column {
        display: inline-block;
        padding: 7px 10px;
        margin: 0 6px 6px 0;
        border: 1px solid #ddd;
        border-radius: 4px;
        line-height: 15px;
    }
    .column .title {
        color: #222;
        margin-bottom: 5px;
    }
    .column .type {
        font-size: 11px;
        text-transform: uppercase;
        color: #777;
    }
    .column .range {
        color: #999;
        font-size: 12px;
        font-style: italic;
    }
    .btn {
        display: inline-block;
        background: #cccccc;
        font-size: 17.5px;
        padding: 14px 15px;
        font-weight: 400;
        margin-bottom: 8px;
        border-radius: 4px;
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
        background: #1d81a2;
        border-color: #1d81a2 !important;
        line-height: 20px;
        text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25) !important;
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
        font-weight: normal;
        color: #777;
        font-size: 14px;
    }
    hr {
        border: none;
        border-bottom: 1px solid #eee;
    }
    table.data th {
        color: #222;
        font-weight: bold;
        font-size: 14px;
    }
    td.title {
        font-weight: bold;
        font-size: 22px;
        color: #000;
        line-height: 1.25;
    }
    td.intro {
        font-size: 14px;
        color: #222;
        line-height: 17px;
    }
    td.notes {
        font-style: italic;
        color: #656565;
        font-size: 12px;
    }
    td.byline,
    td.source-name,
    td.source-url {
        color: #888;
        font-size: 11px;
    }
</style>
