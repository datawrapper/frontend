const { writable, get } = require('svelte/store');

/*
 * the placeholder store values are getting
 * replaced in utils/svelte-view/index
 */
module.exports.config = writable('__CONFIG_STORE__');
module.exports.user = writable('__USER_STORE__');
module.exports.messages = writable('__MESSAGES_STORE__');
module.exports.request = writable('__REQUEST_STORE__');
module.exports.adminPages = writable('__ADMIN_PAGES_STORE__');
module.exports.get = get;
