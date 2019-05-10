const fs = require('fs');
const path = require('path');
const util = require('util');

const readFile = util.promisify(fs.readFile);

export async function get(req, res, next) {
    const { script } = req.params;
    /**
     * TODO: come up with a better solution to dynamically load visualization render code.
     * Could be solved by somehow building up a map of visualization plugins and src files they use.
     *
     * @example
     * const srcFiles = {
     *   'd3-lines': 'd3-lines/static/d3-lines.js',
     *   'd3-area': 'd3-lines/static/d3-area.js'
     * }
     *
     * This would remove the need for the plugin query parameter.
     * Could also query PHP API at `/visualizations/:id`
     */
    const content = await readFile(
        `${GENERAL_LOCALPLUGINROOT}/${req.query.plugin}/static/${script}`,
        {
            encoding: 'utf-8'
        }
    );

    res.setHeader('Content-Type', 'application/javascript');
    res.end(content);
}
