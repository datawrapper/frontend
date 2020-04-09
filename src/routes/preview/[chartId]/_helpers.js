export function createAPI(fetch, headers) {
    async function api(path, { baseUrl = API_BASE_URL, json = true } = {}) {
        const response = fetch(`${baseUrl}${path}`, {
            credentials: 'include',
            mode: 'cors',
            headers
        });

        if (json) {
            const res = await response;
            if (res.ok) {
                return res.json();
            }
            const error = new TypeError(res.statusText);
            error.status = res.status;
            const contentType = res.headers
                .get('content-type')
                .split(';')
                .shift();
            error.debug = {
                url: res.url,
                'response-body':
                    contentType === 'application/json' ? await res.json() : await res.text()
            };
            throw error;
        }
        return response;
    }

    return {
        api
    };
}
