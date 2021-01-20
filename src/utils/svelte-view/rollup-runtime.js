'use strict';

const rollup = require('rollup');
const svelte = require('rollup-plugin-svelte');
const { default: resolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const alias = require('@rollup/plugin-alias');

const { join } = require('path');

const production = process.env.NODE_ENV === 'production';

module.exports = async function build(page, ssr) {
    const bundle = await rollup.rollup({
        input: join('src/views', page),
        external: !ssr && ['lib/stores'],
        plugins: [
            alias({
                entries: ssr
                    ? {
                          'lib/stores': join(__dirname, '../../views/stores'),
                          layout: join(__dirname, '../../views/layout')
                      }
                    : {
                          layout: join(__dirname, '../../views/layout')
                      }
            }),
            svelte({
                compilerOptions: {
                    dev: !production,
                    generate: ssr ? 'ssr' : 'csr',
                    hydratable: true
                },
                emitCss: false
            }),
            resolve({
                browser: true,
                dedupe: ['svelte']
            }),
            commonjs()
        ]
    });

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
