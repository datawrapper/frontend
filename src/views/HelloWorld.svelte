<script type="text/javascript">
    import MainLayout from 'layout/MainLayout.svelte';
    import Svelte2Wrapper from 'layout/partials/svelte2/Svelte2Wrapper.svelte';
    import Message from 'layout/partials/bulma/Message.svelte';
    import Notification from 'layout/partials/bulma/Notification.svelte';
    import SvgIcon from 'layout/partials/SvgIcon.svelte';
    import Tabs from 'layout/partials/bulma/Tabs.svelte';
    import { onMount, onDestroy, getContext } from 'svelte';

    export let magicNumber;
    export let visualizations;
    export let __;

    const user = getContext('user');

    let knocked = false;

    export let icons;

    const colors = ['#222222', '#18a1cd', '#c71e1d', '#1d81a2', '#15607a', '#39f3bb', '#09bb9f'];

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
            webhook_url: 'test',
            webhook_enabled: true
        }
    };

    $: message = !knocked ? `Knock, knock. Who's there? (click me!)` : `Hello ${$user.name}!`;
</script>

<MainLayout title="Hello world">
    <div class="container">
        <h1 class="title is-1" style="color:#c04" on:click={knock}>{message}</h1>
        <div class="content">
            <p>{__('team / invite / intro')}</p>
            <p>
                The magic number is&nbsp;<b>{magicNumber}</b>, and it keeps increasing because
                Svelte client-side hydration works!
            </p>
        </div>
    </div>

    <div class="section">
        <div class="container">
            <div class="columns">
                <div class="column is-one-fifth">
                    <h3 class="title is-3">Icons!</h3>
                </div>
                <div class="column">
                    {#each icons as icon}
                        <SvgIcon
                            className="mb-4 mr-4"
                            color={colors[Math.floor(Math.random() * colors.length)]}
                            {icon}
                            size="60"
                        />
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="container">
            <div class="columns">
                <div class="column is-one-fifth">
                    <h3 class="title is-3">Buttons</h3>
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
                    <h3 class="title is-3">Titles</h3>
                </div>
                <div class="column">
                    <h1 class="title is-1">Title size 1</h1>
                    <h2 class="subtitle has-text-grey is-3">Subtitle size 3</h2>
                    <hr />
                    <h1 class="title is-2">Title size 2</h1>
                    <h2 class="subtitle has-text-grey is-4">Subtitle size 4</h2>
                </div>
                <div class="column">
                    <h1 class="title is-3">Title size 3</h1>
                    <h2 class="subtitle has-text-grey is-5">Subtitle size 5</h2>
                    <hr />
                    <h1 class="title is-4">Title size 4</h1>
                    <h2 class="subtitle has-text-grey is-6">Subtitle size 6</h2>
                    <hr />
                    <h1 class="title is-5">Title size 5</h1>
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="container">
            <div class="columns">
                <div class="column is-one-fifth">
                    <h3 class="title is-3">Breadcrumbs</h3>
                </div>
                <div class="column">
                    <div class="columns is-2 is-variable">
                        <div class="column is-narrow">
                            <span>This chart is in</span>
                        </div>
                        <div class="column">
                            <nav class="breadcrumb" aria-label="breadcrumbs">
                                <ul>
                                    <li><a href="#/link">My Charts</a></li>
                                    <li><a href="#/link">Folder xyz</a></li>
                                    <li class="is-active"><a href="#/link">Folder 123</a></li>
                                </ul>
                            </nav>
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
                    <h3 class="title is-3">Tabs</h3>
                </div>
                <div class="column is-one-third">
                    <Tabs
                        items={[
                            { id: 'vis', title: 'Chart type' },
                            { id: 'refine', title: 'Refine' },
                            { id: 'annotate', title: 'Annotate' },
                            { id: 'design', title: 'Design' }
                        ]}
                        active="refine"
                    />
                </div>
            </div>
        </div>
    </div>
    <div class="section">
        <div class="container">
            <div class="columns">
                <div class="column is-one-fifth">
                    <h3 class="title is-3">Content</h3>
                </div>
                <div class="column content">
                    <h1>Hello World</h1>
                    <p>
                        Lorem ipsum<sup><a href="#/link">[1]</a></sup> dolor sit amet, consectetur
                        adipiscing elit. Nulla accumsan, metus ultrices eleifend gravida, nulla nunc
                        varius lectus, nec rutrum justo nibh eu lectus. Ut vulputate semper dui.
                        Fusce erat odio, sollicitudin vel erat vel, interdum mattis neque. Sub<sub
                            >script</sub
                        >
                        works as well!
                    </p>
                    <h2>Second level</h2>
                    <p>
                        Curabitur accumsan turpis pharetra <strong>augue tincidunt</strong> blandit.
                        Quisque condimentum maximus mi, sit amet commodo arcu rutrum id. Proin pretium
                        urna vel cursus venenatis. Suspendisse potenti. Etiam mattis sem rhoncus lacus
                        dapibus facilisis. Donec at dignissim dui. Ut et neque nisl.
                    </p>
                    <ul>
                        <li>In fermentum leo eu lectus mollis, quis dictum mi aliquet.</li>
                        <li>Morbi eu nulla lobortis, lobortis est in, fringilla felis.</li>
                        <li>Aliquam nec felis in sapien venenatis viverra fermentum nec lectus.</li>
                        <li>Ut non enim metus.</li>
                    </ul>
                    <h3>Third level</h3>
                    <p>
                        Quisque ante lacus, malesuada ac auctor vitae, congue <a href="#/link"
                            >non ante</a
                        >. Phasellus lacus ex, semper ac tortor nec, fringilla condimentum orci.
                        Fusce eu rutrum tellus.
                    </p>
                    <ol>
                        <li>Donec blandit a lorem id convallis.</li>
                        <li>Cras gravida arcu at diam gravida gravida.</li>
                        <li>Integer in volutpat libero.</li>
                        <li>Quisque aliquam cursus urna, non bibendum massa viverra eget.</li>
                        <li>Vivamus maximus ultricies pulvinar.</li>
                    </ol>
                    <blockquote>
                        Ut venenatis, nisl scelerisque sollicitudin fermentum, quam libero hendrerit
                        ipsum, ut blandit est tellus sit amet turpis.
                    </blockquote>
                    <p>
                        Quisque at semper enim, eu hendrerit odio. Etiam auctor nisl et <em
                            >justo sodales</em
                        > elementum. Maecenas ultrices lacus quis neque consectetur, et lobortis nisi
                        molestie.
                    </p>
                    <p>
                        Sed sagittis enim ac tortor maximus rutrum. Nulla facilisi. Donec mattis
                        vulputate risus in luctus. Maecenas vestibulum interdum commodo.
                    </p>
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="container">
            <div class="columns">
                <div class="column is-one-fifth">
                    <h3 class="title is-3">Notifications</h3>
                    <p class="subtitle is-5">
                        Use wrapper component <tt>&lt;Notification /&gt;</tt>
                    </p>
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
                    <h3 class="title is-3">Progress bar</h3>
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
                    <h3 class="title is-3">Table</h3>
                </div>
                <div class="column">
                    <table class="table is-striped">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Id</th>
                                <th>Name</th>
                                <th>Plugin</th>
                                <th>Workflow</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each visualizations as vis, i}
                                <tr>
                                    <td><tt class="has-text-grey">{i + 1}</tt></td>
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
                    <h3 class="title is-3">Message</h3>
                    <p class="subtitle is-5">Use wrapper component <tt>&lt;Message /&gt;</tt></p>
                </div>
                <div class="column">
                    <div class="columns">
                        <div class="column">
                            <Message title="New locator maps">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. <strong
                                    >Pellentesque risus mi</strong
                                >, tempus quis placerat ut, porta nec nulla. Vestibulum rhoncus ac
                                ex sit amet fringilla. Nullam gravida purus diam, et dictum
                                <a href="#/link">felis venenatis</a>
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
                                <a href="#/link">felis venenatis</a> efficitur.
                            </Message>
                        </div>
                        <div class="column">
                            <Message type="">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. <strong
                                    >Pellentesque risus mi</strong
                                >, tempus quis placerat ut, porta nec nulla. Vestibulum rhoncus ac
                                ex sit amet fringilla. Nullam gravida purus diam, et dictum
                                <a href="#/link">felis venenatis</a> efficitur.
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
                    <h3 class="title is-3">Forms</h3>
                </div>
                <div class="column is-one-quarter">
                    <h2 class="title is-4">Vertical</h2>
                    <div class="field">
                        <label for="t0" class="label">Name</label>
                        <div class="control">
                            <input id="t0" class="input" type="text" placeholder="Text input" />
                        </div>
                    </div>

                    <div class="field">
                        <label class="label">Username</label>
                        <div class="control has-icons-left has-icons-right">
                            <input
                                class="input is-success"
                                type="text"
                                placeholder="Text input"
                                value="bulma"
                            />
                            <span class="icon is-small is-left">
                                <i class="fa fa-user" />
                            </span>
                            <span class="icon is-small is-right">
                                <i class="fa fa-check" />
                            </span>
                        </div>
                        <p class="help is-success">This username is available</p>
                    </div>

                    <div class="field">
                        <label class="label">Email</label>
                        <div class="control has-icons-left has-icons-right">
                            <input
                                class="input is-danger"
                                type="email"
                                placeholder="Email input"
                                value="hello@"
                            />
                            <span class="icon is-small is-left">
                                <i class="fa fa-envelope" />
                            </span>
                            <span class="icon is-small is-right">
                                <i class="fa fa-exclamation-triangle" />
                            </span>
                        </div>
                        <p class="help is-danger">This email is invalid</p>
                    </div>

                    <div class="field">
                        <label class="label">Subject</label>
                        <div class="control">
                            <div class="select">
                                <select>
                                    <option>Select dropdown</option>
                                    <option>With options</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="field">
                        <label class="label">Message</label>
                        <div class="control">
                            <textarea class="textarea" placeholder="Textarea" />
                        </div>
                    </div>

                    <div class="field">
                        <div class="control">
                            <label class="checkbox">
                                <input type="checkbox" />
                                I agree to the <a href="#/link">terms and conditions</a>
                            </label>
                        </div>
                    </div>

                    <div class="field">
                        <div class="control">
                            <label class="radio">
                                <input type="radio" name="question" />
                                Yes
                            </label>
                            <label class="radio">
                                <input type="radio" name="question" />
                                No
                            </label>
                        </div>
                    </div>

                    <div class="field is-grouped">
                        <div class="control">
                            <button class="button is-link">Submit</button>
                        </div>
                        <div class="control">
                            <button class="button is-link is-light">Cancel</button>
                        </div>
                    </div>
                </div>
                <div class="column">
                    <h2 class="title is-4">Horizontal</h2>
                    <div class="field is-horizontal">
                        <div class="field-label is-normal">
                            <label class="label">From</label>
                        </div>
                        <div class="field-body">
                            <div class="field">
                                <p class="control is-expanded has-icons-left">
                                    <input class="input" type="text" placeholder="Name" />
                                    <span class="icon is-small is-left">
                                        <i class="fa fa-user" />
                                    </span>
                                </p>
                            </div>
                            <div class="field">
                                <p class="control is-expanded has-icons-left has-icons-right">
                                    <input
                                        class="input is-success"
                                        type="email"
                                        placeholder="Email"
                                        value="alex@smith.com"
                                    />
                                    <span class="icon is-small is-left">
                                        <i class="fa fa-envelope" />
                                    </span>
                                    <span class="icon is-small is-right">
                                        <i class="fa fa-check" />
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="field is-horizontal">
                        <div class="field-label" />
                        <div class="field-body">
                            <div class="field is-expanded">
                                <div class="field has-addons">
                                    <p class="control">
                                        <a class="button is-static"> +44 </a>
                                    </p>
                                    <p class="control is-expanded">
                                        <input
                                            class="input"
                                            type="tel"
                                            placeholder="Your phone number"
                                        />
                                    </p>
                                </div>
                                <p class="help">Do not enter the first zero</p>
                            </div>
                        </div>
                    </div>

                    <div class="field is-horizontal">
                        <div class="field-label is-normal">
                            <label class="label">Department</label>
                        </div>
                        <div class="field-body">
                            <div class="field is-narrow">
                                <div class="control">
                                    <div class="select is-fullwidth">
                                        <select>
                                            <option>Business development</option>
                                            <option>Marketing</option>
                                            <option>Sales</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="field is-horizontal">
                        <div class="field-label">
                            <label class="label">Already a member?</label>
                        </div>
                        <div class="field-body">
                            <div class="field is-narrow">
                                <div class="control">
                                    <label class="radio">
                                        <input type="radio" name="member" />
                                        Yes
                                    </label>
                                    <label class="radio">
                                        <input type="radio" name="member" />
                                        No
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="field is-horizontal">
                        <div class="field-label is-normal">
                            <label class="label">Subject</label>
                        </div>
                        <div class="field-body">
                            <div class="field">
                                <div class="control">
                                    <input
                                        class="input is-danger"
                                        type="text"
                                        placeholder="e.g. Partnership opportunity"
                                    />
                                </div>
                                <p class="help is-danger">This field is required</p>
                            </div>
                        </div>
                    </div>

                    <div class="field is-horizontal">
                        <div class="field-label is-normal">
                            <label class="label">Question</label>
                        </div>
                        <div class="field-body">
                            <div class="field">
                                <div class="control">
                                    <textarea
                                        class="textarea"
                                        placeholder="Explain how we can help you"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="field is-horizontal">
                        <div class="field-label">
                            <!-- Left empty for spacing -->
                        </div>
                        <div class="field-body">
                            <div class="field">
                                <div class="control">
                                    <button class="button is-primary"> Send message </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="section" id="svelte2-embed">
        <div class="container">
            <div class="columns">
                <div class="column is-one-fifth content">
                    <h3 class="title is-3">Embedding Svelte2 components</h3>
                    <p class="has-text-grey">Svelte3 data binding demo</p>
                    <p>
                        <label class="checkbox"
                            ><input type="checkbox" bind:checked={data.settings.webhook_enabled} /> Webhook
                            enabled</label
                        >
                    </p>
                    {#if data.settings.webhook_enabled}
                        <p>
                            Webhook URL: <input
                                class="input"
                                bind:value={data.settings.webhook_url}
                            />
                        </p>
                    {/if}
                </div>
                <div class="column">
                    <div class="box">
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
    </div>

    <div class="container content">
        <p>Finally,</p>
        <p><button class="button is-danger" on:click={causeError}>Throw an error!</button></p>
        <p>to test source maps in Svelte error stacktraces</p>
    </div>
</MainLayout>
