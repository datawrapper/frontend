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
                    svgIcon: 'rocket',
                    // fontIcon: 'fa fa-fw fa-bar-chart-o',
                    title: __('Dashboard'),
                    url: '/',
                    order: 5
                },
                {
                    id: 'create-new',
                    svgIcon: 'add',
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
                        },
                        {
                            type: 'activeTeam',
                            order: 999
                        }
                    ]
                },
                {
                    id: 'my-charts',
                    svgIcon: 'cabinet',
                    title: __('Archive'),
                    url: '/mycharts',
                    type: 'visArchive',
                    submenuItems: true,
                    order: 60
                },
                {
                    type: 'separator',
                    order: 69
                },
                // {
                //     id: 'settings',
                //     // fontIcon: 'im im-globe',
                //     title: language.substr(0, 2).toLowerCase(),
                //     order: 90,
                //
                // },
                {
                    id: 'settings',
                    svgIcon: 'menu',
                    svgIconSize: '30px',
                    // svgIconCrisp: true,
                    order: 95,
                    submenuItems: [
                        {
                            url: '/account',
                            title: 'Settings',
                            svgIcon: 'user-menu'
                        },
                        {
                            url: '/account/teams',
                            title: 'My teams',
                            svgIcon: 'team'
                        },
                        {
                            url: '/account/teams',
                            title: 'Language',
                            svgIcon: 'globe',
                            submenuItems: (frontendConfig.languages || []).map(
                                ({ id, title, flag }) => ({
                                    id,
                                    title: `<span class="icon">${flag}</span> <span>${title}</span>`
                                })
                            )
                        },
                        {
                            type: 'separator'
                        },
                        {
                            type: 'html',
                            content:
                                '<span class="has-text-grey is-size-7" style="font-weight:normal">Select active team</span>'
                        },
                        {
                            type: 'separator'
                        },
                        {
                            url: '/account/teams',
                            svgIcon: 'signout',
                            title: 'Logout'
                        }
                    ]
                }
            ];
        });
    }
};
