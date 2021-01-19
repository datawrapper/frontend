'use strict';

const Hoek = require('@hapi/hoek');
const { join, dirname, relative } = require('path');
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

        const { ssr, csr, error } = await getView(page);
        if (error) {
            // @todo: show a nicer error message on production
            return `
            <h1>Error in template ${error.filename}:${error.start.line}</h1>
            <big>${error.message}</big>
            <pre>${error.frame}</pre>`;
        }
        const { css, html, head } = ssr().render(context.props);

        const js = `window.app = (function() { ${csr}; return new App({
  target: document.body,
  props: ${JSON.stringify(context.props)},
  hydrate: true
}); })()`;

        const output = template
            .replace('%SSR_HEAD%', head)
            .replace('%SSR_CSS%', css.code)
            .replace('%SSR_HTML%', html)
            .replace('%SCRIPTS%', `<script async defer>${js};</script>`);

        return output;
    };
};
