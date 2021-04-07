'use strict';

const cache = new Map();

function setCache(key, value) {
    cache.set(key, value);
}

async function withCache(key, func) {
    if (!cache.has(key)) {
        const value = await func(key);
        setCache(key, value);
        return value;
    }
    return cache.get(key);
}

module.exports = {
    setCache,
    withCache
};
