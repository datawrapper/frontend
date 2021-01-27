const EventEmitter = require('events');

/**
 * Custom event emitter that collects results of event listeners
 *
 * @class FrontendEventEmitter
 * @extends {EventEmitter}
 */
class FrontendEventEmitter extends EventEmitter {
    constructor({ logger } = {}) {
        super();
        this.logger = logger || (() => {});
    }

    /**
     * Emit function that calls all listeners and returns Promise of their results
     *
     * @private
     * @param {string} event - Name of event to emit
     * @param {any} [data] - Data to pass to event listeners
     * @return {Promise} - Promise of event results as array
     * @memberof FrontendEventEmitter
     */
    async __privateEmit(event, data) {
        if (!eventList[event]) {
            throw new TypeError(`Invalid event name (${event})`);
        }

        const listeners = this.listeners(event);

        const result = listeners.map(async func => {
            try {
                const result = await func(data);
                return { status: 'success', data: result };
            } catch (error) {
                if (error.name !== 'CodedError') {
                    // only log unknown errors
                    this.logger().error(error, `[Event] ${event}`);
                }
                return { status: 'error', error };
            }
        });

        return Promise.all(result);
    }

    /**
     * Filter a list of event results
     *
     * @param {array} eventResults - List of event results
     * @param {function|string} filter - Result filter
     * @returns {array|object} - List or single event result
     * @memberof FrontendEventEmitter
     */
    filterEventResults(eventResults, filter) {
        if (typeof filter === 'function') {
            return eventResults.filter(filter);
        }

        if (filter === 'first') {
            const firstResult = eventResults.find(r => r.status === 'success') || {};
            return firstResult.data ? [firstResult.data] : [];
        }

        if (filter === 'success') {
            return eventResults.filter(r => r.status === 'success').map(r => r.data);
        }

        return eventResults;
    }

    /**
     * Emit function with options
     *
     * @param {string} event - Name of event to emit
     * @param {any} [data] - Data to pass to event listeners
     * @param {object} [options] - Options object to modify returned results
     * @param {function|string} [options.filter] - Result filter
     * @return {Promise} - Promise of event results
     * @memberof FrontendEventEmitter
     */
    async emit(event, data, options = {}) {
        const results = await this.__privateEmit(event, data);

        let eventResults = results;
        if (options.filter) {
            eventResults = this.filterEventResults(eventResults, options.filter);

            if (!eventResults.length) {
                const errorResult = results.find(r => r.status === 'error');

                if (errorResult) {
                    throw errorResult.error;
                }
            }
        }

        if (options.filter === 'first') return eventResults[0];

        return eventResults;
    }
}

const eventList = {
    REGISTER_ADMIN_PAGE: 'REGISTER_ADMIN_PAGE'
};

module.exports = { FrontendEventEmitter, eventList };
