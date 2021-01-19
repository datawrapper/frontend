'use strict';

const rollup = require('rollup');
const svelte = require('rollup-plugin-svelte');
const { default: resolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const replace = require('@rollup/plugin-replace');

const { join } = require('path');

const production = process.env.NODE_ENV === 'production';

module.exports = async function build(page, ssr) {
    const bundle = await rollup.rollup({
        input: join('src/views', page),
        plugins: [
            svelte({
                compilerOptions: {
                    dev: !production,
                    generate: ssr ? 'ssr' : 'csr',
                    hydratable: true,
                },
                emitCss: false,
            }),
            resolve({
                browser: true,
                dedupe: ['svelte'],
            }),
            commonjs(),
        ],
    });

    const { output } = await bundle.generate({
        sourcemap: true,
        format: 'iife',
        name: 'App',
        file: 'public/build/bundle.js',
    });

    return output[0].code;
};
