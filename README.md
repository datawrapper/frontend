# Datawrapper Frontend

This repository contains the `frontend` service for Datawrapper. It is intended to be run together with other Datawrapper components.

## Development

Repository overview:

-   [`locale`](locale/) - translation files, automatically updated through the Lokalise API. Run `npm update-translations` in the `api` repository to update all translations.
-   [`src/auth`](src/auth/) - our authentication adapter for Hapi, handles cookie sessions etc.
-   [`src/routes`](src/routes/) - controller for the individual frontend routes (e.g. [routes/preview/index.js](src/routes/preview/index.js) for the `GET /preview/:chartid:` route)
-   [`src/utils/`](src/utils) - some utilities such as the [plugin loader](src/utils/plugin-loader.js) or our custom [Svelte view adapter](src/utils/svelte-view)
-   [`src/views`](src/views) - the view templates (currently we support `pug` and `Svelte3` views)
-   [`src/server.js`](src/server.js) - where all the fun begins ;-)
-   [`src/styles`](src/styles) - the LESS sources for `static/datawrapper.css` (use `npm run build:css` to update)

## Quick introduction of the new Svelte views

In routes we can use Svelte-templates like this:

```jsx
// e.g., src/routes/hello-world.js
server.route({
    path: '/',
    method: 'GET',
    async handler(request, h) {
        const props = { name: 'Gregor' };
        return h.view('HelloWorld.svelte', { props });
    }
});
```

The views are simple Svelte3 components that live inside `src/views`

```html
<!-- src/views/HelloWorld.svelte -->
<script>
    export let name = 'world';

    function knock() {
        name = 'Who\\'s there?';
    }
</script>

<h1 on:click="{knock}">Hello {name}</h1>
```

### Server-side rendering + client-side hydration + IE transpiling

Each view is compiled twice, so we can render it server-side and then „hydrate“ it client-side.

The client-side code is served via `/lib/csr/HelloWorld.svelte.js`. This way we can serve a transpiled bundle to IE11 users, who will instead load the bundle from `/lib/csr/HelloWorld.svelte.ie.js`.

For now I used a simple IE11 detection using `window.document.documentMode`, but later we can re-purpose our existing `getBrowser` method from polyfills.

### Caching

I implemented a simple cache so we don't compile the Svelte code every time someone hits the route. The cache is using a standard JS Map for now.

