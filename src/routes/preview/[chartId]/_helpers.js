import get from '@datawrapper/shared/get';

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
            throw error;
        }
        return response;
    }

    async function getBasemap(chart, data, theme) {
        // TO DO: set default basemap as fallback
        const basemapId = chart.metadata.visualize.basemap;

        let basemap = {};
        let basemapAttribution = null;
        if (basemapId === 'custom_upload') {
            basemap = {
                content: await api(`/charts/${chart.id}/assets/${chart.id}.map.json`),
                meta: {
                    regions: get(chart, 'metadata.visualize.basemapRegions'),
                    projection: {
                        type: get(chart, 'metadata.visualize.basemapProjection')
                    },
                    extent: {
                        padding: false,
                        exclude: {}
                    }
                }
            };

            // gather all unique keys from basemap and include them in metadata
            const keyIds = [];
            basemap.content.objects[basemap.meta.regions].geometries.forEach(geo => {
                for (const key in geo.properties) {
                    if (key !== 'cx' && key !== 'cy' && !keyIds.includes(key)) {
                        keyIds.push(key);
                    }
                }
            });
            const keys = keyIds.map(key => ({ value: key, label: key }));
            basemap.meta.keys = keys;
        } else {
            basemap = await api(`/basemaps/${basemapId}`);
            if (basemap.meta.attribution) {
                let text = 'footer / map data';
                text = get(theme, 'data.options.footer.mapData', text);

                basemapAttribution = {
                    caption: basemap.meta.attribution,
                    text
                };
            }
        }
        basemap.__id = basemapId;
        return { basemap, basemapAttribution };
    }

    async function getLocatorMapData(chart) {
        const isMinimapBoundaryEnabled =
            get(chart, 'metadata.visualize.miniMap.enabled', false) &&
            get(chart, 'metadata.visualize.miniMap.opt') === 'boundary';
        const isHighlightEnabled = get(chart, 'metadata.visualize.highlight.enabled', false);

        let minimap, highlight;

        if (isMinimapBoundaryEnabled) {
            minimap = await api(`/charts/${chart.id}/assets/${chart.id}.minimap.json`, {
                json: false
            }).then(res => res.text());
        }

        if (isHighlightEnabled) {
            highlight = await api(`/charts/${chart.id}/assets/${chart.id}.highlight.json`, {
                json: false
            }).then(res => res.text());
        }

        return { minimap, highlight };
    }

    return {
        api,
        getBasemap,
        getLocatorMapData
    };
}
