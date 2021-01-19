'use strict';
// @todo: would be nice to add a watch-mode for development
const build = require('./rollup-runtime');
const babel = require('@babel/core');

const cache = new Map();
let templateQueue = [];
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
    }
};

async function getView(page) {
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
    if (cache.get(page)) return;
    try {
        const ssrCode = await build(page, true);
        cache.set(page, {
            // eslint-disable-next-line
            ssr: new Function(ssrCode + ';return App'),
            csr: await build(page, false)
        });
    } catch (err) {
        console.error(`Error: Svelte compile error in ${page}`);
        cache.set(page, {
            error: err
        });
    }
}
