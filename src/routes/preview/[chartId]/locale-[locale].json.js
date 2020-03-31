import path from 'path';
import fs from 'fs-extra';

const VENDORS = ['dayjs', 'numeral'];
const LOCALES = {};
let localesPreloadedAt;

export async function get(req, res, next) {
    const { locale } = req.params;

    const locales = {};
    for (var i = 0; i < VENDORS.length; i++) {
        locales[VENDORS[i]] = await loadVendorLocale(VENDORS[i], locale);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Last-Modified', localesPreloadedAt);
    res.setHeader('Cache-Control', 'public');
    res.setHeader('Cache-Control', 'max-age=3600');
    res.end(JSON.stringify(locales));
}

async function loadVendorLocale(vendor, locale) {
    const culture = locale.replace('_', '-').toLowerCase();
    const tryLocales = [culture];
    if (culture.length > 2) {
        // also try just language as fallback
        tryLocales.push(culture.split('-')[0]);
    }
    for (let i = 0; i < tryLocales.length; i++) {
        if (LOCALES[vendor].has(tryLocales[i])) {
            return LOCALES[vendor].get(tryLocales[i]);
        }
    }
    // no locale found at all
    return 'null';
}

export async function preloadLocales() {
    for (var i = 0; i < VENDORS.length; i++) {
        const vendor = VENDORS[i];
        LOCALES[vendor] = new Map();
        const basePath = path.resolve(
            __dirname,
            '../../../node_modules/@datawrapper/locales/locales/',
            vendor
        );
        const files = await fs.readdir(basePath);
        for (let i = files.length - 1; i >= 0; i--) {
            const file = files[i];
            if (/.*\.js/.test(file)) {
                const content = await fs.readFile(path.join(basePath, file), 'utf-8')
                LOCALES[vendor].set(path.basename(file, '.js'), content);
            }
        }
    }
    localesPreloadedAt = (new Date()).toGMTString();
}