/**
 * global-contact-form-submission controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::global-contact-form-submission.global-contact-form-submission',
  ({ strapi }) => ({
    async create(ctx) {
      try {
        const { formData } = ctx.request.body.data;

        if (!formData) {
          return ctx.badRequest('Form data is required');
        }

        // Validate email field
        if (!formData.email || !formData.email.includes('@')) {
          return ctx.badRequest('Valid email is required');
        }

        // Get IP address and user agent
        const rawIp = ctx.request.ip || ctx.request.headers['x-forwarded-for'] || 'unknown';
        const ipAddress = Array.isArray(rawIp) ? rawIp[0] : rawIp;
        const userAgent = ctx.request.headers['user-agent'] || 'unknown';

        // Create the submission
        const submission = await strapi.entityService.create(
          'api::global-contact-form-submission.global-contact-form-submission',
          {
            data: {
              formData,
              submittedAt: new Date(),
              ipAddress,
              userAgent,
            },
          }
        );

        // Send emails
        try {
          const adminEmail = process.env.ADMIN_EMAIL || 'your-admin-email@gmail.com';
          const userEmail = formData.email;
          const userName = formData.firstName || formData.name || 'User';
          
          // Email to Admin
          await strapi.plugins['email'].services.email.send({
            to: adminEmail,
            from: process.env.EMAIL_FROM,
            subject: `New Contact Form Submission from ${userName}`,
            html: `
              <h2>New Contact Form Submission</h2>
              <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
              <hr />
              ${Object.entries(formData)
                .map(
                  ([key, value]) => `
                <p><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value}</p>
              `
                )
                .join('')}
              <hr />
              <p><strong>IP Address:</strong> ${ipAddress}</p>
              <p><strong>User Agent:</strong> ${userAgent}</p>
            `,
          });

          // Email to User (Confirmation)
          await strapi.plugins['email'].services.email.send({
            to: userEmail,
            from: process.env.EMAIL_FROM,
            subject: 'Thank you for contacting us - Path Infotech',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #d32f2f;">Thank You for Contacting Path Infotech!</h2>
                <p>Dear ${userName},</p>
                <p>We have received your message and appreciate you reaching out to us.</p>
                
                <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
                  <h3 style="margin-top: 0;">Your Submission Details:</h3>
                  ${Object.entries(formData)
                    .map(
                      ([key, value]) => `
                    <p><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value}</p>
                  `
                    )
                    .join('')}
                </div>
                
                <p>Our team will review your inquiry and get back to you as soon as possible.</p>
                <p>If you have any urgent questions, please feel free to contact us directly.</p>
                
                <br />
                <p>Best regards,<br />
                <strong>Path Infotech Team</strong></p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
                <p style="color: #666; font-size: 12px;">
                  This is an automated confirmation email. Please do not reply to this email.
                </p>
              </div>
            `,
          });

          console.log(`Emails sent successfully to ${userEmail} and ${adminEmail}`);
        } catch (emailError) {
          console.error('Error sending emails:', emailError);
          // Don't fail the submission if email fails
          // But you could add a flag to track this
        }

        return ctx.send({
          data: submission,
          message: 'Form submitted successfully',
        });
      } catch (error) {
        console.error('Error creating global contact form submission:', error);
        return ctx.internalServerError('Failed to submit form');
      }
    },
  })
);
