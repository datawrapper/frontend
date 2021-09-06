<script>
    export let dataset = '';
    export let chartData = {};
    export let template = null;

    import { onMount, getContext, setContext } from 'svelte';

    // dynamic language
    const msg = getContext('messages');
    const config = getContext('config');
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
                    .get('/lib/stores/messages.json', { baseUrl: `//${window.location.host}` })
                    .then(res => {
                        msg.set(res);
                    });
            }
        });

        if (!template) {
            httpReq.get(`/v3/visualizations/${chartData.type || 'd3-lines'}`).then(res => {
                chartData.niceType = `<img style="vertical-align:middle;height:20px" alt="" src="/static/plugins/${
                    res.__plugin
                }/${res.id}.svg" /> ${res.__title || ''}`;
            });

            ds = await delimited({ csv: dataset }).dataset();
        }
    });

    function openInDatawrapper() {
        function redirect(chart) {
            return () =>
                setTimeout(() => {
                    // redirect to chart
                    window.location.href =
                        chart.type === 'locator-maps'
                            ? `/edit/${chart.id}`
                            : `/chart/${chart.id}/edit`;
                }, 400);
        }
        if (template) {
            // forward to editor immediately
            httpReq.post(`/v3/charts/${template.id}/fork`).then(res => {
                redirect(res)();
            });
        } else {
            // only keep whitelisted keys in payload
            const payload = { ...chartData };
            const allowed = [
                'title',
                'theme',
                'type',
                'forkable',
                'organizationId',
                'folderId',
                'externalData',
                'language',
                'lastEditStep',
                'metadata'
            ];
            if (payload.external_data) {
                payload.externalData = payload.external_data;
                delete payload.external_data;
            }
            if (payload.last_edit_step) {
                payload.lastEditStep = payload.last_edit_step;
                delete payload.last_edit_step;
            }
            // remove unknown keys
            Object.keys(payload).forEach(k => {
                if (!allowed.includes(k)) delete payload[k];
            });
            httpReq
                .post('/v3/charts', {
                    payload
                })
                .then(res => {
                    if (dataset) {
                        // upload data
                        httpReq
                            .put(`/v3/charts/${res.id}/data`, {
                                headers: {
                                    'Content-Type': 'text/csv'
                                },
                                body: dataset
                            })
                            .then(redirect(res));
                    } else {
                        redirect(res)();
                    }
                });
        }
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
        },
        {
            key: 'external_data',
            label: __('External data')
        }
    ];

    const noFormat = s => s;
</script>

<SignInPageLayout title={__('template / hed')}>
    {#if template}
        <h1 class="title is-3">{__('template / hed')}</h1>
        <div class="content">
            <p class="is-size-5">{__('template / confirm')}</p>
        </div>
        <div class="content mt-4">
            <p>
                <button class="button is-large is-primary" on:click={openInDatawrapper}
                    ><span class="icon mr-0"><i class="fa fa-code-fork" /></span><span
                        >{__('template / confirm-q / yes')}</span
                    ></button
                >
                <button class="button ml-5 is-large" on:click={dontOpen}
                    >{__('create / confirm-q / no')}</button
                >
            </p>
        </div>
        <div class="mt-3">
            <hr />
            <img
                alt="Screenshot of pubished visualization"
                src="{template.public_url}../full.png"
            />
            <hr />
            <p class="has-text-grey">{@html __('create / footer')}</p>
        </div>
    {:else}
        <h1 class="title is-3">{__('create / hed')}</h1>

        <div class="content">
            <p class="is-size-5">{__('create / confirm')}</p>

            <p>
                <button class="button is-large is-primary" on:click={openInDatawrapper}
                    >{__('create / confirm-q / yes')}</button
                >
                <button class="button is-large ml-5" on:click={dontOpen}
                    >{__('create / confirm-q / no')}</button
                >
            </p>
        </div>
        <hr />

        <table class="mt-3">
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
            {#if ds && ds.numRows() > 0}
                <tr
                    ><th>{__('create / field / dataset columns')}:</th><td>
                        {#if ds}
                            {#each columns as col}
                                <div class="cols t-{col.type}">
                                    <div class="name">{col.name}</div>
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
                                >{__(
                                    'create / ' + (showData ? 'hide' : 'show') + ' dataset'
                                )}</button
                            >)
                        {/if}
                    </td></tr
                >
            {/if}
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
        <hr />
        <p class="has-text-grey">{@html __('create / footer')}</p>
    {/if}
</SignInPageLayout>

<style>
    th,
    td {
        padding: 5px 10px 5px 0;
    }
    .cols {
        display: inline-block;
        padding: 7px 10px;
        margin: 0 6px 6px 0;
        border: 1px solid #ddd;
        border-radius: 4px;
        line-height: 15px;
    }
    .cols .name {
        color: #222;
        margin-bottom: 5px;
    }
    .cols .type {
        font-size: 11px;
        text-transform: uppercase;
        color: #777;
    }
    .cols .range {
        color: #999;
        font-size: 12px;
        font-style: italic;
    }

    img {
        max-width: 100%;
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
