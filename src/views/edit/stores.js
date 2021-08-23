import { derived, writable } from 'svelte/store';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';
import httpReq from '@datawrapper/shared/httpReq';

export const chart = new writable({});
export const data = new writable('');
export const hasUnsavedChanges = new writable(false);
export const unsavedChanges = {};

export function initChartStore(rawChart) {
    chart.set(rawChart);
    let prevState;

    const allowedChartKeys = new Set([
        'title',
        'theme',
        'type',
        'metadata',
        'language',
        'external_data',
        'last_edit_step'
    ]);

    const patchChartSoon = debounce(async function (id) {
        const savedKeys = Object.keys(unsavedChanges);

        if (savedKeys.length) {
            const payload = {};
            savedKeys.forEach(k => {
                payload[k] = unsavedChanges[k];
                delete unsavedChanges[k];
            });
            const res = await httpReq.patch(`/v3/charts/${id}`, {
                payload
            });
            if (!Object.keys(unsavedChanges).length) {
                hasUnsavedChanges.set(false);
            }
        }
    }, 1000);

    chart.subscribe(value => {
        if (!prevState && value.id) {
            // initial set
            prevState = cloneDeep(value);
        } else if (prevState && !isEqual(prevState, value)) {
            const payload = {};
            let newUnsaved = false;
            Object.keys(value).forEach(key => {
                if (!isEqual(value[key], prevState[key])) {
                    if (allowedChartKeys.has(key)) {
                        newUnsaved = true;
                        unsavedChanges[key] = cloneDeep(value[key]);
                    } else {
                        // restore prev value
                        value[key] = prevState[key];
                    }
                }
            });
            prevState = cloneDeep(value);
            if (newUnsaved) {
                hasUnsavedChanges.set(true);
                patchChartSoon(value.id);
            }
        }
    });
}

export function initDataStore(chartId, rawData) {
    let prevState;
    let unsavedState;

    data.set(rawData);

    const storeDataSoon = debounce(async function () {
        const res = await httpReq.put(`/v3/charts/${chartId}/data`, {
            body: unsavedState,
            headers: {
                // @todo: handle json data as well
                'Content-Type': 'text/csv'
            }
        });
        if (!Object.keys(unsavedChanges).length) {
            hasUnsavedChanges.set(false);
        }
    }, 1000);

    data.subscribe(value => {
        if (!prevState && value !== undefined) {
            // initial set
            prevState = cloneDeep(value);
        } else if (prevState && !isEqual(prevState, value)) {
            unsavedState = value;
            hasUnsavedChanges.set(true);
            storeDataSoon();
        }
    });
}
