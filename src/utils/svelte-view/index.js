'use strict';

const Hoek = require('@hapi/hoek');
const { join, relative } = require('path');
const { readFile } = require('fs').promises;
const { getView } = require('./cache');
const ejs = require('ejs');

let template;

exports.compile = function compile(t, compileOpts) {
    const baseViewDir = join(__dirname, '../../views');
    const page = relative(baseViewDir, compileOpts.filename);

    return async function runtime(context, renderOpts) {
        renderOpts = Hoek.applyToDefaults(compileOpts, renderOpts);

        if (!template) {
            template = await readFile(join(__dirname, 'template.ejs'), 'utf8');
        }

        const { ssr, error } = await getView(page);

        if (error) {
            // @todo: show a nicer error message on production
            return `
            <h1>Error in template ${error.filename}:${error.start ? error.start.line : ''}</h1>
            <big>${error.message}</big>
            <pre>${error.frame}</pre>`;
        }
        context.props.stores = context.stores;

        // eslint-disable-next-line
        const ssrFunc = new Function(ssr + ';return App');
        const { css, html, head } = ssrFunc().render(context.props);

        const output = ejs.render(template, {
            SSR_HEAD: head,
            SSR_CSS: css.code,
            SSR_HTML: html,
            PAGE: page,
            PAGE_PROPS: JSON.stringify(context.props),
            DW_DEV_MODE: process.env.DW_DEV_MODE
        })

        return output;
    };
};

exports.context = require('./context');
