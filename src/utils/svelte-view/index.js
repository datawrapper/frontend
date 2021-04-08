'use strict';

const Hoek = require('@hapi/hoek');
const babel = require('@babel/core');
const EventEmmiter = require('events');
const { join, relative } = require('path');
const { readFile } = require('fs').promises;
const { setCache, withCache } = require('./cache');
const { build, watch } = require('./rollup-runtime');
const ejs = require('ejs');

let template;

let compilePromise = false;
const templateQueue = [];
const watchers = new Set();
const wsClients = new Set();

function prepareView(page) {
    templateQueue.push(page);
    if (!compilePromise) {
        compilePromise = prepareNext();
    }
}

function prepareAllViews() {
    return compilePromise;
}

async function prepareNext() {
    const page = templateQueue.shift();
    await getView(page);
    if (templateQueue.length > 0) {
        return prepareNext();
    }
    compilePromise = false;
}

function getView(page) {
    return withCache(page, () => compilePage(page));
}

async function compilePage(page) {
    try {
        const ssr = await build(page, true);
        const csr = await build(page, false);
        return { ssr, csr, error: null };
    } catch (err) {
        console.error(`Error: Svelte compile error in ${page}`);
        return { error: err };
    }
}

function watchPage(page) {
    const eventEmmiter = new EventEmmiter();
    if (!watchers.has(page)) {
        // watch
        watchers.add(page);
        process.stdout.write(`Starting rollup watch for ${page}\n`);
        watch(page, (error, result) => {
            if (error) {
                console.error(error);
                return;
            }
            process.stdout.write(`Updated csr/ssr cache for ${page}\n`);
            // update cache
            eventEmmiter.emit('change', result);
            // notify page
            if (wsClients) {
                wsClients.forEach(ws =>
                    ws.send(
                        JSON.stringify({
                            page
                        })
                    )
                );
            }
        });
    }
    return eventEmmiter;
}

async function transpileView(view) {
    if (!view.csrBabel) {
        // transpile now
        view.csrBabel = (
            await babel.transformAsync(view.csr, {
                presets: [['@babel/env', { targets: { ie: 11 }, corejs: 3, useBuiltIns: 'entry' }]],
                plugins: ['babel-plugin-transform-async-to-promises']
            })
        ).code;
    }
    return view.csrBabel;
}

const SvelteView = {
    compile(t, compileOpts) {
        const baseViewDir = join(__dirname, '../../views');
        const page = relative(baseViewDir, compileOpts.filename);

        return async function runtime(context, renderOpts) {
            renderOpts = Hoek.applyToDefaults(compileOpts, renderOpts);

            if (!template || process.env.DW_DEV_MODE) {
                template = await readFile(join(__dirname, 'template.ejs'), 'utf8');
            }

            if (process.env.DW_DEV_MODE) {
                watchPage(page).on('change', result => setCache(page, result));
            }
            const { ssr, error } = await getView(page);

            if (error) {
                // @todo: show a nicer error message on production
                return `
            <h1>Error in template ${error.filename}:${error.start ? error.start.line : ''}</h1>
            <big>${error.message}</big>
            <pre>${error.frame}</pre>`;
            }
            context.props.stores = context.stores;

            // eslint-disable-next-line
            const ssrFunc = new Function(ssr + ';return App');
            const { css, html, head } = ssrFunc().render(context.props);

            // remove stores that we already have in client-side cache
            Object.keys(context.storeCached).forEach(key => {
                context.props.stores[key] = {};
            });

            const output = ejs.render(template, {
                SSR_HEAD: head,
                SSR_CSS: css.code,
                SSR_HTML: html,
                PAGE: page,
                PAGE_PROPS: JSON.stringify(context.props),
                DW_DEV_MODE: process.env.DW_DEV_MODE,
                STORE_HASHES: JSON.stringify(context.storeHashes)
            });

            return output;
        };
    },
    context: require('./context')
};

module.exports = {
    getView,
    prepareView,
    prepareAllViews,
    transpileView,
    SvelteView,
    wsClients
};
