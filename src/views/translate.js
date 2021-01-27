const { messages, get } = require('lib/stores');

module.exports = function (key, scope = 'core') {
    const messages_ = get(messages);
    try {
        const msg = messages_[scope];
        return msg[key] || key;
    } catch (e) {
        return key;
    }
};
