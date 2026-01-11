/**
 * contact-form-submission controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::contact-form-submission.contact-form-submission',
  ({ strapi }) => ({
    async create(ctx) {
      try {
        const { formData } = ctx.request.body.data;

        if (!formData) {
          return ctx.badRequest('Form data is required');
        }

        // Get IP address and user agent
        const rawIp = ctx.request.ip || ctx.request.headers['x-forwarded-for'] || 'unknown';
        const ipAddress = Array.isArray(rawIp) ? rawIp[0] : rawIp;
        const userAgent = ctx.request.headers['user-agent'] || 'unknown';

        // Create the submission
        const submission = await strapi.entityService.create(
          'api::contact-form-submission.contact-form-submission',
          {
            data: {
              formData,
              submittedAt: new Date(),
              ipAddress,
              userAgent,
            },
          }
        );

        return ctx.send({
          data: submission,
          message: 'Form submitted successfully',
        });
      } catch (error) {
        console.error('Error creating contact form submission:', error);
        return ctx.internalServerError('Failed to submit form');
      }
    },
  })
);
