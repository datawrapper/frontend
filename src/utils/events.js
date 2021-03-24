const FrontendEventEmitter = require('@datawrapper/service-utils/eventEmitter');

const eventList = {
    PLUGINS_LOADED: 'PLUGINS_LOADED',
    REGISTER_ADMIN_PAGE: 'REGISTER_ADMIN_PAGE'
};

module.exports = { FrontendEventEmitter, eventList };
