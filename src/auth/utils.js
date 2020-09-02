function cookieTTL(days) {
    return 1000 * 3600 * 24 * days; // 1000ms = 1s -> 3600s = 1h -> 24h = 1d
};

function getStateOpts(
    server,
    ttl,
    sameSite = process.env.NODE_ENV === 'development' ? 'None' : 'Lax'
) {
    return {
        isSecure: server.methods.config('frontend').https,
        strictHeader: false,
        domain: `.${server.methods.config('api').domain}`,
        isSameSite: sameSite,
        path: '/',
        ttl: cookieTTL(ttl)
    };
}

module.exports = {
    getStateOpts
};
