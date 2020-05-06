import resolve from '@rollup/plugin-node-resolve';
import path from 'path';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import svelte from 'rollup-plugin-svelte';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import config from 'sapper/config/rollup.js';
import pkg from './package.json';

import { findConfigPath } from '@datawrapper/shared/node/findConfig.js';
const configPath = findConfigPath();

process.stdout.write(`CONFIG_FILE: "${configPath}"\n`);

const DW_CONFIG = require(configPath);

const mode = process.env.NODE_ENV;
const dev = mode === 'development';
const legacy = !!process.env.SAPPER_LEGACY_BUILD;

const { general } = DW_CONFIG;

function onwarn(warning, warn) {
    if (warning.code === 'EVAL') return;
    warn(warning);
}

const nodeResolve = () =>
    resolve({
        customResolveOptions: {
            paths: [general.localPluginRoot],
            moduleDirectory: [
                path.join(__dirname, 'node_modules'),
                path.join(__dirname, 'src', 'node_modules')
            ]
        }
    });

export default {
    client: {
        input: config.client.input(),
        output: {
            ...config.client.output(),
            format: legacy ? 'iife' : 'esm'
        },
        inlineDynamicImports: legacy,
        onwarn,
        plugins: [
            replace({
                'process.browser': true,
                'process.env.NODE_ENV': JSON.stringify(mode)
            }),
            svelte({
                dev,
                hydratable: true,
                emitCss: true
            }),
            nodeResolve(),
            commonjs(),

            legacy &&
                babel({
                    extensions: ['.js', '.mjs', '.html', '.svelte'],
                    runtimeHelpers: true,
                    exclude: ['node_modules/@babel/**'],
                    presets: [
                        [
                            '@babel/preset-env',
                            {
                                targets: '> 0.25%, not dead'
                            }
                        ]
                    ],
                    plugins: [
                        '@babel/plugin-syntax-dynamic-import',
                        [
                            '@babel/plugin-transform-runtime',
                            {
                                useESModules: true
                            }
                        ]
                    ]
                }),

            /* from https://github.com/antony/sapper-ie
               we need to include these babel transformations
               in the non-legacy build for ms edge to work properly */
            !legacy &&
                babel({
                    extensions: ['.js', '.mjs', '.html', '.svelte'],
                    runtimeHelpers: true,
                    exclude: ['node_modules/@babel/**'],
                    plugins: [
                        '@babel/plugin-syntax-dynamic-import',
                        '@babel/plugin-proposal-object-rest-spread'
                    ]
                }),

            !dev &&
                terser({
                    module: true
                })
        ]
    },

    server: {
        input: config.server.input(),
        output: config.server.output(),
        onwarn,
        plugins: [
            replace({
                'process.browser': false,
                'process.env.NODE_ENV': JSON.stringify(mode)
            }),
            svelte({
                generate: 'ssr',
                dev
            }),
            nodeResolve(),
            commonjs()
        ],
        external: Object.keys(pkg.dependencies).concat(require('module').builtinModules)
    }
};
