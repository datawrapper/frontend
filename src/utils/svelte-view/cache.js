'use strict';
// @todo: would be nice to add a watch-mode for development
const { build, watch } = require('./rollup-runtime');
const babel = require('@babel/core');
const cache = new Map();
const templateQueue = [];
const wsClients = new Set();
let compilePromise = false;

module.exports = {
    getView,
    prepareView(page) {
        templateQueue.push(page);
        if (!compilePromise) {
            compilePromise = prepareNext();
        }
    },
    prepareAllViews() {
        return compilePromise;
    },
    async transpileView(page) {
        const view = await getView(page);
        if (!view.csrBabel) {
            // transpile now
            view.csrBabel = (
                await babel.transformAsync(view.csr, {
                    presets: [['@babel/env', { targets: '> 1%', corejs: 3, useBuiltIns: 'entry' }]],
                    plugins: ['babel-plugin-transform-async-to-promises']
                })
            ).code;
            // and store result for later
            cache.set(page, view);
        }
        return view.csrBabel;
    },
    wsClients
};

const watchers = new Set();

async function getView(page) {
    if (process.env.DW_DEV_MODE) {
        if (!watchers.has(page)) {
            // watch
            watchers.add(page);
            process.stdout.write(`Starting rollup watch for ${page}\n`);
            watch(page, (error, { csr, ssr }) => {
                if (error) {
                    return console.error(error);
                }
                process.stdout.write(`Updated csr/ssr cache for ${page}\n`);
                // update cache
                cache.set(page, { ssr, csr });
                // notify page
                console.log(wsClients)
                if (wsClients) {
                    wsClients.forEach(ws => {
                        ws.send(JSON.stringify({
                            page
                        }))
                    })
                }
            });
        }
    }
    if (!cache.has(page)) {
        await compile(page);
    }
    return cache.get(page);
}

async function prepareNext() {
    const page = templateQueue.shift();
    await compile(page);
    if (templateQueue.length > 0) {
        return prepareNext();
    }
    compilePromise = false;
}

async function compile(page) {
    // console.log('Compiling view ' + page);
    try {
        const ssrCode = await build(page, true);
        cache.set(page, {
            ssr: ssrCode,
            csr: await build(page, false)
        });
    } catch (err) {
        console.error(`Error: Svelte compile error in ${page}`);
        cache.set(page, {
            error: err
        });
    }
}
