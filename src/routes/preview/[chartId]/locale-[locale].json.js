import path from 'path';
import fs from 'fs-extra';

export async function get(req, res, next) {
    const { locale } = req.params;

    const locales = {
        dayjs: await loadVendorLocale('dayjs', locale),
        numeral: await loadVendorLocale('numeral', locale)
    };

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(locales));
}

async function loadVendorLocale(vendor, locale) {
    const basePath = path.resolve(
        __dirname,
        '../../../node_modules/@datawrapper/locales/locales/',
        vendor
    );
    const culture = locale.replace('_', '-').toLowerCase();
    const tryFiles = [`${culture}.js`];
    if (culture.length > 2) {
        // also try just language as fallback
        tryFiles.push(`${culture.substr(0, 2)}.js`);
    }
    for (let i = 0; i < tryFiles.length; i++) {
        const file = path.join(basePath, tryFiles[i]);
        try {
            return await fs.readFile(file, 'utf-8');
        } catch (e) {
            // file not found, so try next
        }
    }
    // no locale found at all
    return 'null';
}
