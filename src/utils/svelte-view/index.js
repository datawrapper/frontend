'use strict';

const Hoek = require('@hapi/hoek');
const { join, relative } = require('path');
const { readFile } = require('fs').promises;
const { getView } = require('./cache');
let template;

exports.compile = function compile(t, compileOpts) {
    const baseViewDir = join(__dirname, '../../views');
    const page = relative(baseViewDir, compileOpts.filename);

    return async function runtime(context, renderOpts) {
        renderOpts = Hoek.applyToDefaults(compileOpts, renderOpts);

        if (!template) {
            template = await readFile(join(baseViewDir, 'template.html'), 'utf8');
        }

        let { ssr, error } = await getView(page);

        if (error) {
            // @todo: show a nicer error message on production
            return `
            <h1>Error in template ${error.filename}:${error.start ? error.start.line : ''}</h1>
            <big>${error.message}</big>
            <pre>${error.frame}</pre>`;
        }
        // replace placeholder store values
        const csrStoresInit = [];
        const storeKeys = Object.keys(context.stores);
        for (let i = 0; i < storeKeys.length; i++) {
            const k = storeKeys[i];
            const value = await Promise.resolve(context.stores[k]);
            const jsonValue = JSON.stringify(value);
            // server-side replacement
            ssr = ssr.replace(
                `'__${k.replace(/([A-Z])/g, '_$1').toUpperCase()}_STORE__'`,
                jsonValue
            );
            // client-side replacement
            csrStoresInit.push(`stores.${k}.set(${jsonValue});`);
        }
        // eslint-disable-next-line
        const ssrFunc = new Function(ssr + ';return App');
        const { css, html, head } = ssrFunc().render(context.props);

        const js = `
require(['App', 'lib/stores'], function(App, stores) {
    ${csrStoresInit.join('\n    ')};
    new App({
      target: document.body,
      props: ${JSON.stringify(context.props)},
      hydrate: true
    });
});`;

        const output = template
            .replace('%SSR_HEAD%', head)
            .replace('%SSR_CSS%', css.code)
            .replace('%SSR_HTML%', html)
            .replace(
                '%SCRIPTS%',
                `
    <script>window.__DW_SVELTE_PROPS__ = { data: '/lib/polyfills' }</script>
    <script src="/lib/chart-core/load-polyfills.js"></script>
    <script>
        document.write('<script type="text/javascript" src="/lib/csr/${page}.'+(window.document.documentMode ? 'ie.' : '')+'js"></s'+'cript>');
    </script>
    <script async defer>${js};</script>`
            );

        return output;
    };
};

exports.context = require('./context');
