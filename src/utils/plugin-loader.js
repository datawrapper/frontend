const fs = require('fs');
const path = require('path');
const models = require('@datawrapper/orm/models');
const get = require('lodash/get');
const { promisify } = require('util');
const { addScope } = require('@datawrapper/service-utils/l10n');
const symlink = promisify(fs.symlink);
const unlink = promisify(fs.unlink);
const readFile = promisify(fs.readFile);
const readDir = promisify(fs.readdir);

module.exports = {
    name: 'plugin-loader',
    version: '1.0.0',
    register: async (server, options) => {
        const config = server.methods.config();
        const pluginRoot = config.general.localPluginRoot || path.join(process.cwd(), 'plugins');

        const plugins = Object.keys(config.plugins || [])
            .reduce(getPluginPath, [])
            .map(registerPlugin);

        function getPluginPath(plugins, name) {
            // If available, use .cjs file (ES Module plugin):
            const cjsConfig = path.join(pluginRoot, name, 'frontend.cjs');
            if (fs.existsSync(cjsConfig)) {
                plugins.push({ name, pluginPath: cjsConfig });
                return plugins;
            }

            // Else, use .js file (legacy plugin):
            const jsConfig = path.join(pluginRoot, name, 'frontend.js');
            if (fs.existsSync(jsConfig)) {
                plugins.push({ name, pluginPath: jsConfig });
                return plugins;
            }

            // No plugin file — don't add anything:
            return plugins;
        }

        function registerPlugin({ name, pluginPath }) {
            try {
                const { options = {}, ...plugin } = require(pluginPath);
                const { routes, ...opts } = options;
                return [
                    {
                        name,
                        plugin,
                        options: {
                            models,
                            config: get(config, ['plugins', name], {}),
                            tarball: `https://api.github.com/repos/datawrapper/plugin-${name}/tarball`,
                            ...opts
                        }
                    },
                    { routes }
                ];
            } catch (error) {
                return [{ name, error }];
            }
        }

        if (plugins.length) {
            for (const [{ plugin, options, error, name }, pluginOptions] of plugins) {
                if (error) {
                    server.logger.warn(`[Plugin] ${name}\n\n${logError(pluginRoot, name, error)}`);
                } else {
                    const version = get(plugin, ['pkg', 'version'], plugin.version);
                    server.logger.info(`[Plugin] ${name}@${version}`);
                    // symlink plugin views
                    const pluginViews = path.join(pluginRoot, name, 'src/frontend/views');
                    if (fs.existsSync(pluginViews)) {
                        const target = path.join(__dirname, `../views/plugins/${name}`);
                        if (fs.existsSync(target)) {
                            await unlink(target);
                        }
                        await symlink(pluginViews, target);
                        server.logger.info(
                            `[Plugin] ${name}: created symlink from ${pluginViews} to ${target}`
                        );
                    }

                    // @todo: try to load locales
                    try {
                        const localePath = path.join(pluginRoot, name, 'locale');
                        const locales = await readDir(localePath);
                        options.locales = {};
                        for (let i = 0; i < locales.length; i++) {
                            const file = locales[i];
                            if (file === 'chart-translations.json') {
                                // ignore chart translations
                            } else if (/[a-z]+_[a-z]+\.json/i.test(file)) {
                                options.locales[file.split('.')[0]] = JSON.parse(
                                    await readFile(path.join(localePath, file))
                                );
                            }
                        }
                        addScope(name, options.locales);
                    } catch (e) {}
                    await server.register({ plugin, options }, pluginOptions);
                }
            }
        }
        // emit PLUGINS_LOADED event so plugins who depend on other
        // plugins can safely initialize
        await server.app.events.emit(server.app.event.PLUGINS_LOADED, { plugins });
    }
};

function logError(pluginRoot, name, error) {
    if (error.code === 'MODULE_NOT_FOUND') {
        return `- skipped plugin ${name}
    Reason: \`frontend.[cjs,js]\` doesn't exist or a dependency is not installed.\n    Error: ${error.message}\n`;
    }

    return `

Loading plugin [${name}] failed! Maybe it is not properly installed.

Is it available in "plugins/"?
    Tip: run "ls ${pluginRoot} | grep "${name}"
Possible mistakes:
    * Plugin config key doesn't match the plugin folder.
    * Plugin is missing from ${pluginRoot}.

Maybe this error is helpful:
${error.stack}`;
}
