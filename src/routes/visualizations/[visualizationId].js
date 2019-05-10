import fetch from 'node-fetch';

export async function get(req, res, next) {
    const { visualizationId } = req.params;

    const vis = await (await fetch(`${API_LEGACYAPI}/visualizations/${visualizationId}`)).json();

    if (vis.status === 'ok') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(vis.data));
    } else {
        next();
    }
}
