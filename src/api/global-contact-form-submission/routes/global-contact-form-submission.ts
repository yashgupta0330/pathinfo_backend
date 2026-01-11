/**
 * global-contact-form-submission router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::global-contact-form-submission.global-contact-form-submission', {
  config: {
    create: {
      auth: false,
    },
  },
});
