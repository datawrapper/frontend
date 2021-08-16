const { getUserLanguage } = require('./index');

module.exports = {
    name: 'header-links',
    version: '1.0.0',
    async register(server, options) {
        server.app.headerLinks = new Set();

        server.method('registerHeaderLinks', headerLinkFunc => {
            server.app.headerLinks.add(headerLinkFunc);
        });

        server.method('getHeaderLinks', request => {
            const links = [];
            // evaluate links for each request, please use cache!
            server.app.headerLinks.forEach(func => {
                links.push.apply(links, func(request));
            });
            // sort links by order
            return links.sort((a, b) => {
                return a.order !== undefined && b.order !== undefined ? a.order - b.order : 0;
            });
        });

        const frontendConfig = server.methods.config('frontend');

        // add some core header links
        server.methods.registerHeaderLinks(request => {
            const language = getUserLanguage(request.auth);
            const __ = key => server.methods.translate(key, { scope: 'core' });
            return [
                {
                    id: 'dashboard',
                    fontIcon: 'fa fa-fw fa-bar-chart-o',
                    title: __('Dashboard'),
                    url: '/',
                    order: 5
                },
                {
                    id: 'create-new',
                    fontIcon: 'fa fa-fw fa-plus',
                    title: __('Create new <span style="color:#A7A7A7">…</span>'),
                    order: 10,
                    submenuItems: [
                        {
                            id: 'create-chart',
                            svgIcon: 'dw-chart',
                            title: __('Chart'),
                            url: '/create/chart',
                            order: 10
                        },
                        {
                            id: 'create-map',
                            svgIcon: 'dw-map',
                            title: __('Map'),
                            url: '/select/map',
                            order: 20
                        },
                        {
                            id: 'create-table',
                            svgIcon: 'dw-table',
                            title: __('Table'),
                            url: '/create/table',
                            order: 30
                        }
                    ]
                },
                {
                    id: 'my-charts',
                    fontIcon: 'fa fa-fw fa-bar-chart-o',
                    title: __('Archive'),
                    url: '/mycharts',
                    order: 60
                },
                {
                    id: 'separator',
                    order: 69
                },
                {
                    id: 'settings',
                    // fontIcon: 'im im-globe',
                    title: language.substr(0, 2).toLowerCase(),
                    order: 90,
                    submenuItems: (frontendConfig.languages || []).map(({ id, title, flag }) => ({
                        id,
                        title: `<span class="icon">${flag}</span> <span>${title}</span>`
                    }))
                },
                {
                    id: 'settings',
                    fontIcon: 'fa-fw fa fa fa-bars',
                    order: 95,
                    submenuItems: [
                        {
                            url: '/account',
                            title: 'Settings'
                        },
                        {
                            url: '/account/teams',
                            title: 'My teams'
                        },
                        {
                            url: '/account/teams',
                            title: 'Language'
                        },
                        {
                            id: 'separator'
                        },
                        {
                            url: '/account/teams',
                            title: 'Logout'
                        }
                    ]
                }
            ];
        });
    }
};
