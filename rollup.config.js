import resolve from 'rollup-plugin-node-resolve';
import path from 'path';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';
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

const { general, api, frontend } = DW_CONFIG;
const API_BASE_URL = dev
    ? JSON.stringify(`http${api.https ? 's' : ''}://${api.domain}:${api.port}/v3`)
    : JSON.stringify(`http${api.https ? 's' : ''}://${api.subdomain}.${api.domain}/v3`);

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
        output: config.client.output(),
        plugins: [
            replace({
                'process.browser': true,
                'process.env.NODE_ENV': JSON.stringify(mode),
                API_BASE_URL: API_BASE_URL,
                ...flatten({ api, frontend })
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

            !dev &&
                terser({
                    module: true
                })
        ]
    },

    server: {
        input: config.server.input(),
        output: config.server.output(),
        plugins: [
            replace({
                'process.browser': false,
                'process.env.NODE_ENV': JSON.stringify(mode),
                API_BASE_URL: API_BASE_URL,
                ...flatten(DW_CONFIG)
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

/**
 * Slightly modified version of https://stackoverflow.com/a/19101235 to flatten a deep object.
 * Deep keys are getting concatenated with an underscore.
 *
 * @example
 * flatten({ foo: { bar: 'baz' } })
 * // -> { FOO_BAR: 'baz' }
 *
 * @param {Object} data - deep nested object
 * @returns {Object} - flat object
 */
function flatten(data) {
    const result = {};
    function recurse(cur, prop) {
        if (Object(cur) !== cur) {
            result[prop.toUpperCase()] = typeof cur === 'string' ? JSON.stringify(cur) : cur;
        } else {
            let isEmpty = true;
            for (const p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop + '_' + p : p);
            }
            if (isEmpty && prop) result[prop.toUpperCase()] = {};
        }
    }
    recurse(data, '');
    return result;
}
