const createChart = require('@datawrapper/service-utils/createChart');
const Joi = require('@hapi/joi');

module.exports = {
    name: 'routes/preview',
    version: '1.0.0',
    register: async (server, options) => {
        server.route({
            method: 'GET',
            options: {
                validate: {
                    params: Joi.object({
                        type: Joi.string()
                            .required()
                            .valid('chart', 'map', 'table')
                    })
                }
            },
            path: '/{type}',
            handler: async (request, h) => {

            }
        });
    }
};
