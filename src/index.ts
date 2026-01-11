// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Set permissions for contact form submissions
    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (publicRole) {
      const permissions = [
        {
          action: 'api::contact-form-submission.contact-form-submission.create',
          subject: null,
        },
        {
          action: 'api::global-contact-form-submission.global-contact-form-submission.create',
          subject: null,
        },
        {
          action: 'api::job-application.job-application.create',
          subject: null,
        },
        {
          action: 'plugin::upload.content-api.upload',
          subject: null,
        },
      ];

      for (const permission of permissions) {
        const existingPermission = await strapi
          .query('plugin::users-permissions.permission')
          .findOne({
            where: {
              action: permission.action,
              role: publicRole.id,
            },
          });

        if (existingPermission && !existingPermission.enabled) {
          await strapi
            .query('plugin::users-permissions.permission')
            .update({
              where: { id: existingPermission.id },
              data: { enabled: true },
            });
        }
      }

      console.log('✅ Public permissions set for contact form submissions and job applications');
    }
  },
};
