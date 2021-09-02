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
            const user = request.auth.artifacts;
            const isGuest = !user || user.role === 'guest';
            const language = getUserLanguage(request.auth);
            const __ = key => server.methods.translate(key, { scope: 'core', language });
            return [
                ...(!isGuest
                    ? [
                          {
                              id: 'dashboard',
                              svgIcon: 'launch',
                              // fontIcon: 'fa fa-fw fa-bar-chart-o',
                              title: __('navbar / dashboard'),
                              url: '/',
                              order: 5
                          }
                      ]
                    : []),
                {
                    id: 'create-new',
                    svgIcon: 'add',
                    title: `${__('navbar / create-new')} <span style="color:#A7A7A7">…</span>`,
                    order: 10,
                    submenuItems: [
                        {
                            id: 'create-chart',
                            svgIcon: 'dw-chart',
                            title: __('navbar / create / chart'),
                            url: '/create/chart',
                            order: 10
                        },
                        {
                            id: 'create-map',
                            svgIcon: 'dw-map',
                            title: __('navbar / create / map'),
                            url: '/select/map',
                            order: 20
                        },
                        {
                            id: 'create-table',
                            svgIcon: 'dw-table',
                            title: __('navbar / create / table'),
                            url: '/create/table',
                            order: 30
                        },
                        ...(!isGuest
                            ? [
                                  {
                                      type: 'activeTeam',
                                      order: 999
                                  }
                              ]
                            : [])
                    ]
                },

                // {
                //     id: 'settings',
                //     // fontIcon: 'im im-globe',
                //     title: language.substr(0, 2).toLowerCase(),
                //     order: 90,
                //
                // },
                ...(isGuest
                    ? [
                          {
                              type: 'separator',
                              order: 69
                          },
                          {
                              svgIcon: 'sign-in',
                              title: 'Sign in',
                              type: 'login',
                              url: `/signin?ref=${request.path}`
                          }
                      ]
                    : [
                          {
                              id: 'my-charts',
                              svgIcon: 'cabinet',
                              title: __('My Charts'),
                              url: '/mycharts',
                              order: 60
                          },
                          {
                              id: 'my-charts',
                              type: 'visArchive',
                              submenuItems: true,
                              order: 61,
                              style: 'padding-left: 0;margin-left: -20px;'
                          },
                          {
                              type: 'separator',
                              order: 69
                          }
                      ]),
                {
                    id: 'settings',
                    svgIcon: 'menu',
                    svgIconSize: '30px',
                    // svgIconCrisp: true,
                    order: 95,
                    submenuItems: [
                        ...(!isGuest
                            ? [
                                  {
                                      url: '/account',
                                      title: __('account / settings'),
                                      svgIcon: 'user-menu'
                                  },
                                  {
                                      url: '/account/teams',
                                      title: __('account / my-teams'),
                                      svgIcon: 'team'
                                  }
                              ]
                            : []),
                        {
                            url: '/account/teams',
                            title: __('Language'),
                            svgIcon: 'globe',
                            submenuItems: (frontendConfig.languages || []).map(
                                ({ id, title, flag }) => ({
                                    id,
                                    type: 'language',
                                    svgIcon: id === language ? 'check-circle' : 'circle',
                                    svgIconClass: id === language ? '' : 'has-text-grey-light',
                                    title: `${title}`
                                })
                            )
                        },
                        ...(!isGuest
                            ? [
                                  {
                                      type: 'separator'
                                  },
                                  {
                                      type: 'html',
                                      content: `<span class="has-text-grey is-size-7" style="font-weight:normal">${__(
                                          'account / my-teams / select-active'
                                      )}</span>`
                                  },
                                  {
                                      type: 'teamSelector'
                                  },
                                  {
                                      type: 'separator'
                                  },
                                  {
                                      url: '#/logout',
                                      svgIcon: 'sign-out',
                                      type: 'logout',
                                      title: 'Logout'
                                  }
                              ]
                            : [])
                    ]
                }
            ];
        });
    }
};
