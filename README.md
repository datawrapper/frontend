# datawrapper-frontend

In this repository lives the code of the Datawrapper frontend app. It is built on [Sapper](https://sapper.svelte.dev). To get going you need to clone the repository and set up your `config.js`. Like `datawrapper/api` or `datawrapper/render-server`, this project reads the config from 2 possible directories. These directories are the repository root or `/etc/datawrapper`. If you have set up `datawrapper/api` before it is likely that you can use an existing config at `/etc/datawrapper/config.js`.

Before setting up the repository I recommend reading at least the *Introduction* part of the Sapper documentation. This will help to understand why things are structured the way they are and gives a sense why some errors might occur.

To develop and run this app, `datawrapper/api` needs to run too. This app makes heavy use of API endpoints.

If you have trouble setting up the project, at the bottom of this document is a [Troubleshooting](#troubleshooting) section.

```bash
npm install # or yarn!
npm run dev
```

Open up [localhost:3000](http://localhost:3000) and start clicking around.

Consult [sapper.svelte.technology](https://sapper.svelte.dev) for help getting started.


## Structure

Sapper expects to find two directories in the root of your project —  `src` and `static`.


### src

The [src](src) directory contains the entry points for your app — `client.js`, `server.js` and (optionally) a `service-worker.js` — along with a `template.html` file and a `routes` directory.


#### src/routes

This is the heart of your Sapper app. There are two kinds of routes — *pages*, and *server routes*.

**Pages** are Svelte components written in `.html` files. When a user first visits the application, they will be served a server-rendered version of the route in question, plus some JavaScript that 'hydrates' the page and initialises a client-side router. From that point forward, navigating to other pages is handled entirely on the client for a fast, app-like feel. (Sapper will preload and cache the code for these subsequent pages, so that navigation is instantaneous.)

**Server routes** are modules written in `.js` files, that export functions corresponding to HTTP methods. Each function receives Express `request` and `response` objects as arguments, plus a `next` function. This is useful for creating a JSON API, for example.

There are three simple rules for naming the files that define your routes:

* A file called `src/routes/about.html` corresponds to the `/about` route. A file called `src/routes/blog/[slug].html` corresponds to the `/blog/:slug` route, in which case `params.slug` is available to the route
* The file `src/routes/index.html` (or `src/routes/index.js`) corresponds to the root of your app. `src/routes/about/index.html` is treated the same as `src/routes/about.html`.
* Files and directories with a leading underscore do *not* create routes. This allows you to colocate helper modules and components with the routes that depend on them — for example you could have a file called `src/routes/_helpers/datetime.js` and it would *not* create a `/_helpers/datetime` route


### static

The [static](static) directory contains any static assets that should be available. By default only `/static` is served by Sapper. To get static resources that are needed for chart previewing, the express server used by Sapper will serve any file located in `@datawrapper/chart-core/dist/`, too.

`@datawrapper/chart-core/dist/` is a shared npm package used for chart publishing in `datawrapper/api` and chart previewing in `datawrapper/frontend.`

## Bundler config

Sapper uses Rollup or webpack to provide code-splitting and dynamic imports, as well as compiling your Svelte components. With webpack, it also provides hot module reloading. As long as you don't do anything daft, you can edit the configuration files to add whatever plugins you'd like.

## Production mode and deployment

To start a production version of your app, run `npm run build && npm start`. This will disable live reloading, and activate the appropriate bundler plugins.

## Bugs and feedback

Sapper is in early development, and may have the odd rough edge here and there. Please be vocal over on the [Sapper issue tracker](https://github.com/sveltejs/sapper/issues).


## Troubleshooting

This is basically a list of problems that can occur during development or set up of this project.

* **Cryptic Node error message about `"chunk" argument`s**
```
(node:15449) UnhandledPromiseRejectionWarning: TypeError [ERR_INVALID_ARG_TYPE]: The "chunk" argument must be one of type string or Buffer. Received type object
    at validChunk (_stream_writable.js:263:10)
    at Socket.Writable.write (_stream_writable.js:297:21)
    at Array.authMiddleware (... /__sapper__/dev/server/server.js:2794:24)
    at process._tickCallback (internal/process/next_tick.js:68:7)
(node:15449) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). (rejection id: 1)
(node:15449) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
```

**Your API server is most likely not running or crashed.** To fix this, start the API server in your local API repository with `npm run dev`. After the server started, reload the app in your browser and everything should work again.

* Sapper start crashes with `CONFIG_FILE: "undefined"`
```
❯ npm run dev

> @datawrapper/frontend@0.0.1 dev ... /frontend
> sapper dev

CONFIG_FILE: "undefined"
(node:15539) UnhandledPromiseRejectionWarning: TypeError [ERR_INVALID_ARG_TYPE]: The "id" argument must be of type string. Received type undefined
```

Make sure that you have a valid `config.js` in either the projects root directory or `etc/datawrapper/`.

* Styles are not loading in the visualization

Make sure that your API repository is on the correct branch (currently `origin/publish`) and the `/visualizations/:id/styles.css` endpoint is available.
