const path = require('path');
const fs = require('fs-extra');
const get = require('lodash/get');

module.exports = {
    async loadLocales() {
        const VENDORS = ['dayjs', 'numeral'];
        const locales = [];

        for (const vendor of VENDORS) {
            locales[vendor] = new Map();
            const basePath = path.resolve(
                __dirname,
                '../../../node_modules/@datawrapper/locales/locales/',
                vendor
            );
            const files = await fs.readdir(basePath);
            for (let i = files.length - 1; i >= 0; i--) {
                const file = files[i];
                if (/.*\.js/.test(file)) {
                    const content = await fs.readFile(path.join(basePath, file), 'utf-8');
                    locales[vendor].set(path.basename(file, '.js'), content);
                }
            }
        }
        return locales;
    },

    loadVendorLocale(locales, vendor, locale, team) {
        const culture = locale.replace('_', '-').toLowerCase();
        const tryLocales = [culture];
        if (culture.length > 2) {
            // also try just language as fallback
            tryLocales.push(culture.split('-')[0]);
        }
        for (let i = 0; i < tryLocales.length; i++) {
            if (locales[vendor].has(tryLocales[i])) {
                const localeBase = locales[vendor].get(tryLocales[i]);
                return {
                    base: localeBase,
                    custom: get(team, `settings.locales.${vendor}.${locale.replace('_', '-')}`, {})
                };
            }
        }
        // no locale found at all
        return 'null';
    },

    initCaches(server) {
        const config = server.methods.config();

        const styleCache = server.cache({
            segment: 'vis-styles',
            expiresIn: 86400000 * 365 /* 1 year */,
            shared: true
        });

        const visCache = server.cache({
            segment: 'visualizations',
            expiresIn: 86400000 /* 1 day */,
            shared: true
        });

        const themeCache = server.cache({
            segment: 'themes',
            expiresIn: 86400000 /* 1 day */,
            shared: true
        });

        return {
            async getStyles(api, visId, themeId, transparent) {
                if (get(config, 'general.cache.styles') && !transparent) {
                    const cachedCSS = await styleCache.get(`${themeId}__${visId}`);
                    if (cachedCSS) return cachedCSS;
                }

                return api(
                    `/visualizations/${visId}/styles.css?theme=${themeId}${
                        transparent ? '&transparent=true' : ''
                    }`,
                    {
                        json: false
                    }
                );
            },

            async getVis(api, visId) {
                if (get(config, 'general.cache.visualizations')) {
                    const cachedVis = await visCache.get(visId);
                    if (cachedVis) return cachedVis;
                }

                const vis = await api(`/visualizations/${visId}`);

                if (get(config, 'general.cache.visualizations')) {
                    await visCache.set(visId, vis);
                }

                return vis;
            },

            async getTheme(api, themeId) {
                if (get(config, 'general.cache.themes')) {
                    const cachedTheme = await themeCache.get(themeId);
                    if (cachedTheme) return cachedTheme;
                }

                const theme = await api(`/themes/${themeId}?extend=true`);

                if (get(config, 'general.cache.themes')) {
                    await themeCache.set(themeId, theme);
                }

                return theme;
            }
        };
    }
};
