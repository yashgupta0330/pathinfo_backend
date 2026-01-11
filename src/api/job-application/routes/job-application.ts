/**
 * job-application router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::job-application.job-application', {
  config: {
    find: {
      middlewares: [],
    },
    findOne: {
      middlewares: [],
    },
    create: {
      middlewares: [],
    },
    update: {
      middlewares: [],
    },
    delete: {
      middlewares: [],
    },
  },
});
