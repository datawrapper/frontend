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

        const { ssr, error } = await getView(page);
        if (error) {
            // @todo: show a nicer error message on production
            return `
            <h1>Error in template ${error.filename}:${error.start ? error.start.line : ''}</h1>
            <big>${error.message}</big>
            <pre>${error.frame}</pre>`;
        }
        const { css, html, head } = ssr().render(context.props);

        const js = `window.app = (function() { return new App({
  target: document.body,
  props: ${JSON.stringify(context.props)},
  hydrate: true
}); })()`;

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
