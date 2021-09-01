const path = require('path');
const { readdir } = require('fs').promises;
const { Chart } = require('@datawrapper/orm/models');
const { getUserData } = require('@datawrapper/orm/utils/userData');
const uniq = require('lodash/uniq');

module.exports = {
    name: 'routes/dashboard',
    version: '1.0.0',
    register: async (server, options) => {
        server.methods.prepareView('dashboard/Index.svelte');

        const numCharts = 9;

        server.route({
            method: 'GET',
            path: '/',
            options: {
                auth: 'user',
                async handler(request, h) {
                    const user = request.auth.artifacts;
                    const recentlyEditedIds = JSON.parse(
                        await getUserData(user.id, 'recently_edited', '[]')
                    );
                    const recentlyPublishedIds = JSON.parse(
                        await getUserData(user.id, 'recently_published', '[]')
                    );

                    if (recentlyEditedIds.length < numCharts) {
                        const fb = await Chart.findAll({
                            attributes: ['id'],
                            where: {
                                author_id: user.id,
                                deleted: false
                            },
                            order: [['last_modified_at', 'DESC']],
                            limit: 30
                        });
                        fb.forEach(({ id }) => recentlyEditedIds.push(id));
                    }

                    if (recentlyPublishedIds.length < numCharts) {
                        const fb = await Chart.findAll({
                            attributes: ['id'],
                            where: {
                                author_id: user.id,
                                deleted: false
                            },
                            order: [['published_at', 'DESC']],
                            limit: 30
                        });
                        fb.forEach(({ id }) => recentlyPublishedIds.push(id));
                    }
                    return h.view('dashboard/Index.svelte', {
                        props: {
                            recentlyEdited: await getCharts(
                                uniq(recentlyEditedIds).slice(0, numCharts * 2),
                                'last_modified_at'
                            ),
                            recentlyPublished: await getCharts(
                                uniq(recentlyPublishedIds).slice(0, numCharts * 2),
                                'published_at'
                            )
                        }
                    });
                }
            }
        });

        async function getCharts(chartIds, order) {
            return (
                await Chart.findAll({
                    where: {
                        id: chartIds,
                        deleted: false
                    },
                    order: [[order, 'DESC']],
                    limit: numCharts
                })
            ).map(c => {
                const { id, type, theme, title } = c.toJSON();
                const thumbnailHash = c.getThumbnailHash();
                return { id, type, theme, title, thumbnailHash };
            });
        }
    }
};
