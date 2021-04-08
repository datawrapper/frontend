'use strict';

const rollup = require('rollup');
const svelte = require('rollup-plugin-svelte');
const { default: resolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const alias = require('@rollup/plugin-alias');
const replace = require('@rollup/plugin-replace');
const { less } = require('svelte-preprocess-less');
const { terser } = require('rollup-plugin-terser');
const { readFile, unlink } = require('fs-extra');
const { join } = require('path');
const tempfile = require('tempfile');
const production = process.env.NODE_ENV === 'production';

module.exports.build = async function (page, ssr) {
    const bundle = await rollup.rollup(buildOptions(page, ssr));

    const { output } = await bundle.generate({
        sourcemap: true,
        format: ssr ? 'iife' : 'amd',
        name: 'App',
        amd: {
            id: page.endsWith('.svelte') ? 'App' : null // page
        },
        file: 'public/build/bundle.js'
    });

    return output[0].code;
};

module.exports.watch = async function (page, callback) {
    if (!production) {
        const tmpCsr = tempfile('.js');
        const tmpSsr = tempfile('.js');
        const watcher = rollup.watch([
            {
                ...buildOptions(page, false),
                output: {
                    sourcemap: true,
                    format: 'amd',
                    name: 'App',
                    amd: {
                        id: page.endsWith('.svelte') ? 'App' : null // page
                    },
                    file: tmpCsr
                }
            },
            {
                ...buildOptions(page, true),
                output: {
                    sourcemap: true,
                    format: 'iife',
                    name: 'App',
                    amd: {
                        id: page.endsWith('.svelte') ? 'App' : null // page
                    },
                    file: tmpSsr
                }
            }
        ]);
        watcher.on('event', async ({ code, result, error }) => {
            if (code === 'ERROR') {
                console.error(error);
                callback(error);
            } else if (code === 'END') {
                const [csr, ssr] = await Promise.all([
                    readFile(tmpCsr, 'utf-8'),
                    readFile(tmpSsr, 'utf-8')
                ]);
                callback(null, { csr, ssr });
                unlink(tmpCsr);
                unlink(tmpSsr);
            }
        });
    }
};

function buildOptions(page, ssr) {
    return {
        input: join('src/utils/svelte-view/View.svelte'), // join('src/views', page),
        external: !ssr,
        plugins: [
            replace({
                values: {
                    __view__: join('../../views', page)
                },
                preventAssignment: true
            }),
            alias({
                entries: {
                    layout: join(__dirname, '../../views/layout')
                }
            }),
            svelte({
                compilerOptions: {
                    dev: !production,
                    generate: ssr ? 'ssr' : 'csr',
                    hydratable: true,
                    accessors: !production
                },
                preprocess: {
                    style: less({
                        sourceMap: false
                    })
                },
                emitCss: false
            }),
            resolve({
                browser: true,
                dedupe: ['svelte']
            }),
            commonjs(),
            production && terser()
        ]
    };
}
