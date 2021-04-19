<script type="text/javascript">
    import MainLayout from 'layout/MainLayout.svelte';
    import Svelte2Wrapper from 'layout/partials/Svelte2Wrapper.svelte';
    import Message from 'layout/partials/bulma/Message.svelte';
    import Notification from 'layout/partials/bulma/Notification.svelte';
    import { onMount, onDestroy, getContext } from 'svelte';

    export let magicNumber;
    export let visualizations;
    export let __;

    const user = getContext('user');

    let knocked = false;

    function knock() {
        knocked = true;
    }

    function causeError() {
        throw new Error('This is a serious error!');
    }

    let interval;
    onMount(() => {
        interval = setInterval(() => {
            magicNumber++;
        }, 1000);
    });

    onDestroy(() => {
        clearInterval(interval);
    });

    let data = {
        settings: {
            webhook_url: 'test'
        }
    };

    $: message = !knocked ? `Knock, knock. Who's there? (click me!)` : `Hello ${$user.name}!`;
</script>

<MainLayout title="Hello world">
    <div class="container">
        <h1 class="title is-1" style="color:#c04" on:click={knock}>{message}</h1>
        <p>{__('team / invite / intro')}</p>
        <p>The magic number is&nbsp;<b>{magicNumber}</b>!</p>
        <button class="button is-danger" on:click={causeError}>Throw an error!</button>
    </div>

    <div class="section">
        <div class="container">
            <div class="columns">
                <div class="column is-one-fifth">
                    <h3 class="is-size-4">Bulma buttons</h3>
                </div>
                <div class="column">
                    <div class="buttons">
                        <button class="button">Default</button>
                        <button class="button is-white">White</button>
                        <button class="button is-light">Light</button>
                        <button class="button is-dark">Dark</button>
                        <button class="button is-black">Black</button>
                        <button class="button is-text">Text</button>
                        <button class="button is-ghost">Ghost</button>
                    </div>

                    <div class="buttons">
                        <button class="button is-primary">Primary</button>
                        <button class="button is-primary" disabled>Disabled</button>
                        <button class="button is-link">Link</button>
                    </div>

                    <div class="buttons has-addons">
                        <button class="button is-light"
                            ><span class="icon"><i class="fa fa-chevron-left fa-fw" /></span><span
                                >Back</span
                            ></button
                        >
                        <button class="button is-primary"
                            ><span>Proceed</span>
                            <span class="icon"><i class="fa fa-chevron-right fa-fw" /></span
                            ></button
                        >
                    </div>

                    <div class="buttons">
                        <button class="button is-info">Info</button>
                        <button class="button is-success">Success</button>
                        <button class="button is-warning">Warning</button>
                        <button class="button is-danger">Danger</button>
                    </div>

                    <div class="buttons">
                        <button class="button is-small is-light"
                            ><span class="icon"><i class="fa fa-plus" /></span>
                            <span>Add area fill</span></button
                        >
                        <button class="button">Normal</button>
                        <button class="button is-medium">Medium</button>
                        <button class="button is-large is-primary">Publish chart</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="container">
            <div class="columns">
                <div class="column is-one-fifth">
                    <h3 class="is-size-4">Bulma notifications</h3>
                </div>
                <div class="column">
                    <Notification>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit lorem ipsum dolor. <strong
                            >Pellentesque risus mi</strong
                        >, tempus quis placerat ut, porta nec nulla. Vestibulum rhoncus ac ex sit
                        amet fringilla. Nullam gravida purus diam, et dictum
                        <a href="/#foo">felis venenatis</a> efficitur.
                    </Notification>

                    <Notification type="primary">
                        <strong>Primary!</strong> Primar lorem ipsum dolor sit amet, consectetur
                        adipiscing elit lorem ipsum dolor. <strong>Pellentesque risus mi</strong>,
                        tempus quis placerat ut, porta nec nulla. Vestibulum rhoncus ac ex sit amet
                        fringilla. Nullam gravida purus diam, et dictum
                        <a href="/#foo">felis venenatis</a> efficitur.
                    </Notification>

                    <Notification type="info">
                        <strong>Info!</strong> Primar lorem ipsum dolor sit amet, consectetur
                        adipiscing elit lorem ipsum dolor. <strong>Pellentesque risus mi</strong>,
                        tempus quis placerat ut, porta nec nulla. Vestibulum rhoncus ac ex sit amet
                        fringilla. Nullam gravida purus diam, et dictum
                        <a href="/#foo">felis venenatis</a> efficitur.
                    </Notification>

                    <Notification type="success">
                        <strong>Success!</strong> Primar lorem ipsum dolor sit amet, consectetur
                        adipiscing elit lorem ipsum dolor. <strong>Pellentesque risus mi</strong>,
                        tempus quis placerat ut, porta nec nulla. Vestibulum rhoncus ac ex sit amet
                        fringilla. Nullam gravida purus diam, et dictum
                        <a href="/#foo">felis venenatis</a> efficitur.
                    </Notification>

                    <Notification type="warning" deletable={false}>
                        <strong>Warning!</strong> Primar lorem ipsum dolor sit amet, consectetur
                        adipiscing elit lorem ipsum dolor. <strong>Pellentesque risus mi</strong>,
                        tempus quis placerat ut, porta nec nulla. Vestibulum rhoncus ac ex sit amet
                        fringilla. Nullam gravida purus diam, et dictum
                        <a href="/#foo">felis venenatis</a> efficitur. Not deletable :)
                    </Notification>

                    <Notification type="danger">
                        <strong>Danger!</strong> Primar lorem ipsum dolor sit amet, consectetur
                        adipiscing elit lorem ipsum dolor. <strong>Pellentesque risus mi</strong>,
                        tempus quis placerat ut, porta nec nulla. Vestibulum rhoncus ac ex sit amet
                        fringilla. Nullam gravida purus diam, et dictum
                        <a href="/#foo">felis venenatis</a> efficitur.
                    </Notification>
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="container">
            <div class="columns">
                <div class="column is-one-fifth">
                    <h3 class="is-size-4">Bulma progress bar</h3>
                </div>
                <div class="column">
                    <progress class="progress is-primary" value="15" max="100">15%</progress>
                    <progress class="progress is-link" value="30" max="100">30%</progress>
                    <progress class="progress is-info is-small" value="45" max="100">45%</progress>
                    <progress class="progress is-success" value="60" max="100">60%</progress>
                    <progress class="progress is-warning" value="75" max="100">75%</progress>
                    <progress class="progress is-danger" max="100">90%</progress>
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="container">
            <div class="columns">
                <div class="column is-one-fifth">
                    <h3 class="is-size-4">Bulma table</h3>
                </div>
                <div class="column">
                    <table class="table is-striped">
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Name</th>
                                <th>Plugin</th>
                                <th>Workflow</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each visualizations as vis}
                                <tr>
                                    <td>{vis.id}</td>
                                    <td>{vis.title}</td>
                                    <td><span class="tag">{vis.__plugin}</span></td>
                                    <td
                                        ><span
                                            class="tag"
                                            class:is-primary={vis.namespace === 'chart'}
                                            class:is-black={vis.namespace === 'map'}
                                            class:is-success={vis.namespace === 'table'}
                                            >{vis.namespace}</span
                                        ></td
                                    >
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="container">
            <div class="columns">
                <div class="column is-one-fifth">
                    <h3 class="is-size-4">Bulma message</h3>
                </div>
                <div class="column">
                    <div class="columns">
                        <div class="column">
                            <Message title="New locator maps">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. <strong
                                    >Pellentesque risus mi</strong
                                >, tempus quis placerat ut, porta nec nulla. Vestibulum rhoncus ac
                                ex sit amet fringilla. Nullam gravida purus diam, et dictum
                                <a>felis venenatis</a>
                                efficitur. Aenean ac <em>eleifend lacus</em>, in mollis lectus.
                                Donec sodales, arcu et sollicitudin porttitor, tortor urna tempor
                                ligula, id porttitor mi magna a neque. Donec dui urna, vehicula et
                                sem eget, facilisis sodales sem.
                            </Message>
                        </div>
                        <div class="column">
                            <Message title="Heads up!" type="warning">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. <strong
                                    >Pellentesque risus mi</strong
                                >, tempus quis placerat ut, porta nec nulla. Vestibulum rhoncus ac
                                ex sit amet fringilla. Nullam gravida purus diam, et dictum
                                <a>felis venenatis</a> efficitur.
                            </Message>
                        </div>
                        <div class="column">
                            <Message type="">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. <strong
                                    >Pellentesque risus mi</strong
                                >, tempus quis placerat ut, porta nec nulla. Vestibulum rhoncus ac
                                ex sit amet fringilla. Nullam gravida purus diam, et dictum
                                <a>felis venenatis</a> efficitur.
                            </Message>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="container">
            <div class="columns">
                <div class="column is-one-fifth">
                    <h3 class="is-size-4">Embedding Svelte 2 components</h3>
                </div>
                <div class="column">
                    <h2>Webhook URL: <input bind:value={data.settings.webhook_url} /> (svelte3)</h2>
                    <Svelte2Wrapper
                        id="plugin-team-integrations"
                        js="/static/plugins/team-integrations/team-integrations.js"
                        css="/static/plugins/team-integrations/team-integrations.css"
                        bind:data
                    />
                </div>
            </div>
        </div>
    </div>
</MainLayout>