see [here](https://github.com/datawrapper/frontend/blob/feature/edit-in-datawrapper/src/utils/svelte-view/cache.js#L54-L69)

We could potentially also use our shared Redis cache to reduce load and cache overhead in a multi-thread scenario.

### Prepared views

Now, if we'd leave it like this, the Svelte code would be compiled whenever the route is first hit by a request. But if we want we can mark it for pre-compilation via `server.methods.prepareView`, for instance in the file where we define the route. This way the view template will be compiled upon server start. The idea is that we can decide which views to prepare based on anticipated usage. Core views like signin, preview etc should be prepared, but less commonly hit routes can be compiled on-demand.

```jsx
// src/routes/hello-world.js
server.route({
    // ...
});
server.methods.prepareView('HelloWorld.svelte');
```

In order to maximize the restart smoothness the server waits for all prepared views to be compiled before starting. Otherwise a server restart would cause a slight performance bump if suddenly a lot of templates had to be compiled at once.

### Layouts

Views want to re-use "layouts". I decided to move all of this logic into Svelte, for maximum flexibility. Meaning, the view component is always the "root" component which imports as many layout components as it wants. Also layouts can "extend" other layouts etc.

```html
<!-- src/views/HelloWorld.svelte -->
<script>
    import AdminPageLayout from 'layouts/AdminPageLayout.svelte';
</script>

<AdminPage title="Hello world">
    <h1>This is the main content</h1>
    <div slot="belowNav">This goes below the nav sidebar</div>
</AdminPage>
```

### Global stores

For "global" variables such as the api domain or information about the signed-in user we don't want to use view props, as they would have to be passed on in too many places. Instead we're using Svelte stores which are accessible through Svelte's `getContext` method.

In `src/utils/svelte-view/context.js` we can define a set of global stores which can be used in any Svelte template via `getContext()`. The initial values are passed to the views as `stores` property.

Svelte views can now use these stores like regular Svelte stores:

```html
<!-- src/views/HellloWorld.svelte -->
<script>
    import { getContext } from 'svelte';
    // all context variables are stores
    const user = getContext('user');
</script>
<h1>Hello { $user.name }</h1>
<p>{__('team / invite / intro')}</p>
```

###Plugins!

Plugins can now hook into the frontend service and add their own views. To do so a plugin needs to do two things: provide a `frontend.cjs` that acts as hapi plugin interface (similar to our api plugins), and store Svelte views into `src/frontend/views/`.

Example plugin `frontend.cjs`

```jsx
// plugins/example/frontend.cjs
const { version, name } = require('./package.json');

module.exports = {
    name,
    version,
    register: (server, options) => {
        server.route({
            method: 'GET',
            path: '/example',
            async handler(request, h) {
                const props = { test: 'it works' };
                return h.view('plugins/example/ExampleView.svelte', { props });
            }
        });
    }
};
```

Example plugin `ExampleView.svelte`:

```html
<!-- plugins/example/src/frontend/views/ExampleView.svelte -->
<script type="text/javascript">
    import MainLayout from 'layout/MainLayout.svelte';
    import { user } from 'lib/stores';
    export let test;

    let count = 0;
</script>

<MainLayout title="Example works">
    <div class="container">
        <h1>Example plugin!</h1>
        <p>Hello {$user.name}. The value of <tt>test</tt> is: "{test}"</p>
        <button on:click="{() => count++}">
            {count ? `You clicked me ${count} times!` : 'Click me'}
        </button>
    </div>
</MainLayout>
```

This works because of two changes:

1. when the plugins are loaded during `frontend` server start, the plugins `src/frontend/views` folder is sym-linked to the frontend `src/views/plugins/{plugin}` path.
2. to alllow plugins to use core layouts we added an alias from `layout/*` to the corresponding path in the frontend. Otherwise plugins would have to resolve a long `../../../` path to find the layout folder

![https://user-images.githubusercontent.com/617518/105217547-e9e97c80-5b4b-11eb-859d-a1357958c5c0.gif](https://user-images.githubusercontent.com/617518/105217547-e9e97c80-5b4b-11eb-859d-a1357958c5c0.gif)

### Event hooks

Frontend plugins can not only define routes but also use our event hook system to modify the frontend server. Here's an example of a plugin using a hook to add an entry to the admin pages navigation:

```jsx
// admin-users/frontend.cjs

module.exports = {
    name,
    version,
    async register(server, options) {
        const { events, event } = server.app;

        events.on(event.REGISTER_ADMIN_PAGE, () => ({
            title: 'Users',
            id: 'users',
            group: 'Users',
            icon: 'fa-users',
            order: 1
        }));

    server.route({
            method: 'GET',
            path: '/admin/users',
            //...
```

This is the exact system we’re using in our API server, but I’m open to adjustments.

### Translations

To use (dynamic) translations in Svelte views you need to load the `messages` context. Unfortunately Svelte won't trigger DOM updates unless we define our own reactive `__()` method in each view, or pass it around.

```html
<script type="text/javascript">
    import MainLayout from 'layout/MainLayout.svelte';

    export let __;
</script>

<MainLayout title="Hello world">
    <div class="container">
        <p>{ __('team / invite / intro') }</p>
        <button>{ __('dashboard / intro', 'river') }</button>
    </div>
</MainLayout>
```

Behind the scenes, `translate` is using the `messages` store which contains all available translatable strings for the currently active language. By using a store we _could_ even hot swap languages should we decide this is a cool feature.

If you don't want to pass around the `__` method you can also define your own reactive version anywhere you want:

```html
<script>
    import { getContext } from 'svelte';
    const messages = getContext('messages');
    let __;
    $: {
        __ = (key, scope = 'core') => messages.translate(key, scope, $messages);
    }
</script>
```

### Client-side localStorage caching + cookie-based validation

For large and fairly static data like translations

### Svelte 2 adapter

To avoid having to rewrite all our Svelte2 code at once the new frontend includes a Svelte2 adapter which lets us load existing Svelte 2 components.

```jsx
<script type="text/javascript">
   import MainLayout from 'layout/MainLayout.svelte';
   import Svelte2Wrapper from 'layout/partials/Svelte2Wrapper.svelte';

   let data = {
      settings: {
         webhook_url: 'test'
      }
   };
</script>

<MainLayout title="Hello world">
    <Svelte2Wrapper
        id="plugin-team-integrations"
        js="/static/plugins/team-integrations/team-integrations.js"
        css="/static/plugins/team-integrations/team-integrations.css"
        bind:data />
</MainLayout>
```
