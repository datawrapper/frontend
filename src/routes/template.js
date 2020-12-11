const Boom = require('@hapi/boom');
const jsesc = require('jsesc');

module.exports = {
    name: 'routes/template',
    version: '1.0.0',
    async register(server, options) {
        server.route({
            path: '/',
            method: 'POST',
            config: {
                auth: false
            },
            async handler(request, h) {
                console.log('POST', request.payload)
                // if (!request.auth.isAuthenticated) {
                //     throw Boom.unauthorized();
                // }
                const { payload } = request;
                if (!payload) throw Boom.badRequest('you need to send form-encoded data');

                const chartData = {
                    title: payload.title,
                    theme: payload.theme,
                    type: payload.type,
                    language: payload.language,
                    last_edit_step: payload.last_edit_step,
                    forked_from: payload.forked_from,
                    metadata: payload.metadata ? JSON.parse(payload.metadata) : undefined,
                };
                const dataset = payload.data || '';
                const { config } = request.server.methods;
                const api = config('api');
                const { domain, subdomain } = api;
                return h.view('template', {
                    LIBS: [
                        '/static/vendor/requirejs/require.js',
                        '/static/vendor/jquery/jquery.min.js',
                        '/static/vendor/underscore/underscore-min.js',
                        '/lib/chart-core/dw-2.0.min.js'
                    ],
                    API_DOMAIN: `${subdomain}.${domain}`,
                    TEMPLATE_HTML: `
    <script>
        require(['dw/backend/httpReq'], function(httpReq) {
            var chartData = JSON.parse(${jsesc(JSON.stringify(chartData), {
                            isScriptContext: true,
                            json: true,
                            wrap: true
                        })});
            window.openInDatawrapper = function() {
                httpReq.post('/v3/charts', {
                    payload: chartData
                }).then(res => {
                    // upload data
                    httpReq.put('/v3/charts/'+res.id+'/data', {
                        headers: {
                            'Content-Type': 'text/csv'
                        },
                        data: ${JSON.stringify(dataset)}
                    }).then(res2 => {
                        // redirect to chart
                        window.location.href = res.type === 'locator-maps' ? '/edit/'+res.id : '/chart/'+res.id+'/edit';
                    });
                });
            }
        })
    </script>
    <button onclick="openInDatawrapper()">Edit this chart in Datawrappper</button>
`,
                });;
            }
        });
    }
};
