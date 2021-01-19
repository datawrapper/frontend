'use strict';
// @todo: would be nice to add a watch-mode for development
const build = require('./rollup-runtime');

const cache = new Map();
let templateQueue = [];
let compilePromise = false;

module.exports = {
    async getView(page) {
        if (!cache.has(page)) {
            await compile(page);
        }
        return cache.get(page);
    },
    prepareView(page) {
        templateQueue.push(page);
        if (!compilePromise) {
            compilePromise = prepareNext();
        }
    },
    prepareAllViews() {
        return compilePromise;
    }
};

async function prepareNext() {
    const page = templateQueue.shift();
    await compile(page);
    if (templateQueue.length > 0) {
        return prepareNext();
    }
    compilePromise = false;
}

async function compile(page) {
    console.log('Compiling view ' + page);
    if (cache.get(page)) return;
    try {
        const ssrCode = await build(page, true);
        cache.set(page, {
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
